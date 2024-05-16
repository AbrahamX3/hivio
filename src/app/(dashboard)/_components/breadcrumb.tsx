"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DashboardBreadcrumb() {
  const path = usePathname();

  function generateBreadcrumbs() {
    const nestedRoutes = path.split("/").filter(Boolean);

    const crumblist = nestedRoutes.map((subpath, index) => {
      return {
        href: `/${nestedRoutes.slice(0, index + 1).join("/")}`,
        title: subpath,
      };
    });

    return [{ href: "/", title: "Home" }, ...crumblist];
  }

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="w-full rounded-md border bg-background px-4 py-2 md:px-6 md:py-4">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={index}>
              {path == crumb.href ? (
                <BreadcrumbPage>
                  <BreadcrumbLink
                    className="font-medium capitalize text-primary hover:text-primary/80"
                    href={crumb.href}
                  >
                    {crumb.title}
                  </BreadcrumbLink>
                </BreadcrumbPage>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={crumb.href}
                    className="font-medium capitalize"
                  >
                    {crumb.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}
              {index !== breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
