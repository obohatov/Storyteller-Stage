import { GetCurrentAuthUserResponse } from "./generated/api";
import type { z } from "zod";

export * from "./generated/api";

type CurrentAuthUserResponse = z.infer<typeof GetCurrentAuthUserResponse>;

export type AuthUser = NonNullable<CurrentAuthUserResponse["user"]>;
