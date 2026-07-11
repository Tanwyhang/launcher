"use client";

import Script from "next/script";
import { useRef } from "react";

type TypewriterInstance = {
  stop: () => void;
  typeString: (value: string) => TypewriterInstance;
  start: () => TypewriterInstance;
};

declare global {
  interface Window {
    Typewriter?: new (
      element: HTMLElement,
      options: { cursor: string; delay: number },
    ) => TypewriterInstance;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function TypewriterAnswer({ text }: { text: string }) {
  const outputRef = useRef<HTMLParagraphElement>(null);
  const instanceRef = useRef<TypewriterInstance | null>(null);

  function startTyping() {
    const output = outputRef.current;
    if (!output || !window.Typewriter || instanceRef.current) return;

    output.textContent = "";
    instanceRef.current = new window.Typewriter(output, { cursor: "|", delay: 8 });
    instanceRef.current.typeString(escapeHtml(text)).start();
  }

  return (
    <>
      <Script
        src="https://unpkg.com/typewriter-effect@latest/dist/core.js"
        strategy="afterInteractive"
        onLoad={startTyping}
        onReady={startTyping}
      />
      <p className="sr-only">{text}</p>
      <p ref={outputRef} aria-hidden="true" className="mt-3 min-h-20 text-[1.02rem] leading-relaxed text-black">
        {text}
      </p>
    </>
  );
}
