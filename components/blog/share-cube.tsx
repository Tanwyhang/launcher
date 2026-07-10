"use client";

import { Check, Copy, DownloadSimple, FacebookLogo, LinkedinLogo, ShareNetwork, XLogo } from "@phosphor-icons/react";
import { useState } from "react";
import type { LocaleCode } from "@/lib/utils";

const copy = {
  en: { share: "Share cube", copied: "Copied", story: "Share story card", x: "Post to X", facebook: "Facebook", linkedin: "LinkedIn" },
  ms: { share: "Kongsi cube", copied: "Disalin", story: "Kongsi kad story", x: "Post ke X", facebook: "Facebook", linkedin: "LinkedIn" },
  "zh-Hans": { share: "分享 cube", copied: "已复制", story: "分享 Story 卡片", x: "发布到 X", facebook: "Facebook", linkedin: "LinkedIn" },
} as const;

export function ShareCube({ locale, title, storyImagePath }: { locale: LocaleCode; title: string; storyImagePath: string }) {
  const labels = copy[locale];
  const [copied, setCopied] = useState(false);

  function currentUrl() {
    return window.location.href;
  }

  async function sharePage() {
    if (navigator.share) {
      await navigator.share({ title, text: title, url: currentUrl() });
      return;
    }
    await copyLink();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(currentUrl());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function shareStoryCard() {
    const imageUrl = new URL(storyImagePath, window.location.origin).toString();
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], "launcher-story-card.png", { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title, text: title, files: [file], url: currentUrl() });
      return;
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "launcher-story-card.png";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function openSocial(base: string) {
    window.open(base, "_blank", "noopener,noreferrer,width=720,height=680");
  }

  const buttonClass = "inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3.5 py-2 text-sm text-black hover:bg-neutral-50";

  return (
    <div className="mt-6 flex flex-wrap gap-2" aria-label={labels.share}>
      <button type="button" className={`${buttonClass} bg-black text-white hover:bg-neutral-800`} onClick={sharePage}>
        <ShareNetwork size={17} aria-hidden="true" /> {labels.share}
      </button>
      <button type="button" className={buttonClass} onClick={shareStoryCard}>
        <DownloadSimple size={17} aria-hidden="true" /> {labels.story}
      </button>
      <button type="button" className={buttonClass} onClick={() => openSocial(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl())}`)}>
        <XLogo size={17} aria-hidden="true" /> {labels.x}
      </button>
      <button type="button" className={buttonClass} onClick={() => openSocial(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl())}`)}>
        <FacebookLogo size={17} aria-hidden="true" /> {labels.facebook}
      </button>
      <button type="button" className={buttonClass} onClick={() => openSocial(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl())}`)}>
        <LinkedinLogo size={17} aria-hidden="true" /> {labels.linkedin}
      </button>
      <button type="button" className={buttonClass} onClick={copyLink}>
        {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />} {copied ? labels.copied : "Link"}
      </button>
    </div>
  );
}
