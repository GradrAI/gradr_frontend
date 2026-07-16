import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, RefreshCcw } from "lucide-react";

const Success = () => {
  const nav = useNavigate();

  const handleGoToAssessments = () => {
    nav("/app/assessments");
  };

  const handleBackToPricing = () => {
    nav("/auth/pricing");
  };

  return (
    <div className="w-full min-h-[600px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-green-100 shadow-lg text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Received
          </CardTitle>
          <CardDescription className="text-base text-gray-600 mt-2">
            Credits and subscription access are applied by verified webhook. This may take a few seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Button onClick={handleGoToAssessments} className="w-full h-12 text-base">
            Go to Assessments
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={handleBackToPricing} className="w-full h-12 text-base">
            Back to Pricing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
