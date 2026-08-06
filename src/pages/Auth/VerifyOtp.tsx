import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";
import useStore from "@/state";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePostHog } from "@posthog/react";

const RESEND_COOLDOWN_SECONDS = 30;

const formSchema = z.object({
  // Forgiving by design: trim whitespace and constrain to 6 digits so a pasted
  // code with stray spaces or a non-numeric character gives a clear message
  // instead of the old bare `.length(6)` rejection.
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code sent to your email"),
});

const VerifyOtp = () => {
  const nav = useNavigate();
  const posthog = usePostHog();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  // A pending-account redirect (from Google or password sign-in) drops the user
  // back here holding a stale code. Those sites tag the URL with `?resend=1` so
  // we can send a fresh code on arrival instead of leaving them with a dead one.
  const cameFromPendingRedirect = searchParams.get("resend") === "1";
  const { saveUser, saveUserToken } = useStore();

  const attemptCountRef = useRef(0);
  const autoResendFiredRef = useRef(false);

  // Restore cooldown from sessionStorage so a remount doesn't reset the gate.
  const [cooldown, setCooldown] = useState(() => {
    const stored = sessionStorage.getItem("otp_resend_ts");
    if (!stored) return 0;
    const elapsed = Math.floor((Date.now() - Number(stored)) / 1000);
    const remaining = RESEND_COOLDOWN_SECONDS - elapsed;
    return remaining > 0 ? remaining : 0;
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  const { mutate: verifyMutate, isPending } = useMutation({
    mutationKey: ["verifyOtp"],
    mutationFn: (data: z.infer<typeof formSchema>) => {
      return axios.post(`/auth/verify-otp`, { email, otp: data.otp });
    },
  });

  const { mutate: resendMutate, isPending: isResending } = useMutation({
    mutationKey: ["resendOtp"],
    mutationFn: () => {
      return axios.post(`/auth/resend-otp`, { email });
    },
    onSuccess: () => {
      toast.success("A new code is on its way to your email.");
      sessionStorage.setItem("otp_resend_ts", String(Date.now()));
      setCooldown(RESEND_COOLDOWN_SECONDS);
      posthog?.capture("otp_resend_succeeded");
    },
    onError: (error: unknown) => {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 429) {
        const msg =
          (isAxiosError(error) && error.response?.data?.error) ||
          "Too many resend requests. Please wait before trying again.";
        toast.error(msg);
        // Start a cooldown even on 429 so the button stays disabled.
        sessionStorage.setItem("otp_resend_ts", String(Date.now()));
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        toast.error("Failed to resend OTP.");
      }
      posthog?.capture("otp_resend_failed", {
        rate_limited: status === 429,
      });
    },
  });

  const requestNewCode = (automatic: boolean) => {
    posthog?.capture("otp_resend_requested", { automatic });
    resendMutate();
  };

  // Tick the resend cooldown down to zero.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Break the closed loop: when a pending-account redirect lands here, the code
  // the user is holding is stale, so request a fresh one automatically (once).
  useEffect(() => {
    if (cameFromPendingRedirect && email && !autoResendFiredRef.current) {
      autoResendFiredRef.current = true;
      requestNewCode(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameFromPendingRedirect, email]);

  useEffect(() => {
    if (!email) nav("/auth/sign-in");
  }, [email, nav]);

  if (!email) {
    return null;
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    attemptCountRef.current += 1;
    const attempt = attemptCountRef.current;
    posthog?.capture("otp_verification_attempted", { attempt });

    verifyMutate(values, {
      onSuccess: (response) => {
        const { user, token, needsPassword, needsKYC, needsPayment } = response.data;
        saveUser(user);
        saveUserToken(token);

        posthog?.capture("otp_verification_succeeded", { attempts: attempt });

        toast.success("Email verified successfully!");

        if (needsPassword) nav("/auth/set-password");
        else if (needsKYC) nav("/auth/kyc");
        else if (needsPayment) nav("/auth/pricing");
        else if (user.role === "student") nav("/student/dashboard");
        else nav("/app/assessments");
      },
      onError: (error: unknown) => {
        const message = isAxiosError(error)
          ? error.response?.data?.error || "Invalid or expired OTP"
          : "Invalid or expired OTP";
        posthog?.capture("otp_verification_failed", { attempt, error: message });
        toast.error(message);

        // The submitted code is dead — clear it and refocus so the user isn't
        // left staring at a stale value they'll only retype.
        form.resetField("otp");
        form.setFocus("otp");
      },
    });
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-800">Verify Email</h2>
        <p className="text-gray-500 text-sm">
          Enter the 6-digit code sent to {email}.
        </p>
      </div>

      {cameFromPendingRedirect && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          Your previous code may have expired, so we've sent a fresh 6-digit code
          to your email. Enter the newest one below.
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123456"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-xl"
          >
            {isPending && <Loader2Icon className="animate-spin mr-2" />}
            Verify
          </Button>
        </form>
      </Form>

      <div className="text-center mt-4">
        <Button
          variant="link"
          disabled={isResending || cooldown > 0}
          onClick={() => requestNewCode(false)}
          className="text-sm"
        >
          {isResending ? <Loader2Icon className="animate-spin w-4 h-4 mr-2" /> : null}
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend OTP"}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-600">
        <Link to="/auth/sign-in" className="text-primary hover:underline font-medium">
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default VerifyOtp;
