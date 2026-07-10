export const SEO_EXPERIMENTS = [
  {
    key: "plaud-alternatives-cta-angle",
    area: "Affiliate CTR",
    metric: "outbound_click_rate",
    variants: [
      {
        key: "fit-first",
        label: "Use-case fit CTA",
      },
      {
        key: "compare-first",
        label: "Compare against Plaud CTA",
      },
    ],
  },
  {
    key: "plaud-alternatives-snippet-shape",
    area: "SERP CTR",
    metric: "search_console_ctr",
    variants: [
      {
        key: "paragraph-answer",
        label: "Paragraph quick answer",
      },
      {
        key: "ordered-reasons",
        label: "Answer plus ordered reasons",
      },
    ],
  },
] as const;

export function getSeoExperimentVariant(experimentKey: string) {
  const experiment = SEO_EXPERIMENTS.find((item) => item.key === experimentKey) || SEO_EXPERIMENTS[0];
  return experiment.variants[0];
}
