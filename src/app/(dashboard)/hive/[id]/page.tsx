import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { type HiveRowData } from "@/types/hive";

import { HiveForm } from "./_components/hive-form";
import { getTitleFromHive, getTitleFromHiveMetadata } from "./actions";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  const { data } = await getTitleFromHiveMetadata({ id });

  if (!data?.success && data) {
    return {
      title: "Title not found",
    };
  }

  return {
    title: `${data?.data.name} (${data?.data.status})`,
  };
}

export default async function EditHiveTitle({ params }: Props) {
  const result = await getTitleFromHive({ id: params.id });
  const data = result.data?.data;

  if (!result.data?.success || !data) {
    notFound();
  }

  return (
    <main className="grid w-full flex-1 items-start gap-4 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <HiveForm hive={JSON.parse(JSON.stringify(data)) as HiveRowData} />
    </main>
  );
}
