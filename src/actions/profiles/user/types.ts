import type { $infer } from "@edgedb/edgeql-js";
import type {
	getUserHiveProfileByUsernameQuery,
	getUserProfileQuery,
} from "./queries";

export type UserHiveProfiles = $infer<typeof getUserHiveProfileByUsernameQuery>;
export type UserHiveProfile = UserHiveProfiles[number];
export type UserProfile = $infer<typeof getUserProfileQuery>;
