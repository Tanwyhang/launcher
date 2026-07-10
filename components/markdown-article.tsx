import type { ReactNode } from "react";

type Props = {
  markdown: string;
  className?: string;
};

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <strong key={`${match.index}-${match[2]}`} className="font-medium text-black">
        {match[2]}
      </strong>,
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function MarkdownArticle({ markdown, className = "" }: Props) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const elements: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    elements.push(
      <p key={`p-${elements.length}`} className="mt-5 text-[1.05rem] leading-relaxed text-neutral-800">
        {renderInline(paragraph.join(" ").trim())}
      </p>,
    );
    paragraph = [];
  };

  const flushList = () => {
    if (list.length === 0) return;
    elements.push(
      <ul key={`ul-${elements.length}`} className="mt-5 space-y-3 pl-6 text-[1.05rem] leading-relaxed text-neutral-800">
        {list.map((item, index) => (
          <li key={index} className="list-disc">
            {renderInline(item)}
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const Tag = level === 2 ? "h2" : "h3";
      elements.push(
        <Tag
          key={`h-${elements.length}`}
          className={level === 2 ? "mt-14 text-3xl font-medium leading-tight text-black" : "mt-10 text-2xl font-medium leading-tight text-black"}
        >
          {renderInline(heading[2])}
        </Tag>,
      );
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return <div className={className}>{elements}</div>;
}
