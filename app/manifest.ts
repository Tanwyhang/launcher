import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "launcher knowledge cubes",
    short_name: "launcher",
    description: "Independent trilingual product decision guides for Malaysia and Singapore.",
    start_url: "/en/blog",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    lang: "en",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
