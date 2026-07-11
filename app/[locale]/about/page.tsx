import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocaleByPathSegment, getLocalePath, LOCALES } from "@/lib/utils";

const copy = {
  en: {
    title: "About launcher",
    description: "How launcher creates independent product decision guides for Malaysia and Singapore.",
    intro: "launcher publishes independent product decision guides for readers in Malaysia and Singapore in English, Bahasa Malaysia, and Simplified Chinese.",
    methodTitle: "What we do",
    method: "We compare product workflows, practical tradeoffs, regional availability, language fit, and the cost or friction of switching. We link to official sources and clearly distinguish editorial links from monetized affiliate links.",
    limitsTitle: "What we do not claim",
    limits: "We do not claim hands-on testing, current prices, stock, ratings, or affiliate relationships unless those facts are documented and visibly disclosed on the page.",
    policy: "Read our editorial policy",
  },
  ms: {
    title: "Tentang launcher",
    description: "Cara launcher menghasilkan panduan keputusan produk bebas untuk Malaysia dan Singapura.",
    intro: "launcher menerbitkan panduan keputusan produk bebas untuk pembaca Malaysia dan Singapura dalam English, Bahasa Malaysia, dan 简体中文.",
    methodTitle: "Apa yang kami lakukan",
    method: "Kami membandingkan alur produk, tradeoff praktikal, ketersediaan serantau, kesesuaian bahasa, dan kos atau geseran pertukaran. Kami pautkan sumber rasmi dan membezakan pautan editorial daripada pautan affiliate berbayar.",
    limitsTitle: "Apa yang kami tidak dakwa",
    limits: "Kami tidak mendakwa ujian hands-on, harga semasa, stok, rating, atau hubungan affiliate melainkan fakta itu didokumenkan dan didedahkan pada halaman.",
    policy: "Baca dasar editorial",
  },
  zh: {
    title: "关于 launcher",
    description: "launcher 如何为马来西亚和新加坡读者制作独立产品决策指南。",
    intro: "launcher 为马来西亚和新加坡读者发布 English、Bahasa Malaysia 与简体中文的独立产品决策指南。",
    methodTitle: "我们做什么",
    method: "我们比较产品工作流、实际取舍、地区可买性、语言适配，以及切换成本。页面会链接官方来源，并明确区分编辑链接与变现联盟链接。",
    limitsTitle: "我们不会随意声称什么",
    limits: "除非页面有记录并清楚披露，否则我们不会声称亲手测试、当前价格、库存、评分或联盟关系。",
    policy: "阅读编辑政策",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const localeConfig = getLocaleByPathSegment(locale);
  if (!localeConfig) return {};
  const pageCopy = copy[localeConfig.code === "zh-Hans" ? "zh" : localeConfig.code];
  return {
    title: pageCopy.title,
    description: pageCopy.description,
    alternates: {
      canonical: `${getLocalePath(localeConfig.code)}/about`,
      languages: {
        ...Object.fromEntries(LOCALES.map((item) => [item.htmlLang, `${getLocalePath(item.code)}/about`])),
        "x-default": "/en/about",
      },
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const localeConfig = getLocaleByPathSegment(locale);
  if (!localeConfig) notFound();
  const pageCopy = copy[localeConfig.code === "zh-Hans" ? "zh" : localeConfig.code];
  return (
    <article className="launcher-frame px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-medium text-black sm:text-5xl">{pageCopy.title}</h1>
      <p className="mt-6 text-xl leading-relaxed text-neutral-700">{pageCopy.intro}</p>
      <h2 className="mt-12 text-2xl font-medium text-black">{pageCopy.methodTitle}</h2>
      <p className="mt-4 text-lg leading-relaxed text-neutral-700">{pageCopy.method}</p>
      <h2 className="mt-12 text-2xl font-medium text-black">{pageCopy.limitsTitle}</h2>
      <p className="mt-4 text-lg leading-relaxed text-neutral-700">{pageCopy.limits}</p>
      <Link className="mt-10 inline-flex text-black underline underline-offset-4" href={`/${locale}/editorial-policy` as any}>{pageCopy.policy}</Link>
    </article>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "my" }, { locale: "zh" }];
}
