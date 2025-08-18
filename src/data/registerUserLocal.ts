import {
  type IRegisterPayload,
  IRegisterResponse,
} from "@/types/IRegisterResponse";
import { type Response } from "@/types/Response";
import axios from "axios";

const registerUserLocal = (
  data: IRegisterPayload
): Promise<Response<IRegisterResponse>> =>
  axios
    .post(`/auth/register`, {
      ...data,
      // exclude confirmPassword and username before sending
      confirmPassword: undefined,
      username: undefined,
    })
    .then((response) => response.data);

export default registerUserLocal;
