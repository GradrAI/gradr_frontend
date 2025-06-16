import useStore from "@/state";
import { OrganizationData } from "@/types/OrganizationData";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

const PostPayment = () => {
  const nav = useNavigate();
  const { user, token, selectedPaymentPlan, organizationData } = useStore();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");

  const { data, isSuccess, isLoading, isError, error } = useQuery({
    queryKey: ["verifyPayment"],
    queryFn: async () => await axios.get(`/payment/verify/`),
    enabled: Boolean(reference?.length),
  });

  const {
    isSuccess: orgIsSuccess,
    isPending: orgIsPending,
    isError: orgIsError,
    error: orgError,
    data: orgData,
    mutate: organizationMutate,
  } = useMutation({
    mutationKey: ["organization"],
    mutationFn: async (data: OrganizationData) =>
      await axios.post("/organizations", data),
  });

  useEffect(() => {
    if (isLoading) toast.success("Verifying payment...");
    if (isSuccess && data) {
      toast.success("Payment verified successfully");
      toast.success("Creating organization");
      //! TODO: after payment completion, call mutation to create organization with the selected plan
      organizationMutate({
        ...organizationData,
        paymentPlan: String(selectedPaymentPlan?._id),
      });
    }
  }, [data, isSuccess, isLoading, isError, error]);

  useEffect(() => {
    if (orgIsError) toast.error("An error occurred");
    if (orgIsPending) toast.success("Creating organization...");
    if (orgIsSuccess && orgData) {
      nav("/app/settings");
    }
  }, [orgIsSuccess, orgIsError, orgIsPending, orgData]);

  return (
    <div>
      {isLoading && <p>Verifying payment...</p>}
      {isSuccess && data && <p>Payment Successful!</p>}
    </div>
  );
};

export default PostPayment;
