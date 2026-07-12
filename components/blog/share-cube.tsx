"use client";

import { Check, Copy, DownloadSimple, FacebookLogo, ImageSquare, LinkedinLogo, ShareNetwork, X, XLogo } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { LocaleCode } from "@/lib/utils";

const copy = {
  en: { share: "Share article", copied: "Copied", shareImage: "Share image", saveImage: "Save image", x: "Post to X", facebook: "Facebook", linkedin: "LinkedIn", close: "Close share dialog", preview: "Share card preview", dimensions: "1080 x 1920 portrait" },
  ms: { share: "Kongsi artikel", copied: "Disalin", shareImage: "Kongsi imej", saveImage: "Simpan imej", x: "Post ke X", facebook: "Facebook", linkedin: "LinkedIn", close: "Tutup dialog perkongsian", preview: "Pratonton kad kongsi", dimensions: "1080 x 1920 potret" },
  "zh-Hans": { share: "分享文章", copied: "已复制", shareImage: "分享图片", saveImage: "保存图片", x: "发布到 X", facebook: "Facebook", linkedin: "LinkedIn", close: "关闭分享窗口", preview: "分享卡片预览", dimensions: "1080 x 1920 竖版" },
} as const;

export function ShareCube({ locale, title, storyImagePath }: { locale: LocaleCode; title: string; storyImagePath: string }) {
  const labels = copy[locale];
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

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
    <div className="mt-6">
      <button type="button" className={`${buttonClass} bg-black text-white hover:bg-neutral-800`} onClick={() => setIsOpen(true)}>
        <ShareNetwork size={17} aria-hidden="true" /> {labels.share}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center sm:p-6" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section className="max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-[1.5rem] bg-white p-4 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-label={labels.share} onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium text-black">{labels.share}</h2>
                <p className="mt-1 text-sm text-neutral-500">{labels.dimensions}</p>
              </div>
              <button type="button" className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 hover:text-black" aria-label={labels.close} onClick={() => setIsOpen(false)}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,0.72fr)_minmax(16rem,1fr)] md:items-center">
              <div className="mx-auto w-full max-w-[18rem] overflow-hidden rounded-xl bg-neutral-100 shadow-sm">
                <img src={storyImagePath} alt={labels.preview} className="aspect-[9/16] h-auto w-full object-cover" />
              </div>

              <div className="flex flex-wrap gap-2">
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
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
