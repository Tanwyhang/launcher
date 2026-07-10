"use client";

import { Check, Copy, DownloadSimple, FacebookLogo, ImageSquare, LinkedinLogo, ShareNetwork, XLogo } from "@phosphor-icons/react";
import { useState } from "react";
import type { LocaleCode } from "@/lib/utils";

const copy = {
  en: { share: "Share article", copied: "Copied", shareImage: "Share image", saveImage: "Save image", x: "Post to X", facebook: "Facebook", linkedin: "LinkedIn" },
  ms: { share: "Kongsi artikel", copied: "Disalin", shareImage: "Kongsi imej", saveImage: "Simpan imej", x: "Post ke X", facebook: "Facebook", linkedin: "LinkedIn" },
  "zh-Hans": { share: "分享文章", copied: "已复制", shareImage: "分享图片", saveImage: "保存图片", x: "发布到 X", facebook: "Facebook", linkedin: "LinkedIn" },
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

  async function getStoryFile() {
    const imageUrl = new URL(storyImagePath, window.location.origin).toString();
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Unable to create share image");
    const blob = await response.blob();
    return new File([blob], "launcher-portrait-guide.png", { type: "image/png" });
  }

  async function shareStoryCard() {
    const file = await getStoryFile();

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title, text: title, files: [file], url: currentUrl() });
      return;
    }

    saveFile(file);
  }

  function saveFile(file: File) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  async function saveStoryCard() {
    saveFile(await getStoryFile());
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
        <ImageSquare size={17} aria-hidden="true" /> {labels.shareImage}
      </button>
      <button type="button" className={buttonClass} onClick={saveStoryCard}>
        <DownloadSimple size={17} aria-hidden="true" /> {labels.saveImage}
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
