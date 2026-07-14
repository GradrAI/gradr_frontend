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
import { useNavigate } from "react-router-dom";
import { Loader2Icon, ArrowLeft } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

const ForgotPassword = () => {
  const nav = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["forgotPassword"],
    mutationFn: ({ values, token }: { values: z.infer<typeof formSchema>; token: string }) => {
      return axios.post(`/auth/forgot-password`, { email: values.email }, { headers: { "X-Recaptcha-Token": token } });
    },
    onSuccess: (_, variables) => {
      toast.success("Password reset OTP sent to your email.");
      nav(`/auth/reset-password?email=${variables.values.email}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Error sending reset OTP");
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const recaptchaToken = await getRecaptchaToken("forgot_password");
    if (!recaptchaToken) { toast.error("Verification failed, please try again."); return; }
    mutate({ values, token: recaptchaToken });
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in relative">
      <button 
        onClick={() => nav(-1)} 
        className="absolute top-6 left-6 text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="w-5 h-5"/>
      </button>

      <div className="text-center space-y-2 mt-4">
        <h2 className="text-3xl font-extrabold text-gray-800">Forgot Password</h2>
        <p className="text-gray-500 text-sm">
          Enter your email to receive a password reset code.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="you@domain.com" {...field} />
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
            Send Reset Code
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPassword;
