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
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import useStore from "@/state";
import { Link, useNavigate } from "react-router-dom";
import { Loader2Icon, Eye, EyeOff } from "lucide-react";
import { usePostHog } from '@posthog/react'

const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const SignInForm = () => {
  const nav = useNavigate();
  const posthog = usePostHog();
  const { user, accountType, saveUser, saveUserToken, setAccountType } = useStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
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

  const { mutate: loginMutate, isPending } = useMutation({
    mutationKey: ["login"],
    mutationFn: (data: z.infer<typeof formSchema>) => {
      const validatedData = formSchema.parse(data);
      return axios.post(`/auth/login`, validatedData);
    }
  });

  const handleGoogleSignIn = () => {
    if (user && Object.keys(user)?.length) {
      if (user.role === "student") nav("/student/dashboard");
      else nav("/app/assessments");
    } else {
      posthog.capture("google_auth_initiated", { method: "sign_in" });
      googleMutate();
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("expired") && params.get("expired") === "true") {
      toast.error("Session expired, please login again", { id: "session-expired" });
      // Clear the query param without refreshing the page
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (googleIsPending) toast.success("Signing you in...");
    if (googleIsError)
      toast.error(googleError?.message || "An error occurred. Please retry");
    if (googleData) window.location.href = googleData?.data?.authorizationUrl;
  }, [googleIsPending, googleIsError, googleError, googleData]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutate(values, {
      onSuccess: (response) => {
        const { user, token, needsKYC, needsPayment, membershipStatus } = response.data;
        saveUser(user);
        saveUserToken(token);

        posthog.identify(user._id, { 
          email: user.email, 
          name: `${user.first_name} ${user.last_name}`, 
          role: user.role, 
          $set_once: { first_sign_in: new Date().toISOString() } 
        });
        posthog.capture("user_signed_in", { 
          method: "email", 
          role: user.role, 
          needs_kyc: needsKYC, 
          needs_payment: needsPayment,
          membership_status: membershipStatus,
        });

        // Handle membership states
        if (membershipStatus === "pending") {
          toast.success("Your membership request is pending admin approval. You'll be notified once approved.");
          nav("/app/assessments");
          return;
        }

        if (membershipStatus === "denied") {
          toast.error("Your request to join the institution was denied. You can create your own personal account.");
          nav("/auth/account-type");
          return;
        }

        toast.success("Welcome back!");

        if (needsKYC) nav("/auth/kyc");
        else if (needsPayment) nav("/auth/pricing");
        else if (user.role === "student") nav("/student/dashboard");
        else nav("/app/assessments");
      },
      onError: (error) => {
        const errorData = (error as any)?.response?.data;
        
        if (errorData?.isPending) {
          toast.error(errorData.error || "Please verify your email.");
          return nav(`/auth/verify-otp?email=${form.getValues().email}`);
        }

        if (errorData?.useGoogle) {
          toast.error(errorData.error || "Please log in with Google.");
          return;
        }

        console.log("error", error);
        posthog.capture("login_failed", { error: errorData?.error || (error as any)?.message });
        
        toast.error(errorData?.error || "Invalid credentials");
      },
    });
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-800">Welcome back</h2>
        <p className="text-gray-500 text-sm">
          Sign in to access your grading dashboard.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@domain.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
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

          <div className="flex items-center justify-center py-2">
            <p className="text-xs text-gray-500">
              Joining an institution?{" "}
              <span
                onClick={() => {
                  setAccountType("joining");
                  nav("/auth/sign-up");
                }}
                className="font-medium text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
              >
                Sign up here
              </span>
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-xl"
          >
            {isPending && <Loader2Icon className="animate-spin mr-2" />}
            Sign In
          </Button>
        </form>
      </Form>

      <div className="flex items-center justify-center gap-4 my-4">
        <span className="h-px w-full bg-gray-300" />
        <span className="text-sm text-gray-500">or</span>
        <span className="h-px w-full bg-gray-300" />
      </div>

      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleIsPending}
        className="w-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-xl"
      >
        {googleIsPending && <Loader2Icon className="animate-spin" />}
        Sign in with Google
      </Button>

      <div className="text-center text-sm mt-6 text-gray-600">
        Don't have an account?{" "}
        <Link
          to="../account-type"
          className="text-primary hover:underline font-medium"
        >
          Create one
        </Link>
      </div>
    </div>
  );
};

export default SignInForm;
