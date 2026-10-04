import Link from "next/link";
import type { ReactNode } from "react";

/** Liens autorisés dans les réponses : pages du site, téléphone, courriel. */
const safeHref = (url: string) => /^(\/(?!\/)|tel:|mailto:)/.test(url);

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      const [label, url] = [m[1], m[2]];
      out.push(
        safeHref(url) ? (
          url.startsWith("/") ? (
            <Link key={`${key}-${i}`} href={url} className="font-semibold underline underline-offset-2 hover:text-olive">
              {label}
            </Link>
          ) : (
            <a key={`${key}-${i}`} href={url} className="font-semibold underline underline-offset-2 hover:text-olive">
              {label}
            </a>
          )
        ) : (
          label
        ),
      );
    } else out.push(<strong key={`${key}-${i}`}>{m[3]}</strong>);
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Mini rendu Markdown (paragraphes, listes, gras, liens) pour les réponses de l'assistant. */
export function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="grid list-disc gap-1 pl-5">
        {list.map((l, i) => (
          <li key={i}>{inline(l, `li-${blocks.length}-${i}`)}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const item = line.match(/^(?:[-•*]|\d+[.)])\s+(.*)$/);
    if (item) {
      list.push(item[1]);
      continue;
    }
    flush();
    if (line) blocks.push(<p key={`p-${blocks.length}`}>{inline(line.replace(/^#+\s*/, ""), `p-${blocks.length}`)}</p>);
  }
  flush();
  return <div className="grid gap-2">{blocks}</div>;
}
