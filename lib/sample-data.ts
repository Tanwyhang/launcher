import { LocaleCode } from "@/lib/utils";

export type PageConfigDraft = {
  templateKey: string;
  category: string;
  useCase: string;
  market: string;
  primaryKeyword: string;
  disclosure: string;
};

export type FaqItemDraft = {
  id: string;
  question: string;
  answer: string;
};

export type ContentSectionDraft = {
  id: string;
  sectionTitle: string;
  sectionImageUrl: string;
  sectionBody: string;
};

export type TranslationDraft = {
  locale: LocaleCode;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  quickAnswer: string;
  heroImageUrl: string;
  keyTakeaways: string[];
  sections: ContentSectionDraft[];
  faqItems: FaqItemDraft[];
  body: string;
};

export type AffiliateLinkDraft = {
  id: string;
  merchantName: string;
  anchorText: string;
  destinationUrl: string;
  trackingUrl?: string;
  imageUrl?: string;
  imageLinkUrl?: string;
  sourceUrls?: Array<{ label: string; url: string }>;
  rel: string;
  target: string;
  ctaTextEn: string;
  ctaTextMs: string;
  ctaTextZhHans: string;
  summary: string;
  bestFor: string;
  notFor: string;
  priceBand: string;
  displayedPrice?: string;
  pricingSummary: string;
  commissionRate?: number;
  commissionSnapshot?: string;
  verifiedAt?: string;
  pros: string[];
  cons: string[];
  score: number;
  isActive: boolean;
  localizedContent?: Partial<
    Record<
      LocaleCode,
      {
        anchorText: string;
        summary: string;
        bestFor: string;
        notFor: string;
        priceBand: string;
        pricingSummary: string;
        pros: string[];
        cons: string[];
      }
    >
  >;
};

export type CmsBlogPost = {
  id: string;
  slug: string;
  status: "draft" | "published";
  pageConfig: PageConfigDraft;
  translations: TranslationDraft[];
  affiliateLinks: AffiliateLinkDraft[];
  updatedAt: string;
};

