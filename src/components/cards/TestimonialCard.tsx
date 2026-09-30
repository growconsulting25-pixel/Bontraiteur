import { Badge } from "@/components/ui/Badge";

export function TestimonialCard({
  quote,
  author,
  role,
  isPlaceholder,
}: {
  quote: string;
  author: string;
  role: string;
  isPlaceholder?: boolean;
}) {
  return (
    <figure className="flex h-full flex-col rounded-[var(--radius-lg)] bg-paper p-7 ring-1 ring-line sm:p-8">
      {isPlaceholder && (
        <Badge tone="coral" className="mb-6 w-fit">
          Témoignage à venir — exemple
        </Badge>
      )}
      <span aria-hidden="true" className="accent-serif text-6xl leading-[0.5] text-coral">
        “
      </span>
      <blockquote className="mt-4 flex-1 text-lg leading-relaxed">
        <p>{quote}</p>
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-3 border-t border-line pt-5">
        <span aria-hidden="true" className="size-11 shrink-0 rounded-full bg-cream-deep ring-2 ring-saffron" />
        <span>
          <span className="block font-semibold">{author}</span>
          <span className="block text-sm text-ink-soft">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}
