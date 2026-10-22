import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "@/lib/axios";
import { formatNumber } from "@/lib/formatNumber";
import type { PaymentPlan } from "@/types/PaymentPlan";
import { getBillingCopyKey, getPlanDetailKey } from "@/lib/paymentPlanPresentation";
import { usePaymentRail } from "@/hooks/usePaymentRail";
import {
  Users,
  Brain,
  Loader2,
  CreditCard,
  Package,
  Upload,
  Scan,
  Mail,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  FileText,
  Globe,
  PieChart,
  CheckCircle2,
  School,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import "./customMask.css";

import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

import BackedBy from "@/components/landing/BackedBy";
import ContactForm from "@/components/landing/ContactForm";

const Landing = () => {
  const { t, i18n } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const audienceRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setMetaTag = (attribute: "name" | "property", key: string, content: string) => {
      let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    document.title = t("seo.title");
    document.documentElement.lang = i18n.language?.startsWith("fr") ? "fr" : "en";
    document.querySelectorAll('meta[property^="twitter:"]').forEach((element) => element.remove());
    setMetaTag("name", "description", t("seo.description"));
    setMetaTag("name", "keywords", t("seo.keywords"));
    setMetaTag("property", "og:title", t("seo.title"));
    setMetaTag("property", "og:description", t("seo.description"));
    setMetaTag("property", "og:image:alt", t("seo.imageAlt"));
    setMetaTag("property", "og:type", "website");
    setMetaTag("property", "og:url", "https://gradrai.com/");
    setMetaTag("property", "og:image", "https://gradrai.com/og-image.png");
    setMetaTag("name", "twitter:title", t("seo.title"));
    setMetaTag("name", "twitter:description", t("seo.description"));
    setMetaTag("name", "twitter:image:alt", t("seo.imageAlt"));
    setMetaTag("name", "twitter:url", "https://gradrai.com/");
    setMetaTag("name", "twitter:image", "https://gradrai.com/og-image.png");
    setMetaTag("name", "twitter:card", "summary_large_image");

    const schema = document.getElementById("landing-software-schema");
    if (schema?.textContent) {
      const data = JSON.parse(schema.textContent);
      data.description = t("seo.description");
      schema.textContent = JSON.stringify(data);
    }
  }, [i18n.language, t]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const scrollToDemo = (): void => {
    scrollToSection(contactRef);
    contactRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus({ preventScroll: true });
  };

  const scrollToWorkflow = (): void => {
    scrollToSection(howItWorksRef);
    howItWorksRef.current?.focus({ preventScroll: true });
  };


  const audiences = [
    {
      id: "solo",
      icon: Users,
      title: t("audience.solo.title"),
      description: t("audience.solo.description"),
      points: [t("audience.solo.point1"), t("audience.solo.point2"), t("audience.solo.point3")],
    },
    {
      id: "institutions",
      icon: School,
      title: t("audience.institutions.title"),
      description: t("audience.institutions.description"),
      points: [t("audience.institutions.point1"), t("audience.institutions.point2"), t("audience.institutions.point3")],
    },
    {
      id: "trainers",
      icon: FileText,
      title: t("audience.trainers.title"),
      description: t("audience.trainers.description"),
      points: [t("audience.trainers.point1"), t("audience.trainers.point2"), t("audience.trainers.point3")],
    },
  ];

  const solutions = [
    {
      icon: Scan,
      title: t("solutions.aiPaperGrading.title"),
      description: t("solutions.aiPaperGrading.description"),
      color: "from-primary to-primary",
    },
    {
      icon: FileText,
      title: t("solutions.cbtGeneration.title"),
      description: t("solutions.cbtGeneration.description"),
      color: "from-brand-success-500 to-brand-success-600",
    },
    {
      icon: Users,
      title: t("solutions.review.title"),
      description: t("solutions.review.description"),
      color: "from-secondary to-secondary",
    },
    {
      icon: Brain,
      title: t("solutions.smartPrep.title"),
      description: t("solutions.smartPrep.description"),
      color: "from-purple-500 to-indigo-600",
    },
    {
      icon: PieChart,
      title: t("solutions.analytics.title"),
      description: t("solutions.analytics.description"),
      color: "from-orange-500 to-amber-600",
    },
  ];

  const { selectedRail } = usePaymentRail();

  const { data: paymentPlanData, isLoading: plansLoading } = useQuery({
    queryKey: ["paymentPlan", selectedRail],
    queryFn: async () => await api.get(`/paymentPlans`, { params: { rail: selectedRail } }),
    retry: false,
    enabled: !!selectedRail,
    select: (data) => data.data,
  });

  const [pricingTab, setPricingTab] = useState<"subscriptions" | "credit_packs">("subscriptions");

  const subscriptionPlans = useMemo(
    () => (paymentPlanData?.data as PaymentPlan[] || []).filter((p) => p.planType === "subscription" && p.rail === selectedRail),
    [paymentPlanData, selectedRail]
  );
  const creditPacks = useMemo(
    () => (paymentPlanData?.data as PaymentPlan[] || []).filter((p) => p.planType === "credit_pack" && p.rail === selectedRail),
    [paymentPlanData, selectedRail]
  );

  const featuredPlanKeys = ["ngn_educator_monthly", "ngn_institution_monthly", "enterprise_custom"];
  const featuredPlans = selectedRail === "paystack_ngn"
    ? featuredPlanKeys.flatMap((key) => subscriptionPlans.filter((plan) => plan.planKey === key))
    : subscriptionPlans;
  const additionalPlans = selectedRail === "paystack_ngn"
    ? subscriptionPlans.filter((plan) => !featuredPlanKeys.includes(plan.planKey))
    : [];

  const getPlanDetails = (plan: PaymentPlan): string[] =>
    t(`pricing.planDetails.${getPlanDetailKey(plan)}`, { returnObjects: true }) as string[];

  const faqs = (t("faq.items", { returnObjects: true }) as Array<{ question: string; answer: string }>);
  const pricingFaqs = (t("pricing.faq.items", { returnObjects: true }) as Array<{ question: string; answer: string }>);


  const assessmentBenefits = [
    {
      icon: <Scan className="w-7 h-7 text-primary" />,
      title: t("hero.benefits.paperDigital.title"),
      description: t("hero.benefits.paperDigital.description"),
    },
    {
      icon: <FileText className="w-7 h-7 text-secondary" />,
      title: t("hero.benefits.markingGuide.title"),
      description: t("hero.benefits.markingGuide.description"),
    },
    {
      icon: <Brain className="w-7 h-7 text-yellow-500" />,
      title: t("hero.benefits.feedbackPractice.title"),
      description: t("hero.benefits.feedbackPractice.description"),
    },
  ];

  const nav = useNavigate();

  const renderSubscriptionPlan = (plan: PaymentPlan) => (
    <Card
      key={plan._id}
      className={`relative flex flex-col h-full border-2 transition-all duration-300 ${
        plan.highlight
          ? "border-primary shadow-xl scale-105 z-10"
          : "border-border shadow-md hover:shadow-lg hover:border-primary/30"
      }`}
    >
      {plan.highlight && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
          {t("pricing.mostPopular")}
        </div>
      )}
      <CardContent className="p-8 flex flex-col h-full">
        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
        <div className="mb-6">
          <span className="text-3xl font-bold">
            {getPlanDetailKey(plan) === "enterprise"
              ? t("pricing.custom")
              : selectedRail === "paystack_ngn"
                ? `₦${formatNumber(plan.amount)}`
                : `$${plan.amountUsd}`}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{t(getBillingCopyKey(plan))}</p>
        {getPlanDetailKey(plan) !== "enterprise" && plan.credits > 0 && (
          <div className="mb-6 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
            <span className="text-sm font-semibold text-primary">
              {t("pricing.credits", { count: plan.credits })}
            </span>
          </div>
        )}
        <ul className="space-y-3 mb-8 flex-grow">
          {getPlanDetailKey(plan) !== "enterprise" && (
            <li className="text-sm text-muted-foreground">
              {Number.isFinite(plan.validityMonths) && plan.validityMonths > 0
                ? t("pricing.validityMonths", { count: plan.validityMonths })
                : t("pricing.checkValidity")}
            </li>
          )}
          {getPlanDetailKey(plan) !== "enterprise" && plan.maxUsers > 0 && (
            <li className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{t("pricing.userSeats", { count: plan.maxUsers })}</span>
            </li>
          )}
          {getPlanDetails(plan).map((detail) => (
            <li key={detail} className="flex items-start gap-3 text-sm text-foreground/80">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
        <Button
          className={`w-full py-6 text-lg font-bold rounded-xl h-auto whitespace-normal ${
            plan.highlight
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white"
          }`}
          onClick={() => getPlanDetailKey(plan) === "enterprise" ? scrollToDemo() : nav("/auth/account-type")}
        >
          {getPlanDetailKey(plan) === "enterprise" ? t("pricing.contactSales") : t("pricing.getStarted")}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  GradrAI
                </span>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={() => scrollToSection(featuresRef)}
                  className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  {t("nav.solutions")}
                </button>
                <button
                  onClick={() => scrollToSection(audienceRef)}
                  className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  {t("nav.whoItsFor")}
                </button>
                <button
                  onClick={() => scrollToSection(pricingRef)}
                  className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  {t("nav.pricing")}
                </button>
                <button
                  onClick={scrollToDemo}
                  className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  {t("nav.contact")}
                </button>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <LanguageToggle />
              <ThemeToggle />
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-primary"
                onClick={() => {
                  nav(`auth/sign-in`);
                }}
              >
                {t("nav.signIn")}
              </Button>
              <Button
                variant="outline"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => nav("auth/account-type")}
              >
                {t("nav.signUp")}
              </Button>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <LanguageToggle />
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-muted-foreground hover:text-primary p-2"
                aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                {t("nav.solutions")}
              </button>
              <button
                onClick={() => scrollToSection(audienceRef)}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                {t("nav.whoItsFor")}
              </button>
              <button
                onClick={() => scrollToSection(pricingRef)}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                {t("nav.pricing")}
              </button>
              <button
                onClick={scrollToDemo}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                {t("nav.contact")}
              </button>
              <div className="pt-4 pb-3 border-t border-border">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    nav(`auth/sign-in`);
                  }}
                >
                  {t("nav.signIn")}
                </Button>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                  onClick={() => {
                    nav(`auth/account-type`);
                  }}
                >
                  {t("nav.signUp")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-50/50 via-background to-brand-secondary-50/50 dark:from-brand-900/20 dark:via-background dark:to-brand-secondary-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-4 bg-brand-100 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/50 dark:text-brand-300 border-0 px-4 py-1">
              {t("hero.badge")}
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-8 tracking-tight">
              {t("hero.heading")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("hero.headingHighlight")}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              {t("hero.body")}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-6 justify-center items-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-xl rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 max-w-full whitespace-normal h-auto"
                onClick={() => nav("/auth/account-type")}
              >
                {t("hero.signupCta")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary/5 px-10 py-6 text-xl rounded-full transition-all hover:scale-105 max-w-full whitespace-normal h-auto"
                onClick={scrollToDemo}
              >
                {t("hero.demoCta")}
              </Button>
            </div>
            <Button variant="link" className="mt-4 whitespace-normal h-auto" onClick={scrollToWorkflow}>
              {t("hero.workflowCta")}
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            {assessmentBenefits.map((stat, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-xl bg-white/70 dark:bg-white/5 border border-border shadow-sm backdrop-blur-sm transition duration-300 hover:shadow-md"
              >
                <div className="shrink-0">{stat.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BackedBy />

      {/* Problem Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
                {t("problem.heading")} <br />
                <span className="text-primary">{t("problem.headingHighlight")}</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t("problem.body")}
              </p>
              <div className="space-y-4">
                {[
                  t("problem.points.marking"),
                  t("problem.points.feedback"),
                  t("problem.points.admin"),
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <X className="h-5 w-5 text-brand-danger-500" />
                    <span className="text-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-3xl" />
              <Card className="relative border-2 border-border/50 shadow-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{t("problem.card.title")}</h4>
                      <p className="text-sm text-muted-foreground">{t("problem.card.subtitle")}</p>
                    </div>
                  </div>
                  <ul className="space-y-4 list-disc pl-5 text-foreground">
                    {(t("problem.card.items", { returnObjects: true }) as string[]).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="mt-6 w-full h-auto whitespace-normal"
                    onClick={scrollToWorkflow}
                  >
                    {t("problem.card.workflowCta")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution / Product Overview Section */}
      <section ref={featuresRef} className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6">
              {t("solutions.heading")} <span className="text-primary">{t("solutions.headingHighlight")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("solutions.body")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <Card
                key={index}
                className="group p-8 hover:shadow-xl transition-all duration-300 border-border/50 bg-card hover:border-primary/50"
              >
                <CardContent className="p-0 flex flex-col sm:flex-row gap-6">
                  <div className={`shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br ${solution.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <solution.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {solution.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                      {solution.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section ref={howItWorksRef} id="how-it-works" tabIndex={-1} className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6">
              {t("howItWorks.heading")} <span className="text-primary">{t("howItWorks.headingHighlight")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("howItWorks.body")}
            </p>
          </div>

          <Tabs defaultValue="paper" className="max-w-5xl mx-auto">
            <TabsList className="flex flex-col sm:grid w-full sm:grid-cols-2 mb-12 h-auto sm:h-14 p-1 gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <TabsTrigger 
                value="paper" 
                className="w-full text-base sm:text-lg font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary dark:data-[state=active]:bg-slate-700 py-3 sm:py-0 transition-all duration-200"
              >
                {t("howItWorks.paperTab")}
              </TabsTrigger>
              <TabsTrigger 
                value="digital" 
                className="w-full text-base sm:text-lg font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary dark:data-[state=active]:bg-slate-700 py-3 sm:py-0 transition-all duration-200"
              >
                {t("howItWorks.digitalTab")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="paper">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { icon: Scan, title: t("howItWorks.paper.scan.title"), desc: t("howItWorks.paper.scan.desc") },
                  { icon: Upload, title: t("howItWorks.paper.upload.title"), desc: t("howItWorks.paper.upload.desc") },
                  { icon: Brain, title: t("howItWorks.paper.aiGrade.title"), desc: t("howItWorks.paper.aiGrade.desc") },
                  { icon: FileText, title: t("howItWorks.paper.review.title"), desc: t("howItWorks.paper.review.desc") },
                ].map((step, i) => (
                  <div key={i} className="text-center px-4">
                    <div className="h-16 w-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <step.icon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="digital">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { icon: FileText, title: t("howItWorks.digital.create.title"), desc: t("howItWorks.digital.create.desc") },
                  { icon: Globe, title: t("howItWorks.digital.distribute.title"), desc: t("howItWorks.digital.distribute.desc") },
                  { icon: Users, title: t("howItWorks.digital.complete.title"), desc: t("howItWorks.digital.complete.desc") },
                  { icon: PieChart, title: t("howItWorks.digital.review.title"), desc: t("howItWorks.digital.review.desc") },
                ].map((step, i) => (
                  <div key={i} className="text-center px-4">
                    <div className="h-16 w-16 rounded-full bg-brand-success-100 dark:bg-brand-success-900/30 flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <step.icon className="h-8 w-8 text-brand-success-600 dark:text-brand-success-400" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      {/* Use Case / Audience Section */}
      <section ref={audienceRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6">
              {t("audience.heading")} <span className="text-primary">{t("audience.headingHighlight")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("audience.body")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {audiences.map((audience, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-all h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <audience.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{audience.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6 flex-grow">{audience.description}</p>
                  <ul className="space-y-3">
                    {audience.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center text-muted-foreground">
            <p>{t("audience.secondary")}</p>
            <Button variant="link" className="mt-2 whitespace-normal h-auto" onClick={scrollToDemo}>
              {t("contact.heading")}
            </Button>
          </div>
        </div>
      </section>

      {/* Assessment Workflow Fit Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-5xl font-bold mb-8 leading-tight">
                {t("differentiation.heading")} <span className="text-primary">{t("differentiation.headingHighlight")}</span>.
              </h2>
              <div className="space-y-8">
                {[
                  { title: t("differentiation.rubrics.title"), desc: t("differentiation.rubrics.desc") },
                  { title: t("differentiation.people.title"), desc: t("differentiation.people.desc") },
                  { title: t("differentiation.deployment.title"), desc: t("differentiation.deployment.desc") },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center mt-1">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-2">{item.title}</h4>
                      <p className="text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">{t("differentiation.panel.heading")}</h3>
              <Badge variant="outline" className="mb-4 max-w-full whitespace-normal text-sm text-blue-200 border-blue-300/50">
                {t("differentiation.panel.badge")}
              </Badge>
              <p className="text-slate-200 mb-6 leading-relaxed">{t("differentiation.panel.body")}</p>
              <ul className="space-y-4 mb-8">
                {(t("differentiation.panel.items", { returnObjects: true }) as string[]).map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-slate-200 leading-relaxed">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={scrollToDemo} className="max-w-full whitespace-normal h-auto">
                {t("differentiation.panel.cta")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6">
              {t("pricing.heading")} <span className="text-primary">{t("pricing.headingHighlight")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("pricing.body")}
            </p>
          </div>

          {/* Pricing Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center p-1 gap-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setPricingTab("subscriptions")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                  pricingTab === "subscriptions"
                    ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                {t("pricing.plans")}
              </button>
              <button
                onClick={() => setPricingTab("credit_packs")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                  pricingTab === "credit_packs"
                    ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Package className="h-4 w-4" />
                {t("pricing.creditPacks")}
              </button>
            </div>
          </div>

          {plansLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : subscriptionPlans.length === 0 && creditPacks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">{t("pricing.unavailable")}</p>
              <Button className="mt-4 whitespace-normal h-auto" onClick={scrollToDemo}>
                {t("contact.heading")}
              </Button>
            </div>
          ) : pricingTab === "subscriptions" ? (
            /* Subscription Plans */
            <>
              <div className={`grid grid-cols-1 md:grid-cols-2 ${selectedRail === "paystack_ngn" ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-8`}>
                {featuredPlans.map(renderSubscriptionPlan)}
              </div>
              {additionalPlans.length > 0 && (
                <details className="mt-10 rounded-xl border border-border p-6">
                  <summary className="cursor-pointer font-semibold text-foreground">
                    {t("pricing.moreCapacity")}
                  </summary>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {additionalPlans.map(renderSubscriptionPlan)}
                  </div>
                </details>
              )}
              <p className="text-center mt-12 text-muted-foreground">
                {t("pricing.flexibilityPrompt")}{" "}
                <button
                  className="text-primary font-bold hover:underline"
                  onClick={() => setPricingTab("credit_packs")}
                >
                  {t("pricing.browseCreditPacks")}
                </button>{" "}
                {t("pricing.payAsYouGo")}
              </p>
            </>
          ) : (
            /* Credit Packs */
            <>
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <p className="text-muted-foreground">
                    {t("pricing.creditPacksIntro")}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {creditPacks.map((pack) => (
                    <Card
                      key={pack._id}
                      className={`relative flex flex-col h-full border-2 transition-all duration-300 ${
                        pack.highlight
                          ? "border-primary shadow-xl scale-105 z-10"
                          : "border-border shadow-md hover:shadow-lg hover:border-primary/30"
                      }`}
                    >
                      {pack.highlight && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                          {t("pricing.bestValue")}
                        </div>
                      )}
                      <CardContent className="p-8 flex flex-col h-full">
                        <h3 className="text-xl font-bold mb-2">{pack.name}</h3>
                        <div className="mb-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">
                              {selectedRail === "paystack_ngn"
                                ? `₦${formatNumber(pack.amount)}`
                                : `$${pack.amountUsd}`}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">{t(getBillingCopyKey(pack))}</p>
                        <div className="mb-6 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                          <span className="text-sm font-semibold text-primary">
                            {t("pricing.credits", { count: pack.credits })}
                          </span>
                        </div>
                        <div className="space-y-3 mb-8 flex-grow">
                          <p className="text-sm text-muted-foreground">
                            {Number.isFinite(pack.validityMonths) && pack.validityMonths > 0
                              ? t("pricing.validityMonths", { count: pack.validityMonths })
                              : t("pricing.checkValidity")}
                          </p>
                          {getPlanDetails(pack).map((detail) => (
                            <div key={detail} className="flex items-start gap-3 text-sm text-foreground/80">
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          className={`w-full py-6 text-lg font-bold rounded-xl h-auto whitespace-normal ${
                            pack.highlight
                              ? "bg-primary text-white hover:bg-primary/90"
                              : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white"
                          }`}
                          onClick={() => nav("/auth/account-type")}
                        >
                          {t("pricing.buyPack", { name: pack.name })}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <p className="text-center mt-12 text-muted-foreground">
                {t("pricing.bundledPrompt")}{" "}
                <button
                  className="text-primary font-bold hover:underline"
                  onClick={() => setPricingTab("subscriptions")}
                >
                  {t("pricing.viewSubscriptionPlans")}
                </button>.
              </p>
            </>
          )}
          <p className="mt-8 mx-auto max-w-4xl text-center text-sm text-muted-foreground leading-relaxed">
            {t("pricing.notice")}
          </p>
          <div className="mt-8 mx-auto max-w-4xl space-y-3">
            <h3 className="text-center text-sm font-semibold text-foreground">
              {t("pricing.faq.heading")}
            </h3>
            {pricingFaqs.map((item, index) => (
              <details key={index} className="rounded-xl border border-border bg-card p-4">
                <summary className="cursor-pointer text-sm font-semibold text-foreground">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section ref={faqRef} className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
              {t("faq.heading")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("faq.body")}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden border-border/50 shadow-sm">
                <CardContent className="p-0">
                  <button
                    className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    aria-expanded={openFaq === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="text-lg font-bold text-foreground pr-8">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp className="h-6 w-6 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div 
                      id={`faq-answer-${index}`}
                      className="px-8 pb-8 animate-in fade-in duration-300"
                    >
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
            <a href="/privacy-policy" className="text-primary underline underline-offset-4">
              {t("faq.privacyLink")}
            </a>
            <a href="/terms-of-service" className="text-primary underline underline-offset-4">
              {t("faq.termsLink")}
            </a>
            <button onClick={scrollToDemo} className="text-primary underline underline-offset-4">
              {t("faq.contactLink")}
            </button>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            {t("cta.heading")}
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-12 leading-relaxed">
            {t("cta.body")}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-6 justify-center">
            <Button
              size="lg"
              className="bg-background text-primary hover:bg-background/90 px-10 py-7 text-xl font-bold rounded-2xl max-w-full whitespace-normal h-auto"
              onClick={() => nav("/auth/account-type")}
            >
              {t("cta.signupCta")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-primary-foreground bg-transparent hover:bg-white/10 px-10 py-7 text-xl font-bold rounded-2xl max-w-full whitespace-normal h-auto"
              onClick={scrollToDemo}
            >
              {t("cta.demoCta")}
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        ref={contactRef}
        id="demo-contact"
        tabIndex={-1}
        className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/30 border-t border-border/50"
      >
        <div className="max-w-7xl mx-auto">
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer
        className="bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <span className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  GradrAI
                </span>
              </div>
              <p className="text-slate-400 mb-8 max-w-md text-lg leading-relaxed">
                {t("footer.tagline")}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="h-5 w-5 text-primary text-white" />
                  <span>contact@gradrai.com</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6 text-lg">{t("footer.platform")}</h3>
              <ul className="space-y-4">
                <li>
                  <button
                    className="text-slate-400 hover:text-white transition-colors"
                    onClick={() => scrollToSection(featuresRef)}
                  >
                    {t("footer.solutions")}
                  </button>
                </li>
                <li>
                  <button
                    className="text-slate-400 hover:text-white transition-colors"
                    onClick={scrollToWorkflow}
                  >
                    {t("footer.howItWorks")}
                  </button>
                </li>
                <li>
                  <button
                    className="text-slate-400 hover:text-white transition-colors"
                    onClick={() => scrollToSection(pricingRef)}
                  >
                    {t("footer.pricing")}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6 text-lg">{t("footer.support")}</h3>
              <ul className="space-y-4">
                <li>
                  <button
                    className="text-slate-400 hover:text-white transition-colors"
                    onClick={() =>
                      window.open(
                        "mailto:contact@gradrai.com?subject=Help Request",
                        "_blank"
                      )
                    }
                  >
                    {t("footer.helpCenter")}
                  </button>
                </li>
                <li>
                  <button
                    className="text-slate-400 hover:text-white transition-colors"
                    onClick={scrollToDemo}
                  >
                    {t("footer.contactUs")}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-sm">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
            <div className="flex gap-8">
              <button
                className="text-slate-500 hover:text-white text-sm transition-colors"
                onClick={() => nav("privacy-policy")}
              >
                {t("footer.privacy")}
              </button>
              <button
                className="text-slate-500 hover:text-white text-sm transition-colors"
                onClick={() => nav("terms-of-service")}
              >
                {t("footer.terms")}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
