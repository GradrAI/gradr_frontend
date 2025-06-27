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
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2Icon } from "lucide-react";

const formSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignUpForm = () => {
  const nav = useNavigate();
  const [clicked, setClicked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate: registerMutate, isPending } = useMutation({
    mutationKey: ["register"],
    mutationFn: (data: z.infer<typeof formSchema>) =>
      axios.post(`/auth/register`, {
        ...data,
        confirmPassword: undefined, // exclude confirmPassword before sending
      }),
  });

  const handleGoogleSignUp = async () => {
    setClicked(true);
  };

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["auth"],
    queryFn: () => axios.get(`/auth/google`),
    enabled: clicked,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    registerMutate(values, {
      onSuccess: () => {
        toast.success("Account created! You can now sign in.");
        nav("/sign-in/form");
      },
      onError: (error: any) => {
        const msg =
          error?.response?.data?.error || "Something went wrong. Try again.";
        toast.error(msg);
      },
    });
  }

  useEffect(() => {
    if (isLoading) toast.success("Signing you in...");
    if (isError)
      toast.error(error?.message || "An error occurred. Please retry");
    if (data) window.location.href = data?.data?.authorizationUrl;
  }, [isLoading, isError, error, data]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Create your account
          </h2>
          <p className="text-gray-500 text-sm">Start grading smarter today.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 rounded-xl"
            >
              {isPending && <Loader2Icon className="animate-spin mr-2" />}
              Sign Up
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
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="w-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-xl"
        >
          {isLoading && <Loader2Icon className="animate-spin" />}
          <span className="mr-2">🔗</span> Sign up with Google
        </Button>

        <div className="text-center text-sm mt-6 text-gray-600">
          Already have an account?{" "}
          <Link
            to="../sign-in"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
