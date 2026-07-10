import type {
  AffiliateLinkDraft,
  CmsBlogPost,
  ContentSectionDraft,
  FaqItemDraft,
  TranslationDraft,
} from "@/lib/sample-data";
import { getLocalePath } from "@/lib/utils";

export type CreatePageInput = {
  category: string;
  useCase: string;
  market: string;
  primaryKeyword: string;
  slugEn: string;
  slugMs: string;
  slugZhHans: string;
  status?: CmsBlogPost["status"];
};

export type PageAuditResult = {
  pageId: string;
  primarySlug: string;
  blockers: string[];
  warnings: string[];
  localeUrls: Record<string, string>;
  activeOfferCount: number;
};

export type ClonePageInput = {
  slugEn: string;
  slugMs: string;
  slugZhHans: string;
  category?: string;
  useCase?: string;
  market?: string;
  primaryKeyword?: string;
  status?: CmsBlogPost["status"];
};

const defaultDisclosure =
  "This page includes affiliate links. We may earn a commission if you buy through a listed link, at no additional cost to you. Rankings are based on fit for the stated use case, not on merchant payouts.";

function buildSections(locale: TranslationDraft["locale"], input: CreatePageInput): ContentSectionDraft[] {
  const firstSectionTitle =
    locale === "ms"
      ? `Apa yang penting bila pilih ${input.category}`
      : locale === "zh-Hans"
        ? `挑选${input.category}时要先看的重点`
        : `What matters when choosing ${input.category}`;

  const secondSectionTitle =
    locale === "ms"
      ? `Siapa yang patut beli untuk ${input.market}`
      : locale === "zh-Hans"
        ? `${input.market}买家适合哪一种选择`
        : `Who should buy in ${input.market}`;

  const firstBody =
    locale === "ms"
      ? `Fokus pada kesesuaian alur kerja, kualiti hasil, dan kesesuaian dengan keperluan ${input.useCase}. Elakkan pilih alat hanya kerana senarai cirinya nampak panjang.`
      : locale === "zh-Hans"
        ? `优先看工作流适配、输出质量，以及它是否真的适合${input.useCase}。不要只因为功能列表很多就默认它更好。`
        : `Prioritize workflow fit, output quality, and how well the tool supports ${input.useCase}. Do not choose based on a long feature list alone.`;

  const secondBody =
    locale === "ms"
      ? `Untuk pembeli di ${input.market}, semak juga faktor tempatan seperti pembayaran, ketersediaan, dan kemudahan bekerjasama dengan pasukan.`
      : locale === "zh-Hans"
        ? `对${input.market}买家来说，还要看本地付款、可买性，以及是否方便团队协作。`
        : `For buyers in ${input.market}, also check local payment fit, availability, and how easily the tool supports collaboration.`;

  return [
    {
      id: `${locale}-section-1`,
      sectionTitle: firstSectionTitle,
      sectionImageUrl: "",
      sectionBody: firstBody,
    },
    {
      id: `${locale}-section-2`,
      sectionTitle: secondSectionTitle,
      sectionImageUrl: "",
      sectionBody: secondBody,
    },
  ];
}

