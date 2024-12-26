"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NavBarLink: React.FC<React.ComponentPropsWithoutRef<typeof Link>> = (
  props,
) => {
  const pathname = usePathname();

  return (
    <Link
      {...props}
      className={cn(
        "transition-opacity duration-200 hover:opacity-75 p-2",
        pathname === props.href && "underline",
        props.className,
      )}
    />
  );
};

export const NavBar: React.FC<
  Omit<React.ComponentPropsWithoutRef<"nav">, "children"> & {
    links: Array<{ href: string; label: string }>;
  }
> = ({ links, ...props }) => {
  return (
    <nav {...props} className={cn("p-4", props.className)}>
      <ul className="flex gap-2">
        {links.map(({ label, href }) => (
          <li key={href}>
            <NavBarLink href={href}>{label}</NavBarLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
