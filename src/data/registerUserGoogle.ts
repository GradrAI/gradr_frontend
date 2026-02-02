import { IGoogleAuth } from "@/types/IGoogleAuth";
import { Response } from "@/types/Response";
import axios from "axios";

const registerUserGoogle = (): Promise<Response<IGoogleAuth>> =>
  axios.get(`/auth/google`).then((response) => response.data);

export default registerUserGoogle;
