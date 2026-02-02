import api from "@/lib/axios";
import { IPaymentPlans } from "@/types/IPaymentPlan";
import { Response } from "@/types/Response";

const fetchPaymentPlans = (): Promise<Response<IPaymentPlans>> =>
  api
    .get<Response<IPaymentPlans>>(`/payment-plans`)
    .then((response) => response.data);

export default fetchPaymentPlans;
