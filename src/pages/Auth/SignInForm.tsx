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
import { Loader2Icon } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const SignInForm = () => {
  const nav = useNavigate();
  const [clicked, setClicked] = useState(false);
  const { user } = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["auth"],
    queryFn: () => axios.get(`/auth/google`),
    enabled: clicked,
  });

  const { mutate: loginMutate, isPending } = useMutation({
    mutationKey: ["login"],
    mutationFn: (data: z.infer<typeof formSchema>) =>
      axios.post(`/auth/login`, data),
  });

  const handleGoogleSignIn = () => {
    if (user && Object.keys(user)?.length) nav("/app/assessments");
    else setClicked(true);
  };

  useEffect(() => {
    if (isLoading) toast.success("Signing you in...");
    if (isError)
      toast.error(error?.message || "An error occurred. Please retry");
    if (data) window.location.href = data?.data?.authorizationUrl;
  }, [isLoading, isError, error, data]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutate(values, {
      onSuccess: (data) => {
        console.log("data: ", data);
      },
      onError: (error) => {
        console.log("error", error);
        toast.error("Invalid credentials");
      },
    });
  }

  return (
    <div className="w-full flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Welcome back
          </h2>
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="user@org.com" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 rounded-xl"
            >
              {isPending && <Loader2Icon className="animate-spin" />}
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
          disabled={isLoading}
          className="w-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-xl"
        >
          {isLoading && <Loader2Icon className="animate-spin" />}
          <span className="mr-2">🔗</span> Sign in with Google
        </Button>

        <div className="text-center text-sm mt-6 text-gray-600">
          Don't have an account?{" "}
          <Link
            to="../sign-up"
            className="text-blue-600 hover:underline font-medium"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
