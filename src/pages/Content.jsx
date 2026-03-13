import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, BarChart3 } from "lucide-react";
import useStore from "@/state";

const Content = () => {
  const nav = useNavigate();
  const { accountType } = useStore();

  const organizationFeatures = [
    {
      icon: <Users className="text-blue-600" size={20} />,
      text: "Add up to 50 teachers to your organization",
    },
    {
      icon: <BarChart3 className="text-green-600" size={20} />,
      text: "Get report across all grading activities",
    },
    {
      icon: <Sparkles className="text-purple-600" size={20} />,
      text: "Manage all assessment data in one place",
    },
  ];

  const individualFeatures = [
    {
      icon: <Users className="text-blue-600" size={20} />,
      text: "Grade up to 500 students",
    },
    {
      icon: <BarChart3 className="text-green-600" size={20} />,
      text: "Get report across all grading activities",
    },
    {
      icon: <Sparkles className="text-purple-600" size={20} />,
      text: "Manage all assessment data in one place",
    },
  ];

  const isOrganization = accountType?.toLowerCase() === "institution";
  const isIndividual = accountType?.toLowerCase() === "individual";
  const features = isOrganization ? organizationFeatures : individualFeatures;

  return (
    <div className="w-full h-full flex flex-col items-start justify-center gap-8 p-8">
      <div className="space-y-6 animate-fade-in">
        {isOrganization && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <h1 className="m-0 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to Gradr for Organizations!
              </h1>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Unlock powerful tools designed for educational institutions:
            </p>
          </div>
        )}

        {isIndividual && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"></div>
              <h1 className="text-3xl m-0 font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                Gradr for Individuals!
              </h1>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Experience streamlined grading with powerful individual features:
            </p>
          </div>
        )}

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                {feature.icon}
              </div>
              <p className="text-gray-700 font-medium">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={() => nav("../sign-up")}
        className="self-start bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 py-6 px-12 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Get Started
      </Button>
    </div>
  );
};

export default Content;
