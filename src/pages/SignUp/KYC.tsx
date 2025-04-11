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
    nav("payment-plan");
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Crawford University" {...field} />
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
                  <Input placeholder="Atan-Agbara Road" {...field} />
                </FormControl>
                <FormDescription>
                  This is your organization's physical address.
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
                  <Input
                    placeholder="contact@crawforduniversity.edu.ng"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your organization's email address.
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
                  <Input placeholder="+234 913 718 1263" {...field} />
                </FormControl>
                <FormDescription>
                  This is your organization's contact number.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Proceed</Button>
        </form>
      </Form>
    </div>
  );
};

export default KYC;
