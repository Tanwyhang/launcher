import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocaleByPathSegment, getLocalePath, LOCALES } from "@/lib/utils";

const copy = {
  en: { title: "Editorial policy", description: "launcher editorial, sourcing, correction, localization, and affiliate disclosure standards.", sections: [["Evidence", "Material product claims should link to official documentation or another named source. We identify what was checked and avoid presenting assumptions as tests."], ["Localization", "Malay and Simplified Chinese pages are adapted for local buyer context rather than published as literal keyword swaps."], ["Commercial links", "Affiliate links must be visibly disclosed and use sponsored link attributes. Direct official links are not described as affiliate links."], ["Corrections", "Material errors should be corrected promptly. Updated dates reflect substantive review, not automated freshness changes."]] },
  ms: { title: "Dasar editorial", description: "Standard editorial, sumber, pembetulan, lokalisasi, dan pendedahan affiliate launcher.", sections: [["Bukti", "Dakwaan produk penting perlu dipautkan kepada dokumentasi rasmi atau sumber bernama. Kami terangkan apa yang disemak dan tidak menyamar andaian sebagai ujian."], ["Lokalisasi", "Halaman Bahasa Malaysia dan Simplified Chinese disesuaikan untuk konteks pembeli tempatan, bukan pertukaran kata kunci secara literal."], ["Pautan komersial", "Pautan affiliate mesti didedahkan dan menggunakan atribut sponsored. Pautan rasmi langsung tidak dilabel sebagai affiliate."], ["Pembetulan", "Kesilapan penting perlu dibetulkan dengan segera. Tarikh kemas kini mencerminkan semakan substantif, bukan freshness automatik."]] },
  zh: { title: "编辑政策", description: "launcher 的编辑、来源、纠错、本地化与联盟披露标准。", sections: [["证据", "重要产品信息应链接官方文档或其他明确来源。我们说明核对了什么，不会把推测包装成实测。"], ["本地化", "马来文与简体中文页面会按本地买家语境改写，而不是只做关键词替换。"], ["商业链接", "联盟链接必须清楚披露并使用 sponsored 属性。直接官方链接不会被描述为联盟链接。"], ["纠错", "重要错误应尽快修正。更新时间代表实质审核，而不是自动刷新日期。"]] },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const localeConfig = getLocaleByPathSegment(locale);
  if (!localeConfig) return {};
  const pageCopy = copy[localeConfig.code === "zh-Hans" ? "zh" : localeConfig.code];
  return { title: pageCopy.title, description: pageCopy.description, alternates: { canonical: `${getLocalePath(localeConfig.code)}/editorial-policy`, languages: { ...Object.fromEntries(LOCALES.map((item) => [item.htmlLang, `${getLocalePath(item.code)}/editorial-policy`])), "x-default": "/en/editorial-policy" } } };
}

export default async function EditorialPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const localeConfig = getLocaleByPathSegment(locale);
  if (!localeConfig) notFound();
  const pageCopy = copy[localeConfig.code === "zh-Hans" ? "zh" : localeConfig.code];
  return <article className="launcher-frame px-4 py-12 sm:px-6"><h1 className="text-4xl font-medium text-black sm:text-5xl">{pageCopy.title}</h1><p className="mt-5 text-lg text-neutral-600">{pageCopy.description}</p>{pageCopy.sections.map(([title, body]) => <section key={title} className="mt-10"><h2 className="text-2xl font-medium text-black">{title}</h2><p className="mt-4 text-lg leading-relaxed text-neutral-700">{body}</p></section>)}</article>;
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "my" }, { locale: "zh" }];
}
