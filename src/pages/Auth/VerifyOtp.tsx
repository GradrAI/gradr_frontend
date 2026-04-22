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
import useStore from "@/state";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";

const formSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 characters"),
});

const VerifyOtp = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const { saveUser, saveUserToken } = useStore();

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
    onSuccess: () => toast.success("OTP sent to your email."),
    onError: () => toast.error("Failed to resend OTP."),
  });

  if (!email) {
    nav("/auth/sign-in");
    return null;
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    verifyMutate(values, {
      onSuccess: (response) => {
        const { user, token, needsPassword, needsKYC, needsPayment } = response.data;
        saveUser(user);
        saveUserToken(token);

        toast.success("Email verified successfully!");

        if (needsPassword) nav("/auth/set-password");
        else if (needsKYC) nav("/auth/kyc");
        else if (needsPayment) nav("/auth/pricing");
        else if (user.role === "student") nav("/student/dashboard");
        else nav("/app/assessments");
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.error || "Invalid OTP");
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <Input placeholder="123456" maxLength={6} {...field} />
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
          disabled={isResending}
          onClick={() => resendMutate()}
          className="text-sm"
        >
          {isResending ? <Loader2Icon className="animate-spin w-4 h-4 mr-2" /> : null}
          Resend OTP
        </Button>
      </div>
    </div>
  );
};

export default VerifyOtp;
