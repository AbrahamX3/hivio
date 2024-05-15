import { Hive } from "@edgedb/interfaces";

export type HiveRowData = Omit<Hive, "addedBy">;
