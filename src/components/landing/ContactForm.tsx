import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();

  const contactSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t("contact.validation.name")),
        email: z.string().trim().email(t("contact.validation.email")),
        phone: z
          .string()
          .trim()
          .max(30, t("contact.validation.phone"))
          .optional(),
        message: z.string().trim().min(1, t("contact.validation.message")),
      }),
    [i18n.language, t]
  );

  type ContactFormValues = z.infer<typeof contactSchema>;

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
      toast.success(t("contact.toast.success"));
      form.reset();
    },
    onError: (error: unknown) => {
      toast.error(
        extractMessage(error) || t("contact.toast.error")
      );
    },
  });

  const onSubmit = (values: ContactFormValues) => mutate(values);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
      <div>
        <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
          {t("contact.heading")}
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-8">
          {t("contact.body")}
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
                    {t("contact.labels.name")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("contact.placeholders.name")} autoComplete="name" {...field} />
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
                    {t("contact.labels.email")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("contact.placeholders.email")}
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
                    {t("contact.labels.phone")}{" "}
                    <span className="text-muted-foreground font-normal">
                      {t("contact.optional")}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={t("contact.placeholders.phone")}
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
                    {t("contact.labels.message")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder={t("contact.placeholders.message")}
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
              {isPending ? t("contact.sending") : t("contact.send")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ContactForm;
