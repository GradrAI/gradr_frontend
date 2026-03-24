import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Users,
  Brain,
  Shield,
  Zap,
  Upload,
  Scan,
  BarChart3,
  Mail,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  DollarSign,
  FileText,
  Globe,
  Building2,
  MonitorCheck,
  PieChart,
  Lock,
  CheckCircle2,
  ArrowRight,
  Search,
  School,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import "./customMask.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useStore from "@/state";
import { ThemeToggle } from "@/components/ThemeToggle";

const Landing = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const audienceRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const audiences = [
    {
      id: "schools",
      icon: School,
      title: "Schools & Universities",
      description: "Complete digital transformation for institutional assessments.",
      points: ["Bulk grading of paper scripts", "Class performance tracking", "LMS integration"],
    },
    {
      id: "corporate",
      icon: Briefcase,
      title: "Corporate Organisations",
      description: "Streamline recruitment and internal certification testing.",
      points: ["Proctored online assessments", "Instant candidate screening", "Knowledge, Skills, and Aptitude Testing"],
    },
    {
      id: "professional",
      icon: GraduationCap,
      title: "Professional Bodies",
      description: "Secure, large-scale certification exam delivery and grading.",
      points: ["Standardised exam delivery", "Hybrid paper/digital workflows", "High-integrity proctoring"],
    },
    {
      id: "solo",
      icon: Users,
      title: "Solo Tutors & TAs",
      description: "Save time and provide better feedback to your students.",
      points: ["Quick affordable grading", "Detailed student feedback", "Personalised analytics"],
    },
  ];

  const solutions = [
    {
      icon: Scan,
      title: "AI Paper Grading",
      description: "Upload scanned handwritten scripts and get instant AI-powered grades and feedback.",
      color: "from-primary to-primary",
    },
    {
      icon: FileText,
      title: "CBT Generation",
      description: "Create, distribute, and manage digital assessments with ease.",
      color: "from-brand-success-500 to-brand-success-600",
    },
    {
      icon: MonitorCheck,
      title: "Online Proctoring",
      description: "AI-monitored sessions to ensure examiner integrity and prevent malpractice.",
      color: "from-secondary to-secondary",
    },
    {
      icon: PieChart,
      title: "Advanced Analytics",
      description: "Real-time performance reports for students, educators, and administrators.",
      color: "from-orange-500 to-amber-600",
    },
  ];

  const pricingTiers = [
    {
      name: "Freemium",
      price: { ngn: "0", usd: "0" },
      description: "Perfect for trying out GradrAI",
      features: ["50 scans / month", "Standard AI grading", "Basic analytics", "Email support"],
      cta: "Get Started Free",
      highlight: false,
    },
    {
      name: "Individual",
      price: { ngn: "12,000", usd: "7" },
      description: "Ideal for solo tutors and lecturers",
      features: ["300 scans / month", "Advanced AI feedback", "Detailed reports", "Priority support"],
      cta: "Start Individual Trial",
      highlight: true,
    },
    {
      name: "Organisation",
      price: { ngn: "55,000", usd: "32" },
      description: "Best for schools and small departments",
      features: ["1,500 scans / month", "5-10 user accounts", "Bulk uploads", "CBT distribution"],
      cta: "Join as Organisation",
      highlight: false,
    },
    {
      name: "Enterprise",
      price: { ngn: "Custom", usd: "Custom" },
      description: "For large institutions and corporates",
      features: ["Unlimited scans", "Full LMS integration", "Custom proctoring", "Dedicated account manager"],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  const features = [
    {
      icon: Clock,
      title: "Save 80% of Grading Time",
      description:
        "Automate hours of manual marking and focus on teaching what matters most.",
      color: "from-brand-success-500 to-brand-success-600",
    },
    {
      icon: Brain,
      title: "AI-Powered Accuracy",
      description:
        "Advanced AI technology ensures consistent, bias-free grading across all assessments.",
      color: "from-secondary to-secondary",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description:
        "Get insights into student performance with comprehensive reports and analytics.",
      color: "from-primary to-primary",
    },
    {
      icon: Users,
      title: "Multi-Format Support",
      description:
        "Grade various test formats including essays, short answers, and structured responses.",
      color: "from-orange-500 to-amber-600",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Enterprise-grade security ensures your student data remains protected.",
      color: "from-brand-danger-500 to-brand-danger-600",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description:
        "Get graded results in minutes, not hours, for faster student feedback.",
      color: "from-yellow-500 to-orange-600",
    },
  ];

  const steps = [
    {
      icon: Upload,
      title: "Upload Test Papers",
      description:
        "Simply scan and upload student test papers to our secure platform.",
      color: "from-primary to-primary",
    },
    {
      icon: Scan,
      title: "AI Analysis",
      description:
        "Our advanced AI reads and analyzes each response against your marking criteria.",
      color: "from-secondary to-secondary",
    },
    {
      icon: BarChart3,
      title: "Get Results",
      description:
        "Receive detailed grades and feedback reports for each student instantly.",
      color: "from-brand-success-500 to-brand-success-600",
    },
  ];

  const faqs = [
    {
      question: "How accurate is AI grading compared to manual grading?",
      answer:
        "Our AI achieves 95%+ accuracy rates, often more consistent than human graders due to elimination of fatigue and bias factors.",
    },
    {
      question: "What types of tests can GradrAI handle?",
      answer:
        "GradrAI can grade various formats including multiple choice, short answers, essays, mathematical problems, and structured responses across different subjects.",
    },
    {
      question: "Is my student data secure?",
      answer:
        "Yes, we use enterprise-grade encryption and comply with educational data privacy standards. Your data is never shared with third parties.",
    },
    {
      question: "How long does it take to grade papers?",
      answer:
        "Most assessments are graded within 2-5 minutes, regardless of the number of students or complexity of questions.",
    },
    {
      question: "Can I customize grading criteria?",
      answer:
        "Absolutely! You can set custom marking schemes, rubrics, and weighting for different question types to match your teaching style.",
    },
    {
      question: "Do you offer training and support?",
      answer:
        "Yes, we provide comprehensive onboarding, training sessions, and ongoing support to ensure you get the most out of GradrAI.",
    },
  ];

  const gradingStats = [
    {
      icon: <Clock className="w-7 h-7 text-primary" />,
      title: "80% Less Grading Time",
      description: "Save up to 50 hrs/month vs. manual marking.",
    },
    {
      icon: <DollarSign className="w-7 h-7 text-secondary" />,
      title: "₦50K+ Value Saved",
      description: "Reclaim over ₦50,000 worth of your teaching time.",
    },
    {
      icon: <Zap className="w-7 h-7 text-yellow-500" />,
      title: "500+ Submissions Graded",
      description: "Automate grading for 500+ papers every month.",
    },
  ];

  const nav = useNavigate();
  const { setAccountType } = useStore();

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
                  Solutions
                </button>
                <button
                  onClick={() => scrollToSection(audienceRef)}
                  className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  Who it's for
                </button>
                <button
                  onClick={() => scrollToSection(pricingRef)}
                  className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection(contactRef)}
                  className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  Contact
                </button>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-primary"
                onClick={() => {
                  // let user select account type
                  setAccountType("individual");
                  nav(`auth/sign-in`);
                }}
              >
                Sign In
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Sign Up
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="">
                  <DropdownMenuItem
                    onClick={() => {
                      setAccountType("lecturer");
                      nav("auth/sign-up");
                    }}
                  >
                    As Individual
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setAccountType("institution");
                      nav("auth/sign-up");
                    }}
                  >
                    As Organization
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-muted-foreground hover:text-primary"
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
                Solutions
              </button>
              <button
                onClick={() => scrollToSection(audienceRef)}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                Who it's for
              </button>
              <button
                onClick={() => scrollToSection(pricingRef)}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection(contactRef)}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                Contact
              </button>
              <div className="pt-4 pb-3 border-t border-border">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    setAccountType("individual");
                    nav(`auth/sign-in`);
                  }}
                >
                  Sign In
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
              End-to-End Assessment Platform
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-8 tracking-tight">
              Generate, Deliver, Grade,{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Analyse.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              Empowering educators, schools, and organisations with a unified infrastructure for 
              paper-based and digital assessments. Trusted by institutions across Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-xl rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105"
                onClick={() => nav(`auth/sign-in`)}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary/5 px-10 py-6 text-xl rounded-full transition-all hover:scale-105"
                onClick={() =>
                  window.open(
                    "mailto:contact@gradrai.com?subject=Demo Request",
                    "_blank"
                  )
                }
              >
                Book a Demo
              </Button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            {gradingStats.map((stat, i) => (
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

      {/* Problem Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
                Traditional Assessments are <br />
                <span className="text-primary">Broken and Disconnected.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                From manual grading bottlenecks to high-cost digital infrastructure, maintaining 
                assessment integrity and speed has never been harder for modern institutions.
              </p>
              <div className="space-y-4">
                {[
                  "Inconsistent manual grading and feedback",
                  "Lack of proctoring for online assessments",
                  "Poor student performance insights",
                  "High operational costs for CBT infrastructure",
                  "Disconnected tools for paper and digital",
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
                    <div className="h-12 w-12 rounded-full bg-brand-danger-100 dark:bg-brand-danger-900/30 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-brand-danger-600 dark:text-brand-danger-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Manual Bottleneck</h4>
                      <p className="text-sm text-muted-foreground">Average 15 mins per script</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-brand-danger-500 rounded-full" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Admin Overload</span>
                      <span className="font-bold text-brand-danger-500">85% High</span>
                    </div>
                  </div>
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
              One Platform, <span className="text-primary">Every Assessment.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              GradrAI provides the infrastructure you need to generate, deliver, and grade 
              assessments across the entire lifecycle.
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

      {/* Use Case / Audience Section */}
      <section ref={audienceRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6">
              Designed for Scale and <span className="text-primary">Impact.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you're a solo tutor or a national institution, GradrAI adapts to your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6">
              Streamlined <span className="text-primary">Workflows.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the workflow that fits your assessment needs.
            </p>
          </div>

          <Tabs defaultValue="paper" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-12 h-14 p-1 gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <TabsTrigger value="paper" className="text-lg font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary dark:data-[state=active]:bg-slate-700">
                Paper-based Grading
              </TabsTrigger>
              <TabsTrigger value="digital" className="text-lg font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary dark:data-[state=active]:bg-slate-700">
                Computer-based (CBT)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="paper">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { icon: Scan, title: "Scan", desc: "Scan handwritten scripts using any scanner or mobile app." },
                  { icon: Upload, title: "Upload", desc: "Upload PDFs or images to our secure portal." },
                  { icon: Brain, title: "AI Grade", desc: "AI reads handwriting and applies your marking scheme." },
                  { icon: FileText, title: "Export", desc: "Review results and export to Sheets or LMS." },
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
                  { icon: FileText, title: "Create", desc: "Generate quiz questions using AI or manual entry." },
                  { icon: Globe, title: "Distribute", desc: "Share assessment links with students securely." },
                  { icon: MonitorCheck, title: "Proctor", desc: "Monitor attempts with AI-powered integrity tools." },
                  { icon: PieChart, title: "Analyse", desc: "Instant auto-grading and performance analytics." },
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

      {/* Competitive Differentiation Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-5xl font-bold mb-8 leading-tight">
                Built for the <span className="text-primary">Future of Education</span> in Africa.
              </h2>
              <div className="space-y-8">
                {[
                  { title: "Affordable & Accessible", desc: "Pricing designed for local realities, with global-scale technology." },
                  { title: "Hybrid Workflow", desc: "The only platform that handles both paper scripts and digital tests seamlessly." },
                  { title: "Mobile-First", desc: "Optimised for scenarios with limited high-end hardware infrastructure." },
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
              <h3 className="text-2xl font-bold mb-6">Why GradrAI?</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-700/50 flex justify-between items-center group cursor-default">
                  <span>Hybrid SaaS Model</span>
                  <Badge variant="outline" className="text-primary border-primary">Unique</Badge>
                </div>
                <div className="p-4 rounded-xl bg-slate-700/50 flex justify-between items-center">
                  <span>Fraction of Global Competitor Cost</span>
                  <CheckCircle2 className="h-5 w-5 text-brand-success-400" />
                </div>
                <div className="p-4 rounded-xl bg-slate-700/50 flex justify-between items-center">
                  <span>Local Context Support</span>
                  <CheckCircle2 className="h-5 w-5 text-brand-success-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6">
              Modern Pricing for <span className="text-primary">Modern Educators.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple, transparent pricing that scales with your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative flex flex-col h-full border-2 ${tier.highlight ? 'border-primary shadow-xl scale-105 z-10' : 'border-border shadow-md'}`}>
                {tier.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-8 flex flex-col h-full">
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 h-10">{tier.description}</p>
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">₦{tier.price.ngn}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      (~${tier.price.usd}/mo)
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full py-6 text-lg font-bold rounded-xl ${tier.highlight ? 'bg-primary text-white hover:bg-primary/90' : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white'}`}
                    onClick={() => nav(`auth/sign-in`)}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center mt-12 text-muted-foreground">
            Need more? <button className="text-primary font-bold hover:underline">Add pay-per-scan credits</button> anytime.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            Ready to modernise your assessment lifecycle?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-12 leading-relaxed">
            Join the leading institutions across Africa using GradrAI to deliver faster, 
            fairer, and more consistent grades.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-background text-primary hover:bg-background/90 px-10 py-7 text-xl font-bold rounded-2xl"
              onClick={() => nav(`auth/sign-up`)}
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-black hover:bg-white/10 px-10 py-7 text-xl font-bold rounded-2xl"
              onClick={() =>
                window.open(
                  "mailto:contact@gradrai.com?subject=Demo Request",
                  "_blank"
                )
              }
            >
              Request Demo
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Common Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about the platform.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden border-border/50 shadow-sm">
                <CardContent className="p-0">
                  <button
                    className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
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
                    <div className="px-8 pb-8 animate-in fade-in duration-300">
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        ref={contactRef}
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
                The next-generation assessment infrastructure for schools, 
                professional bodies, and corporate organisations. Built for 
                efficiency, integrity, and scale.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="h-5 w-5 text-primary text-white" />
                  <span>contact@gradrai.com</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6 text-lg">Platform</h3>
              <ul className="space-y-4">
                <li>
                  <button
                    className="text-slate-400 hover:text-white transition-colors"
                    onClick={() => scrollToSection(featuresRef)}
                  >
                    Solutions
                  </button>
                </li>
                <li>
                  <button
                    className="text-slate-400 hover:text-white transition-colors"
                    onClick={() => scrollToSection(howItWorksRef)}
                  >
                    How it Works
                  </button>
                </li>
                <li>
                  <button
                    className="text-slate-400 hover:text-white transition-colors"
                    onClick={() => scrollToSection(pricingRef)}
                  >
                    Pricing
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6 text-lg">Support</h3>
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
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    className="text-slate-400 hover:text-white transition-colors"
                    onClick={() => scrollToSection(contactRef)}
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} GradrAI. All rights reserved. Registered for the Nigerian & Global markets.
            </p>
            <div className="flex gap-8">
              <button
                className="text-slate-500 hover:text-white text-sm transition-colors"
                onClick={() => nav("privacy-policy")}
              >
                Privacy
              </button>
              <button
                className="text-slate-500 hover:text-white text-sm transition-colors"
                onClick={() => nav("terms-of-service")}
              >
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
