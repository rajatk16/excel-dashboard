import { SetMetadata } from "@nestjs/common";

import { RAW_RESPONSE_METADATA_KEY } from "../constants/http.constant";

export const RawResponse = () => SetMetadata(RAW_RESPONSE_METADATA_KEY, true);
