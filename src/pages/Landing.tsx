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
} from "lucide-react";
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
  const faqRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const features = [
    {
      icon: Clock,
      title: "Save 80% of Grading Time",
      description:
        "Automate hours of manual marking and focus on teaching what matters most.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Brain,
      title: "AI-Powered Accuracy",
      description:
        "Advanced AI technology ensures consistent, bias-free grading across all assessments.",
      color: "from-purple-500 to-indigo-600",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description:
        "Get insights into student performance with comprehensive reports and analytics.",
      color: "from-blue-500 to-cyan-600",
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
      color: "from-red-500 to-pink-600",
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
      color: "from-blue-500 to-purple-600",
    },
    {
      icon: Scan,
      title: "AI Analysis",
      description:
        "Our advanced AI reads and analyzes each response against your marking criteria.",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: BarChart3,
      title: "Get Results",
      description:
        "Receive detailed grades and feedback reports for each student instantly.",
      color: "from-green-500 to-blue-600",
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
      icon: <Clock className="w-7 h-7 text-blue-600" />,
      title: "80% Less Grading Time",
      description: "Save up to 50 hrs/month vs. manual marking.",
    },
    {
      icon: <DollarSign className="w-7 h-7 text-purple-600" />,
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
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                  Features
                </button>
                <button
                  onClick={() => scrollToSection(howItWorksRef)}
                  className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  How it Works
                </button>
                <button
                  onClick={() => scrollToSection(faqRef)}
                  className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  FAQ
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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:text-white"
                  >
                    Sign Up
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="">
                  <DropdownMenuItem
                    onClick={() => {
                      setAccountType("individual");
                      nav("auth/sign-up");
                    }}
                  >
                    As Individual
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setAccountType("organization");
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
                Features
              </button>
              <button
                onClick={() => scrollToSection(howItWorksRef)}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection(faqRef)}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                FAQ
              </button>
              <button
                onClick={() => scrollToSection(contactRef)}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                Contact
              </button>
              <div className="pt-4 pb-3 border-t border-border">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-100 hover:to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-300 border-0">
              🚀 Now in Beta - Join Early Access
            </Badge> */}
            <h1 className="text-4xl sm:text-5xl py-6 lg:text-6xl font-bold text-foreground mb-6">
              Break Free From{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Manual Grading
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Save hours of tedious grading with AI-powered automation. Focus on
              what matters most—teaching, mentoring, and fostering innovation in
              your classroom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                onClick={() => nav(`auth/sign-in`)}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-950/20 px-8 py-3 text-lg"
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

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Revolutionize Your Grading Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover how GradrAI transforms traditional assessment workflows
              with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 border-0 bg-card shadow-md hover:scale-[1.02]"
              >
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <div
                      className={`p-3 bg-gradient-to-r ${feature.color} rounded-lg mr-4 shadow-md`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        ref={howItWorksRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50/50 to-gray-100/50 dark:from-slate-900/20 dark:to-gray-900/20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How GradrAI Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started in three simple steps and transform your grading
              workflow forever
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div
                    className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Grading?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join hundreds of educators who are already using AI-assisted grading
            to save time and improve their assessment process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold shadow-lg"
              onClick={() =>
                window.open(
                  "mailto:contact@gradrai.com?subject=Early Access Request",
                  "_blank"
                )
              }
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-blue-600 hover:bg-white hover:text-blue-600 dark:text-white dark:hover:bg-gray-500 px-8 py-3 text-lg shadow-lg"
              onClick={() =>
                window.open(
                  "mailto:contact@gradrai.com?subject=Demo Request",
                  "_blank"
                )
              }
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about GradrAI
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-semibold text-gray-900 dark:text-white pr-8">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 dark:text-white leading-relaxed">
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
        className="bg-gradient-to-br from-gray-900 to-slate-900 dark:from-gray-950 dark:to-slate-950 py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  GradrAI
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Revolutionizing education with AI-powered grading solutions.
                Helping educators save time and improve student outcomes.
              </p>
              <div className="flex flex-row items-center gap-5 pl-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-800"
                  onClick={() =>
                    window.open("mailto:contact@gradrai.com", "_blank")
                  }
                >
                  <Mail className="h-5 w-5" />
                </Button>
                 <div className="flex items-center gap-5">
                  <a href="https://x.com/gradrai" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                    <img 
                      src="https://about.x.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png" 
                      className="h-5 w-5 invert object-contain" 
                      alt="X"
                    />
                  </a>
                  <a href="https://www.linkedin.com/company/gradrai" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                    <img 
                      src="https://content.linkedin.com/content/dam/me/business/en-us/amp/xbu/linkedin-revised-brand-guidelines/downloads/fg/brandg-business-in-logo-dsk-v03.png/jcr:content/renditions/brandg-business-in-logo-dsk-v03-2x.png"
                      className="h-5 w-5 object-contain" 
                      alt="LinkedIn"
                    />
                  </a>
                  <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                    <img 
                      src="https://facebook.com/images/fb_icon_325x325.png" 
                      className="h-5 w-5 object-contain" 
                      alt="Facebook"
                    />
                  </a>
                </div>
              </div>
              {/* supported by */}
              
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-6">
                Supported By
              </span>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-8 md:gap-12">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" 
                  alt="Google" 
                  className="h-6 md:h-7 transition-transform duration-300 hover:scale-110 cursor-pointer" 
                />
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg" 
                  alt="MongoDB" 
                  className="h-7 md:h-8 transition-transform duration-300 hover:scale-110 cursor-pointer" 
                />
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={() => scrollToSection(featuresRef)}
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={() => scrollToSection(howItWorksRef)}
                  >
                    How it Works
                  </button>
                </li>
                <li>
                  <button
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={() =>
                      window.open(
                        "mailto:contact@gradrai.com?subject=Pricing Inquiry",
                        "_blank"
                      )
                    }
                  >
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <div className="flex items-start gap-6">
                {/* Support Links */}
                <ul className="space-y-2">
                  <li>
                    <button
                      className="text-gray-400 hover:text-white transition-colors"
                      onClick={() => window.open("mailto:contact@gradrai.com?subject=Help Request", "_blank")}
                    >
                      Help Center
                    </button>
                  </li>
                  <li>
                    <button
                      className="text-gray-400 hover:text-white transition-colors"
                      onClick={() => scrollToSection(contactRef)}
                    >
                      Contact Us
                    </button>
                  </li>
                  <li>
                    <button
                      className="text-gray-400 hover:text-white transition-colors"
                      onClick={() => window.open("mailto:contact@gradrai.com?subject=Demo Request", "_blank")}
                    >
                      Book Demo
                    </button>
                  </li>
                </ul>

              </div>
            </div>
            
            
          </div>


      

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} GradrAI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </button>
              <button className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