function buildFaq(locale: TranslationDraft["locale"], input: CreatePageInput): FaqItemDraft[] {
  return locale === "ms"
    ? [
        {
          id: `${locale}-faq-1`,
          question: `${input.category} mana paling sesuai untuk ${input.useCase}?`,
          answer:
            "Pilihan terbaik biasanya yang paling seimbang dari segi hasil, kelajuan alur kerja, dan kesesuaian dengan bajet atau kerjasama pasukan.",
        },
        {
          id: `${locale}-faq-2`,
          question: `Bagaimana nak bandingkan pilihan untuk ${input.market}?`,
          answer:
            "Semak harga sebenar, ketersediaan, dan sama ada alat itu serasi dengan alur kerja dan cara bayar tempatan.",
        },
      ]
    : locale === "zh-Hans"
      ? [
          {
            id: `${locale}-faq-1`,
            question: `${input.useCase}场景下哪种${input.category}更值得选？`,
            answer:
              "通常要优先选择在输出质量、工作流速度和团队适配度之间最平衡的方案。",
          },
          {
            id: `${locale}-faq-2`,
            question: `在${input.market}应该怎么比较这些选择？`,
            answer:
              "重点看真实价格、可买性，以及是否适合你的本地支付与协作流程。",
          },
        ]
      : [
          {
            id: `${locale}-faq-1`,
            question: `What is the best ${input.category} for ${input.useCase}?`,
            answer:
              "The best option is usually the one that balances output quality, workflow speed, and fit for your actual team setup.",
          },
          {
            id: `${locale}-faq-2`,
            question: `How should buyers in ${input.market} compare these options?`,
            answer:
              "Compare real pricing, availability, and whether the tool fits your local payment, collaboration, and export workflow.",
          },
        ];
}

function buildTranslation(
  locale: TranslationDraft["locale"],
  slug: string,
  input: CreatePageInput,
): TranslationDraft {
  if (locale === "ms") {
    return {
      locale,
      title: `${input.category} terbaik untuk ${input.useCase}`,
      slug,
      metaTitle: `${input.category} terbaik untuk ${input.useCase} di ${input.market}`,
      metaDescription: `Bandingkan ${input.category} terbaik untuk ${input.useCase} di ${input.market}. Lihat pilihan utama, kelebihan, kekangan, dan pautan affiliate telus.`,
      quickAnswer: `Untuk kebanyakan pembeli di ${input.market}, pilihan terbaik bergantung pada kesesuaian alur kerja, hasil sebenar, dan nilai keseluruhan untuk ${input.useCase}.`,
      heroImageUrl: "",
      keyTakeaways: [
        "Utamakan kesesuaian alur kerja dahulu.",
        `Semak nilai sebenar untuk ${input.market}.`,
        `Pilih alat yang paling sesuai untuk ${input.useCase}.`,
      ],
      sections: buildSections(locale, input),
      faqItems: buildFaq(locale, input),
      body: `## Cara kami menilai\nKami menilai pilihan berdasarkan hasil, kesesuaian alur kerja, dan nilai untuk pembeli di ${input.market}.`,
    };
  }

  if (locale === "zh-Hans") {
    return {
      locale,
      title: `${input.market}${input.useCase}适合的${input.category}推荐`,
      slug,
      metaTitle: `${input.market}${input.useCase}${input.category}推荐`,
      metaDescription: `比较适合${input.market}${input.useCase}场景的${input.category}。查看最佳选择、优缺点、以及透明联盟链接。`,
      quickAnswer: `对${input.market}买家来说，最好的选择取决于工作流适配、真实输出质量，以及它是否真的适合${input.useCase}。`,
      heroImageUrl: "",
      keyTakeaways: [
        "先看工作流适配。",
        `再看${input.market}本地可买性。`,
        `重点确认是否真的适合${input.useCase}。`,
      ],
      sections: buildSections(locale, input),
      faqItems: buildFaq(locale, input),
      body: `## 我们如何评估\n我们重点看输出质量、工作流效率，以及对${input.market}买家的实际价值。`,
    };
  }

  return {
    locale,
    title: `Best ${input.category} for ${input.useCase} in ${input.market}`,
    slug,
    metaTitle: `Best ${input.category} for ${input.useCase} in ${input.market}`,
    metaDescription: `Compare the best ${input.category} for ${input.useCase} in ${input.market}. See top options, tradeoffs, and transparent affiliate links.`,
    quickAnswer: `For most buyers in ${input.market}, the best ${input.category} for ${input.useCase} is the one that balances workflow fit, output quality, and overall value.`,
    heroImageUrl: "",
    keyTakeaways: [
      "Choose for workflow fit first.",
      `Check local value in ${input.market}.`,
      `Prioritize tools that truly support ${input.useCase}.`,
    ],
    sections: buildSections(locale, input),
    faqItems: buildFaq(locale, input),
    body: `## How we rank these options\nWe evaluate each option for output quality, workflow fit, and value for buyers in ${input.market}.`,
  };
}

