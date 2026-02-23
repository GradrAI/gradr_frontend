import api from "@/lib/axios";
import { IPaymentPayload } from "@/types/IPaymentPayload";
import { IPaymentResponse } from "@/types/IPaymentResponse";
import { Response } from "@/types/Response";

const makePayment = (
  data: IPaymentPayload
): Promise<Response<IPaymentResponse>> =>
  api.post("/payment", data).then((response) => response.data);

export default makePayment;
