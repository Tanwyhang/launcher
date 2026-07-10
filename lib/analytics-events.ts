export const ANALYTICS_EVENTS = {
  articleView: "article_view",
  affiliateCardClick: "affiliate_card_click",
  leadOfferClick: "lead_offer_click",
  affiliateAlternativeClick: "affiliate_alternative_click",
  saveAuthClick: "save_auth_click",
  comparisonTableView: "comparison_table_view",
  searchSubmit: "search_submit",
  languageSwitch: "language_switch",
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsPayload = {
  event: AnalyticsEventName;
  pageId?: string;
  locale?: string;
  experimentKey?: string;
  variantKey?: string;
  offerId?: string;
  offerPosition?: number;
};
