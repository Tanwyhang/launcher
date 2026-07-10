"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";

const languageTabs = [
  { label: "EN", segment: "en" },
  { label: "MY", segment: "my" },
  { label: "CN", segment: "zh" },
];

const searchPlaceholder: Record<string, string> = {
  en: "Search cubes",
  my: "Cari cubes",
  zh: "搜索 cubes",
};

const footerCopy: Record<string, { about: string; editorial: string }> = {
  en: { about: "About", editorial: "Editorial policy" },
  my: { about: "Tentang", editorial: "Dasar editorial" },
  zh: { about: "关于", editorial: "编辑政策" },
};

function getLocaleHref(pathname: string, targetSegment: string) {
  const parts = pathname.split("/").filter(Boolean);
  const currentSegment = parts[0];

  if (currentSegment === "en" || currentSegment === "my" || currentSegment === "zh") {
    return `/${[targetSegment, ...parts.slice(1)].join("/")}`;
  }

  if (currentSegment === "blog") {
    return `/${[targetSegment, ...parts].join("/")}`;
  }

  return `/${targetSegment}`;
}

function RoutePrefetcher() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const staticRoutes = ["/", "/en", "/my", "/zh", "/en/blog", "/my/blog", "/zh/blog"];
    const renderedRoutes = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')).map((link) => link.pathname);
    const routes = Array.from(new Set([...staticRoutes, ...renderedRoutes])).filter((route) => route !== pathname);

    for (const route of routes) {
      router.prefetch(route as any);
    }
  }, [pathname, router]);

  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeSegment = pathname.split("/").filter(Boolean)[0] || "en";
  const activeLocaleSegment = languageTabs.some((item) => item.segment === activeSegment) ? activeSegment : "en";

  if (pathname.startsWith("/admin") || pathname.startsWith(ADMIN_BASE_PATH)) {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  return (
    <div className="launcher-shell">
      <header className="launcher-public-header">
        <div className="launcher-frame px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-between gap-3">
            <Link href={`/${activeLocaleSegment}` as any} className="flex min-w-0 items-center gap-2.5 no-underline" aria-label="launcher home">
              <img src="/logo.png" alt="" className="h-6 w-6 shrink-0 object-contain sm:h-7 sm:w-7" />
              <span className="truncate text-[1.3rem] font-medium leading-none text-black sm:text-[1.45rem]">launcher</span>
            </Link>
            <nav className="ml-auto flex shrink-0 items-center rounded-full border border-neutral-200 p-0.5 text-[0.82rem] text-neutral-500" aria-label="Language switcher">
              {languageTabs.map((tab) => {
                const active = activeLocaleSegment === tab.segment;

                return (
                  <Link
                    key={tab.segment}
                    href={getLocaleHref(pathname, tab.segment) as any}
                    className={active ? "rounded-full bg-black px-2.5 py-1 text-white no-underline" : "rounded-full px-2.5 py-1 text-neutral-500 no-underline hover:text-black"}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <form className="mt-3" role="search" action={`/${activeLocaleSegment}/blog`}>
            <SearchInput name="q" placeholder={searchPlaceholder[activeLocaleSegment]} />
          </form>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-neutral-100">
        <div className="launcher-frame flex flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-neutral-500 sm:px-6">
          <span>launcher</span>
          <nav className="flex gap-5" aria-label="Publisher information">
            <Link className="text-neutral-600 no-underline hover:text-black" href={`/${activeLocaleSegment}/about` as any}>{footerCopy[activeLocaleSegment].about}</Link>
            <Link className="text-neutral-600 no-underline hover:text-black" href={`/${activeLocaleSegment}/editorial-policy` as any}>{footerCopy[activeLocaleSegment].editorial}</Link>
          </nav>
        </div>
      </footer>
      <RoutePrefetcher />
    </div>
  );
}
