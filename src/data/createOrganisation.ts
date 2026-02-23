import {
  IOrganisationPayload,
  IOrganisationResponse,
} from "@/types/IOrganisation";
import { type Response } from "@/types/Response";

import api from "@/lib/axios";

const createOrganisation = (
  data: IOrganisationPayload
): Promise<Response<IOrganisationResponse>> =>
  api
    .post<Response<IOrganisationResponse>>("/organisations", data)
    .then((response) => response.data);

export default createOrganisation;
