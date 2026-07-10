import { notFound, redirect } from "next/navigation";
import { getLocaleByPathSegment } from "@/lib/utils";

export default async function LocalizedHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!getLocaleByPathSegment(locale)) {
    notFound();
  }

  redirect(`/${locale}/blog`);
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "my" }, { locale: "zh" }];
}
