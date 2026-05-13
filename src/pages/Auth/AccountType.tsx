import { useNavigate, Link } from "react-router-dom";
import useStore from "@/state";
import { Brain, Users, School, ArrowRight, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePostHog } from "@posthog/react";

const AccountType = () => {
  const nav = useNavigate();
  const { setAccountType } = useStore();
  const posthog = usePostHog();

  const handleSelect = (type: string) => {
    setAccountType(type);
    posthog.capture("account_type_selected", { account_type: type });
    nav("/auth/sign-up");
  };

  const accountTypes = [
    {
      id: "student",
      title: "Student Mode",
      description: "Practice actual past JAMB/WASSCE exams and get AI feedback",
      icon: Brain,
      color: "from-purple-500 to-indigo-600",
      bgLight: "bg-indigo-50",
      iconColor: "text-indigo-600",
      borderColor: "hover:border-indigo-500",
    },
    {
      id: "individual",
      title: "Solo Educator",
      description: "Grade student papers instantly & generate digital assessments",
      icon: Users,
      color: "from-brand-success-500 to-brand-success-600",
      bgLight: "bg-brand-success-50",
      iconColor: "text-brand-success-600",
      borderColor: "hover:border-brand-success-500",
    },
    {
      id: "institution",
      title: "Institution Admin",
      description: "Manage your school's multi-teacher grading infrastructure",
      icon: School,
      color: "from-primary to-secondary",
      bgLight: "bg-brand-100",
      iconColor: "text-primary",
      borderColor: "hover:border-primary",
    },
    {
      id: "joining",
      title: "Join an Institution",
      description: "Your admin gave you an organization code? Join your institution here",
      icon: UserPlus,
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50",
      iconColor: "text-amber-600",
      borderColor: "hover:border-amber-500",
    },
  ];

  return (
    <div className="w-full max-w-4xl bg-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
          How do you want to use GradrAI?
        </h2>
        <p className="text-muted-foreground text-lg">
          Select your account type to personalise your experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {accountTypes.map((type) => (
          <Card
            key={type.id}
            className={`group cursor-pointer border-2 border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-2 relative overflow-hidden ${type.borderColor}`}
            onClick={() => handleSelect(type.id)}
          >
            {/* Background gradient hint */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity duration-300`}
            />

            <CardContent className="p-8 flex flex-col h-full relative z-10">
              <div
                className={`h-16 w-16 rounded-2xl ${type.bgLight} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}
              >
                <type.icon className={`h-8 w-8 ${type.iconColor}`} />
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-3">{type.title}</h3>
              <p className="text-muted-foreground leading-relaxed flex-grow">
                {type.description}
              </p>

              <div className="mt-8 flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className={type.iconColor}>Continue</span>
                <ArrowRight className={`ml-2 h-4 w-4 ${type.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center pt-6 border-t border-border mt-8">
        <span className="text-muted-foreground">Already have an account?</span>
        <Link
          to="/auth/sign-in"
          className="ml-2 font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default AccountType;

