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
import axios from "axios";
import toast from "react-hot-toast";
import { getRecaptchaToken } from "@/lib/recaptcha";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2Icon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code sent to your email"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: ""
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["resetPassword"],
    mutationFn: ({ values, token }: { values: z.infer<typeof formSchema>; token: string }) => {
      return axios.post(`/auth/reset-password`, {
        email,
        otp: values.otp,
        newPassword: values.newPassword
      }, { headers: { "X-Recaptcha-Token": token } });
    },
    onSuccess: (response) => {
      toast.success(response.data.message || "Password reset successfully. Please log in.");
      nav("/auth/sign-in");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Error resetting password. Invalid OTP.");
    },
  });

  if (!email) {
    nav("/auth/sign-in");
    return null;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const recaptchaToken = await getRecaptchaToken("reset_password");
    if (!recaptchaToken) { toast.error("Verification failed, please try again."); return; }
    mutate({ values, token: recaptchaToken });
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-800">Reset Password</h2>
        <p className="text-gray-500 text-sm">
          Enter the 6-digit code sent to {email} and your new password.
        </p>
      </div>

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
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
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
            Reset Password
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ResetPassword;
