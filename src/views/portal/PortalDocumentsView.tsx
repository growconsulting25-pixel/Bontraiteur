import { FileText } from "lucide-react";
import { Card, EmptyState, PageTitle } from "@/components/portal/ui/PortalUI";
import { requireClient } from "@/lib/auth";
import { getDocuments } from "@/lib/portal/data";
import { formatDate } from "@/lib/format";
import { getDictionary, type Locale } from "@/i18n";

export async function PortalDocumentsView({ locale }: { locale: Locale }) {
  const ctx = await requireClient(locale);
  const t = getDictionary(locale).portal.documents;
  const documents = await getDocuments(ctx.organization.id);

  return (
    <>
      <PageTitle title={t.title} lead={t.lead} />
      {documents.length === 0 ? (
        <EmptyState>{t.empty}</EmptyState>
      ) : (
        <ul className="grid gap-3">
          {documents.map((doc) => (
            <li key={doc.name}>
              <Card className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText aria-hidden="true" className="size-5 shrink-0 text-coral-ink" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{doc.name}</p>
                    {doc.createdAt && <p className="text-sm text-ink-soft">{formatDate(doc.createdAt.slice(0, 10), locale)}</p>}
                  </div>
                </div>
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-line hover:ring-charcoal">
                    {t.open}
                  </a>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