export function buildTemplatePageDraft(input: CreatePageInput): Omit<CmsBlogPost, "id" | "updatedAt"> {
  return {
    slug: input.slugEn,
    status: input.status || "draft",
    pageConfig: {
      templateKey: "best-x-for-y-in-z",
      category: input.category,
      useCase: input.useCase,
      market: input.market,
      primaryKeyword: input.primaryKeyword,
      disclosure: defaultDisclosure,
    },
    translations: [
      buildTranslation("en", input.slugEn, input),
      buildTranslation("ms", input.slugMs, input),
      buildTranslation("zh-Hans", input.slugZhHans, input),
    ],
    affiliateLinks: [],
  };
}

function remapTranslation(
  translation: TranslationDraft,
  slug: string,
  overrides: ClonePageInput,
): TranslationDraft {
  const useCase = overrides.useCase;
  const market = overrides.market;
  const category = overrides.category;

  let title = translation.title;
  let metaTitle = translation.metaTitle;
  let metaDescription = translation.metaDescription;
  let quickAnswer = translation.quickAnswer;

  if (translation.locale === "en") {
    if (category || useCase || market) {
      title = `Best ${category || "AI note takers"} for ${useCase || "buyers"} in ${market || "your market"}`;
      metaTitle = title;
      metaDescription = `Compare the best ${category || "AI note takers"} for ${useCase || "buyers"} in ${market || "your market"}. See top options, tradeoffs, and transparent affiliate links.`;
      quickAnswer = `For most buyers in ${market || "this market"}, the best ${category || "option"} for ${useCase || "this use case"} is the one that balances workflow fit, output quality, and value.`;
    }
  }

  if (translation.locale === "ms") {
    if (category || useCase || market) {
      title = `${category || "AI note takers"} terbaik untuk ${useCase || "pembeli"}`;
      metaTitle = `${category || "AI note takers"} terbaik untuk ${useCase || "pembeli"} di ${market || "pasaran ini"}`;
      metaDescription = `Bandingkan ${category || "AI note takers"} terbaik untuk ${useCase || "pembeli"} di ${market || "pasaran ini"}. Lihat pilihan utama, kekuatan, dan pautan affiliate telus.`;
      quickAnswer = `Untuk kebanyakan pembeli di ${market || "pasaran ini"}, pilihan terbaik bergantung pada kesesuaian alur kerja, hasil sebenar, dan nilai untuk ${useCase || "kegunaan ini"}.`;
    }
  }

  if (translation.locale === "zh-Hans") {
    if (category || useCase || market) {
      title = `${market || "本地"}${useCase || "使用场景"}适合的${category || "工具"}推荐`;
      metaTitle = `${market || "本地"}${useCase || "使用场景"}${category || "工具"}推荐`;
      metaDescription = `比较适合${market || "本地"}${useCase || "使用场景"}的${category || "工具"}。查看最佳选择、差异点与透明联盟链接。`;
      quickAnswer = `对${market || "本地"}买家来说，最好的选择取决于工作流适配、真实输出质量，以及它是否真的适合${useCase || "该场景"}。`;
    }
  }

  return {
    ...translation,
    slug,
    title,
    metaTitle,
    metaDescription,
    quickAnswer,
    sections: translation.sections.map((section, index) => ({
      ...section,
      id: `${translation.locale}-section-${index + 1}`,
    })),
    faqItems: translation.faqItems.map((item, index) => ({
      ...item,
      id: `${translation.locale}-faq-${index + 1}`,
    })),
  };
}

