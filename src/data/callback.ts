import { ICallback } from "@/types/ICallback";
import { Response } from "@/types/Response";
import axios from "axios";

const callback = async (data: string): Promise<Response<ICallback>> =>
  await axios
    .post(`/auth/callback`, {
      data,
    })
    .then((response) => response.data);

export default callback;
