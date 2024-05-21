import HiveProfileFilter from "./_components/filter";
import { getHiveProfiles } from "./actions";

export default async function Discover() {
  const { data } = await getHiveProfiles({ limit: 100 });

  return (
    <div className="mx-auto grid w-full gap-6">
      <HiveProfileFilter hive={data?.data?.hive ?? []} />
    </div>
  );
}