export const samplePost: CmsBlogPost = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "best-ai-note-takers-for-meetings",
  status: "draft",
  updatedAt: new Date().toISOString(),
  pageConfig: {
    templateKey: "best-x-for-y-in-z",
    category: "AI note takers",
    useCase: "meetings and team recaps",
    market: "Malaysia and Singapore",
    primaryKeyword: "best ai note takers for meetings",
    disclosure:
      "This page includes affiliate links. We may earn a commission if you buy through a listed link, at no additional cost to you. Rankings are based on fit for the stated use case, not on merchant payouts.",
  },
  translations: [
    {
      locale: "en",
      title: "Best AI note takers for meetings",
      slug: "best-ai-note-takers-for-meetings",
      metaTitle: "Best AI Note Takers for Meetings in Malaysia (2026 Guide)",
      metaDescription:
        "Compare the best AI note takers for meetings in Malaysia and Singapore. See top picks by workflow, pricing fit, privacy tradeoffs, and transparent affiliate links.",
      quickAnswer:
        "For most teams in Malaysia and Singapore, the best AI note taker is the one that captures speech cleanly, exports summaries fast, and does not slow down handoff after the call. Start with a reliable all-rounder, then choose a specialist option if privacy, budget, or team workflow matters more.",
      heroImageUrl:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
      keyTakeaways: [
        "Choose for workflow speed first, not feature list length.",
        "Room audio quality still matters more than AI branding.",
        "For SEA buyers, local availability and billing friction change the real winner.",
      ],
      sections: [
        {
          id: "content-overview",
          sectionTitle: "What actually matters in meeting note takers",
          sectionImageUrl:
            "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
          sectionBody:
            "Prioritize capture reliability, speaker separation, export speed, and whether your team can use the summary immediately after a meeting. Many tools look similar until you test real room audio and long calls.",
        },
        {
          id: "buying-guideline",
          sectionTitle: "How to choose for Malaysia and Singapore teams",
          sectionImageUrl:
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
          sectionBody:
            "Check billing friction, collaboration fit, and whether the tool plays well with Notion, Docs, or your CRM. A strong global tool can still be a poor local buy if onboarding or payment is messy.",
        },
      ],
      faqItems: [
        {
          id: "faq-en-1",
          question: "What is the best AI note taker for meetings overall?",
          answer:
            "For most teams, the best overall choice is the tool that balances capture quality, summary speed, and simple sharing. The right winner changes if privacy or budget is the main constraint.",
        },
        {
          id: "faq-en-2",
          question: "Are AI note takers worth paying for?",
          answer:
            "They are worth paying for when they reduce post-meeting admin time and improve follow-through. If your team only needs occasional transcripts, a lighter option may be enough.",
        },
      ],
      body: `## How we rank these tools
We score each option for transcript quality, summary usefulness, export speed, workflow fit, and value for SEA buyers.

## Who this page is for
- Team leads running recurring internal meetings
- Sales teams that need quick follow-up notes
- Agencies that hand work between multiple people

## When to skip AI note takers
If you only need raw recordings and never revisit summaries, a simpler recorder may be the better buy.`,
    },
    {
      locale: "ms",
      title: "AI note taker paling baik untuk mesyuarat",
      slug: "ai-note-taker-terbaik-untuk-mesyuarat",
      metaTitle: "AI Note Taker Terbaik untuk Mesyuarat di Malaysia (2026)",
      metaDescription:
        "Bandingkan AI note taker terbaik untuk mesyuarat di Malaysia dan Singapura. Lihat pilihan utama ikut alur kerja, bajet, privasi, dan pautan affiliate telus.",
      quickAnswer:
        "Bagi kebanyakan pasukan di Malaysia dan Singapura, AI note taker terbaik ialah alat yang rakam jelas, ringkaskan cepat, dan mudah dikongsi terus selepas mesyuarat. Mulakan dengan pilihan serba guna dahulu, kemudian pilih alat khusus jika privasi atau bajet lebih penting.",
      heroImageUrl:
        "https://images.unsplash.com/photo-1540317580384-e5d1f6e7ffb0?auto=format&fit=crop&w=1200&q=80",
      keyTakeaways: [
        "Utamakan kelajuan alur kerja, bukan sekadar jumlah ciri.",
        "Kualiti rakaman sebenar masih faktor paling penting.",
        "Untuk pasaran tempatan, cara bayar dan ketersediaan boleh ubah pilihan terbaik.",
      ],
      sections: [
        {
          id: "content-overview",
          sectionTitle: "Apa yang benar-benar penting",
          sectionImageUrl:
            "https://images.unsplash.com/photo-1540317580384-e5d1f6e7ffb0?auto=format&fit=crop&w=1200&q=80",
          sectionBody:
            "Fokus pada kejelasan rakaman, pemisahan suara, kelajuan eksport, dan sama ada ringkasan boleh terus digunakan oleh pasukan selepas mesyuarat.",
        },
        {
          id: "buying-guideline",
          sectionTitle: "Cara pilih untuk pasukan Malaysia dan Singapura",
          sectionImageUrl:
            "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
          sectionBody:
            "Semak integrasi, kemudahan bil tempatan, dan sama ada alat itu serasi dengan Notion, Docs, atau CRM pasukan anda.",
        },
      ],
      faqItems: [
        {
          id: "faq-ms-1",
          question: "AI note taker mana paling baik untuk mesyuarat?",
          answer:
            "Secara umum, pilihan terbaik ialah alat yang seimbang antara rakaman jelas, ringkasan berguna, dan perkongsian yang mudah. Pilihan sebenar berubah ikut bajet dan tahap privasi yang anda perlukan.",
        },
        {
          id: "faq-ms-2",
          question: "Berbaloi atau tidak untuk langgan alat AI nota?",
          answer:
            "Berbaloi jika ia menjimatkan masa pasukan selepas mesyuarat. Jika anda hanya perlukan transkrip sekali-sekala, alat lebih ringan mungkin sudah mencukupi.",
        },
      ],
      body: `## Bagaimana kami menilai
Kami menilai setiap pilihan berdasarkan kualiti transkrip, kegunaan ringkasan, kelajuan eksport, keserasian alur kerja, dan nilai untuk pembeli di Malaysia/Singapura.

## Sesuai untuk siapa
- Ketua pasukan yang urus mesyuarat berkala
- Pasukan jualan yang perlukan susulan pantas
- Agensi yang serah kerja antara beberapa orang

## Bila tak perlu guna AI note taker
Jika anda cuma perlukan rakaman mentah tanpa ringkasan, perakam yang lebih ringkas mungkin lebih sesuai.`,
    },
    {
      locale: "zh-Hans",
      title: "会议场景最适合的 AI 录音笔推荐",
      slug: "huiyi-ai-note-taker-tuijian",
      metaTitle: "马来西亚会议 AI 记录工具推荐（2026）",
      metaDescription:
        "比较适合马来西亚与新加坡会议场景的 AI 记录工具。查看不同工作流、预算、隐私取向下的最佳选择、主要差异点、购买逻辑、适合人群与透明联盟链接。",
      quickAnswer:
        "对大多数马来西亚和新加坡团队来说，最好的 AI 会议记录工具，是能稳定收音、快速输出摘要、并且方便团队继续执行的工具。先选稳定的通用型，再根据预算或隐私要求做细分选择。",
      heroImageUrl:
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      keyTakeaways: [
        "先看工作流效率，不要先看花哨功能。",
        "真实会议收音质量仍然是核心。",
        "本地可买性和付款便利会直接影响最终选择。",
      ],
      sections: [
        {
          id: "content-overview",
          sectionTitle: "会议工具真正要看的点",
          sectionImageUrl:
            "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
          sectionBody:
            "优先看收音稳定性、说话人区分、导出速度，以及团队在会后能否立刻使用摘要继续推进工作。",
        },
        {
          id: "buying-guideline",
          sectionTitle: "适合马新团队的选择逻辑",
          sectionImageUrl:
            "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
          sectionBody:
            "重点确认协作方式、订阅付款便利，以及是否能顺利接入 Notion、Docs 或 CRM 等实际工作流。",
        },
      ],
      faqItems: [
        {
          id: "faq-zh-1",
          question: "会议 AI 记录工具哪一种最值得买？",
          answer:
            "对大多数团队来说，最值得买的是在收音、摘要速度和分享效率之间最平衡的工具。如果预算或隐私要求更强，最佳选择会不同。",
        },
        {
          id: "faq-zh-2",
          question: "AI 会议记录工具值得付费吗？",
          answer:
            "如果它能明显减少会后整理时间并提高跟进效率，就值得付费。如果你只是偶尔需要转写，轻量方案可能已经足够。",
        },
      ],
      body: `## 我们如何评估
我们根据转写质量、摘要可用性、导出速度、工作流适配度，以及对马新买家的综合价值来排序。

## 适合哪些人
- 经常主持团队会议的人
- 需要快速跟进的销售团队
- 需要多人协作交接的服务团队

## 什么情况下不用买
如果你只需要原始录音，不在乎摘要与整理速度，更简单的录音方案可能更合适。`,
    },
  ],
  affiliateLinks: [],
};
