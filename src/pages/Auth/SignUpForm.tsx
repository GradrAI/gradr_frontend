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
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2Icon } from "lucide-react";
import useStore from "@/state";
import { usePostHog } from '@posthog/react'
import { getRecaptchaToken } from "@/lib/recaptcha";

const formSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    tenant_code: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignUpForm = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const posthog = usePostHog()
  const { saveUser, saveUserToken, accountType, setAccountType } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Read invite params from URL (from admin invite emails)
  const urlTenantCode = searchParams.get("tenant_code") || "";
  const urlAccountType = searchParams.get("accountType") || "";

  useEffect(() => {
    // If coming from an invite link, set the account type
    if (urlAccountType === "joining" && !accountType) {
      setAccountType("joining");
    }
  }, [urlAccountType, accountType, setAccountType]);

  const isJoining = accountType === "joining" || urlAccountType === "joining";

  useEffect(() => {
    if (!accountType && !urlAccountType) {
      nav("../account-type");
    }
  }, [accountType, urlAccountType, nav]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      tenant_code: urlTenantCode,
    },
  });

  const {
    mutate: registerMutate,
    isPending,
    data,
  } = useMutation({
    mutationKey: ["register"],
    mutationFn: ({ values, token }: { values: z.infer<typeof formSchema>; token: string }) => {
      const validatedData = formSchema.parse(values);
      return axios.post(`/auth/register`, {
        ...validatedData,
        accountType: isJoining ? "joining" : accountType,
        confirmPassword: undefined, // exclude confirmPassword before sending
      }, { headers: { "X-Recaptcha-Token": token } });
    }
  });

  const {
    isPending: googleIsPending,
    isError: googleIsError,
    error: googleError,
    data: googleData,
    mutate: googleMutate,
  } = useMutation({
    mutationKey: ["auth"],
    mutationFn: () => axios.get(`/auth/google`),
  });

  const handleGoogleSignUp = async () => {
    posthog.capture("google_auth_initiated", { method: "sign_up" });
    googleMutate();
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Validate org code is provided for joining flow
    if (isJoining && !values.tenant_code?.trim()) {
      toast.error("Organization code is required to join an institution.");
      return;
    }

    const recaptchaToken = await getRecaptchaToken("signup");
    if (!recaptchaToken) { toast.error("Verification failed, please try again."); return; }
    registerMutate({ values, token: recaptchaToken }, {
      onSuccess: (data: any, variables: any, context: any) => {
        if (data.data.success) {
          const { email, membershipStatus } = data.data.data;

          posthog.capture("user_signed_up", { 
            method: "email", 
            account_type: isJoining ? "joining" : accountType,
            membership_status: membershipStatus,
          });

          toast.success(data.data.message || "Account created! Please verify your email.");
          nav(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        }
      },
      onError: (error: any) => {
        const msg =
          error?.response?.data?.error || "Something went wrong. Try again.";
        posthog.capture("registration_failed", { error: msg });
        toast.error(msg);
      },
    });
  }

  useEffect(() => {
    if (googleIsPending) toast.success("Signing you in...");
    if (googleIsError)
      toast.error(googleError?.message || "An error occurred. Please retry");
    if (googleData) window.location.href = googleData?.data?.authorizationUrl;
  }, [googleIsPending, googleIsError, googleError, googleData]);

  return (
    <div className="w-full max-w-md bg-white p-4 rounded-3xl shadow-xl space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-800">
          {isJoining ? "Join your institution" : "Create your account"}
        </h2>
        <p className="text-gray-500 text-sm">
          {isJoining
            ? "Enter your organization code and personal details."
            : "Start grading smarter today."}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Organization Code field for joining flow */}
          {isJoining && (
            <FormField
              control={form.control}
              name="tenant_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Code <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the code from your admin"
                      {...field}
                      className="border-amber-300 focus:border-amber-500"
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    Ask your institution admin for this code.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                name: "first_name",
                label: "First Name",
                placeholder: "John",
              },
              { name: "last_name", label: "Last Name", placeholder: "Doe" },
              {
                name: "username",
                label: "Username",
                placeholder: "johndoe123",
              },
              {
                name: "email",
                label: "Email",
                placeholder: "you@domain.com",
              },
            ].map(({ name, label, placeholder }) => (
              <FormField
                key={name}
                control={form.control}
                name={name as keyof typeof formSchema._type}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input placeholder={placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                    />
                    <div
                      className="absolute right-3 top-2.5 cursor-pointer"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                    />
                    <div
                      className="absolute right-3 top-2.5 cursor-pointer"
                      onClick={() => setShowConfirm((prev) => !prev)}
                    >
                      {showConfirm ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
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
            {isJoining ? "Join Institution" : "Sign Up"}
          </Button>
        </form>
      </Form>

      {!isJoining && (
        <>
          <div className="flex items-center justify-center gap-4 my-4">
            <span className="h-px w-full bg-gray-300" />
            <span className="text-sm text-gray-500">or</span>
            <span className="h-px w-full bg-gray-300" />
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleIsPending}
            className="w-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-xl"
          >
            {googleIsPending && <Loader2Icon className="animate-spin" />}
            Sign up with Google
          </Button>
        </>
      )}

      <div className="text-center text-sm mt-6 text-gray-600">
        Already have an account?{" "}
        <Link
          to="../sign-in"
          className="text-primary hover:underline font-medium"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default SignUpForm;

