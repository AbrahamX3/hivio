"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

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
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={index}>
            {path == crumb.href ? (
              <BreadcrumbPage className="capitalize">
                <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
              </BreadcrumbPage>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbLink href={crumb.href} className="capitalize">
                  {crumb.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            {index !== breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
