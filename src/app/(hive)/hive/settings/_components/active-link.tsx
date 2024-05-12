"use client";

import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";

import { cn } from "@/lib/utils";

interface Props {
  path: string;
  label: string;
}
export default function ActiveLink({ path, label }: Props) {
  const pathname = usePathname();

  return (
    <Link
      href={path}
      className={cn(pathname === path ? "font-semibold text-primary" : "")}
    >
      {label}
    </Link>
  );
}
