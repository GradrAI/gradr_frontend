import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { User } from "@/types/User";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useStore from "@/state";
import { ErrorResponse } from "@/types/ErrorResponse";

type OrganizationData = {
  name: string;
  physicalAddress: string;
  email: string;
  phoneNumber: string;
  paymentPlan: string;
};

const PaymentPlan = () => {
  const nav = useNavigate();
  const { state } = useLocation();
  const { user, token } = useStore();
  // const { toast } = useToast()
  const [selected, setSelected] = useState("free");

  const { isSuccess, isPending, isError, error, data, mutate } = useMutation({
    mutationKey: ["organization"],
    mutationFn: async (data: OrganizationData) => {
      if (token)
        return await axios.post("/organizations", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
    },
  });

  const handleSubmit = () => {
    mutate({
      ...state,
      paymentPlan: "67de82fe371d472a0931f518",
    });
  };

  useEffect(() => {
    console.log("data: ", data);
    if (isSuccess && data) {
      console.log("data: ", data);
      toast.success("Organization created successfully");
      nav("/app/settings");
    }
    if (isError) {
      console.log("error: ", error);
      toast.error("An error occurred");
    }
  }, [isSuccess, data, isError, error]);
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="w-full flex flex-wrap flex-col md:flex-row justify-between gap-2">
        <div
          className="p-6 w-[200px] border-2 flex flex-col justify-between items-start cursor-pointer shadow-lg hover:scale-110"
          onClick={() => setSelected("free")}
        >
          <Input
            type="radio"
            name="free"
            checked={selected === "free"}
            className="w-[10px] self-end"
            readOnly
          />
          <p className="text-xl font-semibold">Free</p>
          <p>Grade up to 100 users</p>
          <p>Generate unlimited reports</p>
        </div>

        <div
          className="p-6 min-w-[200px] border-2 flex flex-col justify-between items-start cursor-pointer shadow-lg hover:scale-110"
          onClick={() => setSelected("enterprise")}
        >
          <Input
            type="radio"
            name="enterprise"
            checked={selected === "enterprise"}
            className="w-[10px] self-end"
            readOnly
          />
          <p className="text-xl font-semibold">Enterprise</p>
          <p>Grade up to 1000 users</p>
          <p>Add unlimited users</p>
        </div>

        <div
          className="p-6 min-w-[200px] border-2 flex flex-col justify-between items-start cursor-pointer shadow-lg hover:scale-110"
          onClick={() => setSelected("custom")}
        >
          <Input
            type="radio"
            name="custom"
            checked={selected === "custom"}
            className="w-[10px] self-end"
            readOnly
          />
          <p className="text-xl font-semibold">Custom</p>
          <p>Grade up to 1000 users</p>
          <p>Add unlimited users</p>
        </div>
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
