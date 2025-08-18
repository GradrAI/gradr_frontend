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
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2Icon } from "lucide-react";
import registerUserLocal from "@/data/registerUserLocal";
import registerUserGoogle from "@/data/registerUserGoogle";
import createOrganisation from "@/data/createOrganisation";
import { IOrganisationPayload, WorkspaceType } from "@/types/IOrganisation";
import createCustomUrl from "@/lib/createCustomUrl";

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

  const { isPending: organizationIsPending, mutate: organizationMutate } =
    useMutation({
      mutationKey: ["organisation"],
      mutationFn: (data: IOrganisationPayload) => createOrganisation(data),
    });

  const { mutate: registerMutate, isPending } = useMutation({
    mutationKey: ["register"],
    mutationFn: (data: z.infer<typeof formSchema>) => registerUserLocal(data),
  });

  const {
    isPending: googleIsPending,
    isError: googleIsError,
    error: googleError,
    data: googleData,
    mutate: googleMutate,
  } = useMutation({
    mutationKey: ["auth"],
    mutationFn: registerUserGoogle,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    registerMutate(values, {
      onSuccess: (data) => {
        if (data.status === "error" || !data.data) {
          toast.error(data.message);
          return;
        }

        toast.success(data.message);
        const {
          data: {
            user: { access_token },
          },
        } = data;

        localStorage.setItem("token", access_token);

        if (!access_token) {
          toast.error("No access token received");
          return;
        }

        const subDomain = `${values?.first_name}${values?.last_name}`;

        organizationMutate(
          {
            data: {
              name: subDomain,
              email: values.email as string,
              physical_address: "",
              phone_number: undefined,
              workspace_type: "personal" as WorkspaceType,
              payment_plan_id: null,
            },
            token: access_token,
          },
          {
            onSuccess: (data) => {
              if (data.status === "error") {
                toast.error(data.message);
                return;
              }
              toast.success(data.message);
              window.location.href = createCustomUrl(
                data.data!.organisation.name
              );

              nav("/auth/pricing");
            },
            onError: (error) => {
              let message = error?.message || "An error occurred";
              let code = 500;

              if (error instanceof AxiosError) {
                message = error.response?.data.message || "Server Unavailable";
                code = error.response?.status || 503;
              }

              toast.error(message);
            },
          }
        );
      },
      onError: (error) => {
        let message = error?.message || "An error occurred";
        let code = 500;

        if (error instanceof AxiosError) {
          message = error.response?.data.message || "Server Unavailable";
          code = error.response?.status || 503;
        }

        toast.error(message);
      },
    });
  }

  if (googleIsPending) toast.success("Signing you in...");
  if (googleIsError) {
    toast.error(googleError?.message || "An error occurred. Please retry");
  }
  if (googleData?.status === "success") {
    window.location.href = googleData.data!.url;
  }

  if (organizationIsPending) {
    toast.success("Creating organisation...");
  }

  return (
    <div className="w-full max-w-md bg-white p-4 rounded-3xl shadow-xl space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-800">
          Create your account
        </h2>
        <p className="text-gray-500 text-sm">Start grading smarter today.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            {[
              {
                name: "first_name",
                label: "First Name",
                placeholder: "John",
              },
              { name: "last_name", label: "Last Name", placeholder: "Doe" },
              // {
              //   name: "username",
              //   label: "Username",
              //   placeholder: "johndoe123",
              // },
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
            type="button"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 rounded-xl"
            onClick={() => onSubmit(form.getValues())}
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
        onClick={() => googleMutate}
        disabled={googleIsPending || organizationIsPending}
        className="w-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-xl"
      >
        {(googleIsPending || organizationIsPending) && (
          <Loader2Icon className="animate-spin" />
        )}
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
  );
};

export default SignUpForm;
