import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Mail, Send } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().max(30, "Phone number is too long").optional(),
  message: z.string().trim().min(1, "Please enter a message"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const extractMessage = (error: unknown): string | undefined => {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = data.message;
      return typeof message === "string" ? message : undefined;
    }
  }
  return undefined;
};

const ContactForm = () => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["contact"],
    mutationFn: (values: ContactFormValues) =>
      api.post("/contact", {
        name: values.name,
        email: values.email,
        message: values.message,
        phone: values.phone?.trim() ? values.phone.trim() : undefined,
      }),
    onSuccess: () => {
      toast.success("Thanks for reaching out! We'll get back to you shortly.");
      form.reset();
    },
    onError: (error: unknown) => {
      toast.error(
        extractMessage(error) ||
          "Unable to send your message right now. Please try again later."
      );
    },
  });

  const onSubmit = (values: ContactFormValues) => mutate(values);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
      <div>
        <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
          Get in touch
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-8">
          Have a question, want a demo, or exploring GradrAI for your
          institution? Send us a message and our team will respond as soon as
          possible.
        </p>
        <a
          href="mailto:contact@gradrai.com"
          className="inline-flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
        >
          <Mail className="h-5 w-5 text-primary" />
          <span>contact@gradrai.com</span>
        </a>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl shadow-sm p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@domain.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Message <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Tell us how we can help..."
                      className="resize-y min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="w-full font-semibold rounded-xl gap-2"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              {isPending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ContactForm;