function remapOffers(offers: AffiliateLinkDraft[]): AffiliateLinkDraft[] {
  return offers.map((offer) => ({
    ...offer,
    id: crypto.randomUUID(),
  }));
}

export function buildClonedPageDraft(
  source: CmsBlogPost,
  overrides: ClonePageInput,
): Omit<CmsBlogPost, "id" | "updatedAt"> {
  return {
    slug: overrides.slugEn,
    status: overrides.status || "draft",
    pageConfig: {
      ...source.pageConfig,
      category: overrides.category || source.pageConfig.category,
      useCase: overrides.useCase || source.pageConfig.useCase,
      market: overrides.market || source.pageConfig.market,
      primaryKeyword: overrides.primaryKeyword || source.pageConfig.primaryKeyword,
    },
    translations: source.translations.map((translation) => {
      const slug =
        translation.locale === "en"
          ? overrides.slugEn
          : translation.locale === "ms"
            ? overrides.slugMs
            : overrides.slugZhHans;

      return remapTranslation(translation, slug, overrides);
    }),
    affiliateLinks: remapOffers(source.affiliateLinks),
  };
}

export function auditPage(post: CmsBlogPost): PageAuditResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const localeUrls: Record<string, string> = {};
  const seenSlugs = new Set<string>();
  const activeOfferCount = post.affiliateLinks.filter((item) => item.isActive).length;

  if (!post.pageConfig.templateKey) {
    blockers.push("Missing template key");
  }

  if (!post.pageConfig.category) {
    blockers.push("Missing category");
  }

  if (!post.pageConfig.useCase) {
    blockers.push("Missing use case");
  }

  if (!post.pageConfig.market) {
    blockers.push("Missing market");
  }

  if (!post.pageConfig.primaryKeyword) {
    blockers.push("Missing primary keyword");
  }

  if (!post.pageConfig.disclosure) {
    warnings.push("Missing disclosure copy");
  }

  if (activeOfferCount === 0) {
    blockers.push("No active affiliate offers assigned");
  } else if (activeOfferCount < 2) {
    warnings.push("Only one active affiliate offer assigned");
  }

  for (const translation of post.translations) {
    localeUrls[translation.locale] = getLocalePath(translation.locale, translation.slug);

    if (!translation.title) {
      blockers.push(`${translation.locale}: missing title`);
    }

    if (!translation.slug) {
      blockers.push(`${translation.locale}: missing slug`);
    } else if (seenSlugs.has(translation.slug)) {
      blockers.push(`${translation.locale}: duplicate localized slug ${translation.slug}`);
    } else {
      seenSlugs.add(translation.slug);
    }

    if (!translation.metaTitle) {
      blockers.push(`${translation.locale}: missing meta title`);
    }

    if (!translation.metaDescription) {
      blockers.push(`${translation.locale}: missing meta description`);
    } else if (translation.metaDescription.length < (translation.locale === "zh-Hans" ? 45 : 120)) {
      warnings.push(`${translation.locale}: meta description is short`);
    }

    if (!translation.quickAnswer) {
      blockers.push(`${translation.locale}: missing quick answer`);
    }

    if (!translation.heroImageUrl) {
      warnings.push(`${translation.locale}: hero image is empty`);
    }

    if (translation.keyTakeaways.length < 3) {
      warnings.push(`${translation.locale}: fewer than 3 key takeaways`);
    }

    if (translation.sections.length < 2) {
      warnings.push(`${translation.locale}: fewer than 2 sections`);
    }

    if (translation.faqItems.length < 2) {
      warnings.push(`${translation.locale}: fewer than 2 FAQ items`);
    }

    if (!translation.body) {
      warnings.push(`${translation.locale}: missing methodology body`);
    }
  }

  return {
    pageId: post.id,
    primarySlug: post.slug,
    blockers,
    warnings,
    localeUrls,
    activeOfferCount,
  };
}
