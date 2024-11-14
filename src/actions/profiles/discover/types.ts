import type { $infer } from "@edgedb/edgeql-js";
import type { getUserProfilesQuery } from "./queries";

export type UserProfiles = $infer<typeof getUserProfilesQuery>;
