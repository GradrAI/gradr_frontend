import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import useStore from "@/state";
import PaystackPop from "@paystack/inline-js";
import type { PaymentPlan } from "@/types/PaymentPlan";
import { OrganizationData } from "@/types/OrganizationData";
import api from "@/lib/axios";

const PaymentPlan = () => {
  const nav = useNavigate();
  const { state } = useLocation();
  const { user, token, selectedPaymentPlan, setSelectedPaymentPlan } =
    useStore();

  const { data: paymentPlanData } = useQuery({
    queryKey: ["paymentPlan"],
    queryFn: async () => await api.get(`/paymentPlans`),
    retry: false,
    select: (data) => data.data,
  });

  const {
    isSuccess,
    isPending,
    isError,
    error,
    data,
    mutate: organizationMutate,
  } = useMutation({
    mutationKey: ["organization"],
    mutationFn: async (data: OrganizationData) =>
      await api.post("/organizations", data),
  });

  const { mutate: paymentMutate } = useMutation({
    mutationKey: ["payment"],
    mutationFn: async (data: { email: string; amount: string }) =>
      await api.post("/payment", data),
  });

  const handleSubmit = () => {
    if (selectedPaymentPlan?.name?.toLocaleLowerCase() === "custom") {
      window.open(
        "mailto:support@gradrai.com?subject=Request for custom plan&body=Hello there, I would like to request for a custom plan on your platform",
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    if (!user?.email || !selectedPaymentPlan) {
      toast.error("Missing required information");
      return;
    }

    paymentMutate(
      {
        email: user.email,
        amount: selectedPaymentPlan.amount,
      },
      {
        onSuccess: (data: any, variables: any, context: any) => {
          if (data?.data?.data) {
            const popup = new PaystackPop();
            const { access_code, authorization_url, reference } =
              data.data.data;
            popup.resumeTransaction(access_code);
          }
        },
      }
    );
  };

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="w-full flex flex-wrap flex-col md:flex-row justify-between gap-2">
        {paymentPlanData?.data?.map((plan: PaymentPlan) => (
          <div
            className="p-6 bg-white w-[300px] border-2 rounded-xl flex flex-col justify-between items-start cursor-pointer shadow-lg hover:scale-110"
            onClick={() => setSelectedPaymentPlan(plan)}
            key={plan._id}
          >
            <div className="flex justify-between items-start w-full">
              <p className="text-xl font-semibold m-0">{plan.name}</p>
              <Input
                type="radio"
                name={plan.name}
                checked={selectedPaymentPlan?.name === plan.name}
                className="w-[10px] self-end"
                readOnly
              />
            </div>
            <div className="flex gap-2">
              <p>{plan.currency}</p>
              <p>{plan.amount}</p>
            </div>
            <p>{plan.description}</p>
          </div>
        ))}
      </div>

      <Button className="w-[200px]" onClick={handleSubmit}>
        {isPending ? (
          <div className="h-5 w-5 border-2 rounded-full border-solid border-white border-e-transparent animate-spin transition-all ease-in-out"></div>
        ) : (
          "Submit"
        )}
      </Button>
    </div>
  );
};

export default PaymentPlan;
