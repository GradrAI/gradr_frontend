import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import parsePhoneNumber from "libphonenumber-js";
import useStore from "@/state";
import { OrganizationData } from "@/types/OrganizationData";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  physicalAddress: z.string().min(2).max(50),
  email: z.string().email(),
  phoneNumber: z.string().refine(
    (value) => {
      const phoneNumber = parsePhoneNumber(value);
      return phoneNumber ? phoneNumber.isValid() : false;
    },
    {
      message: "Invalid phone number",
    }
  ),
});

const KYC = () => {
  const nav = useNavigate();
  const { appendOrganizationData } = useStore();

  const form = useForm<OrganizationData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      physicalAddress: "",
      email: "",
      phoneNumber: "",
    },
  });

  const onsubmit = (values: OrganizationData) => {
    appendOrganizationData(values);
    nav("pricing");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 animate-fade-in space-y-6 border border-gray-200">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            🧾
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Organization KYC</h2>
          <p className="text-gray-500 max-w-md">
            Tell us about your institution so we can tailor your grading
            experience.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Amazing University" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your organization's name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="physicalAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Campus Road" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your head office or campus address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="contact@yourorg.edu.ng" {...field} />
                  </FormControl>
                  <FormDescription>
                    We’ll send updates and notifications here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+234 123 456 7890" {...field} />
                  </FormControl>
                  <FormDescription>
                    Organization’s official contact number.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-medium py-2 rounded-xl transition-all duration-200"
            >
              Proceed
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default KYC;
