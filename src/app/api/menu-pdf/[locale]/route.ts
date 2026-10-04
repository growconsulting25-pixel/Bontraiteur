import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { getMeals } from "@/lib/menu-repository";
import { mealName } from "@/lib/meal-name";
import { allergenTone } from "@/lib/allergen-tone";
import { SAMPLE_SLOTS, sampleWeeks } from "@/lib/menu-sample";
import { menuFilterOrder } from "@/data/menu";
import { site } from "@/data/site";
import { getDictionary, locales, type Locale } from "@/i18n";
import type { Meal, MealCategory } from "@/lib/types";

/**
 * Menu complet en PDF (tous les plats + exemple de 2 semaines), à imprimer ou partager.
 * Généré au build pour chaque langue.
 */
export const dynamic = "force-static";
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const hex = (h: string): RGB => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const C = {
  ink: hex("#1d1d1b"),
  soft: hex("#55534d"),
  olive: hex("#4f5d1d"),
  oliveSoft: hex("#e3e6cf"),
  line: hex("#ded4c2"),
  cream: hex("#f7f1e7"),
  paper: hex("#fffcf7"),
  saffron: hex("#f5b83d"),
  saffronSoft: hex("#fbe6b5"),
  coral: hex("#f5927a"),
  white: rgb(1, 1, 1),
};
const toneFill = { milkEggs: C.saffron, milk: C.coral, eggs: C.saffronSoft, fish: C.oliveSoft } as const;

/** Les polices standard PDF ne couvrent que WinAnsi : on remplace les rares caractères hors jeu. */
const clean = (s: string) => s.replace(/[  ]/g, " ").replace(/[^\x00-\xffŒœ–—‘’“”…•€]/g, "");

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const words = clean(text).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = (locales as readonly string[]).includes(raw) ? (raw as Locale) : "fr";
  const d = getDictionary(locale);
  const t = d.menu;
  const meals = await getMeals();

  const pdf = await PDFDocument.create();
  pdf.setTitle(`${site.name} — ${t.pdfTitle}`);
  pdf.setAuthor(site.name);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const phones = site.contact.phones.map((p) => p.display).join("   ·   ");

  const text = (page: PDFPage, s: string, x: number, y: number, size: number, font = regular, color = C.ink) =>
    page.drawText(clean(s), { x, y, size, font, color });

  const footer = (page: PDFPage) => {
    const { width } = page.getSize();
    page.drawLine({ start: { x: 40, y: 46 }, end: { x: width - 40, y: 46 }, thickness: 0.6, color: C.line });
    wrap(t.allergenDisclaimer, regular, 7.5, width - 80).forEach((l, i) => text(page, l, 40, 34 - i * 9.5, 7.5, regular, C.soft));
  };

  /* ---------------- Pages « menu complet » (portrait, 2 colonnes) ---------------- */
  const W = 612, H = 792, M = 40, GAP = 24;
  const colW = (W - 2 * M - GAP) / 2;
  let page = pdf.addPage([W, H]);
  let col = 0;
  let y = 0;

  const header = (p: PDFPage, first: boolean) => {
    p.drawRectangle({ x: 0, y: H - 74, width: W, height: 74, color: C.olive });
    text(p, site.name.toUpperCase(), M, H - 40, 20, bold, C.cream);
    text(p, t.pdfSubtitle, M, H - 58, 9.5, regular, C.cream);
    const pw = regular.widthOfTextAtSize(clean(phones), 9.5);
    text(p, phones, W - M - pw, H - 40, 9.5, bold, C.cream);
    if (first) {
      text(p, t.pdfTitle, M, H - 112, 22, bold);
      return H - 140;
    }
    return H - 100;
  };
  y = header(page, true);
  footer(page);
  const bottom = 64;
  const newColumn = () => {
    if (col === 0) {
      col = 1;
      y = page === pdf.getPage(0) ? H - 140 : H - 100;
    } else {
      page = pdf.addPage([W, H]);
      col = 0;
      y = header(page, false);
      footer(page);
    }
  };
  const x0 = () => M + col * (colW + GAP);

  const categories = menuFilterOrder.filter((c): c is MealCategory => c !== "tous");
  for (const category of categories) {
    const items = meals.filter((m) => m.category === category);
    if (!items.length) continue;
    if (y - 40 < bottom) newColumn();
    page.drawRectangle({ x: x0(), y: y - 6, width: colW, height: 22, color: C.oliveSoft });
    text(page, t.categories[category], x0() + 8, y + 1, 11.5, bold, C.olive);
    y -= 24;
    for (const m of items) {
      const nameLines = wrap(mealName(m, locale), bold, 9.5, colW - 8);
      const extra = [
        m.rotationType === "ponctuelle" ? t.pdfOccasional : "",
        m.allergens.length ? `${t.allergensDeclared} ${m.allergens.map((a) => t.allergens[a]).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("  ·  ");
      const need = nameLines.length * 11.5 + (extra ? 10.5 : 0) + 4.5;
      if (y - need < bottom) newColumn();
      nameLines.forEach((l) => {
        text(page, l, x0() + 4, y, 9.5, bold);
        y -= 11.5;
      });
      if (extra) {
        text(page, extra, x0() + 4, y + 1, 7.8, regular, C.soft);
        y -= 10.5;
      }
      page.drawLine({ start: { x: x0() + 4, y: y + 4 }, end: { x: x0() + colW, y: y + 4 }, thickness: 0.4, color: C.line });
      y -= 4.5;
    }
    y -= 8;
  }

  /* ---------------- Exemple de 2 semaines (paysage) ---------------- */
  const LW = 792, LH = 612;
  const weeks = sampleWeeks(meals);
  weeks.forEach((days, w) => {
    const p = pdf.addPage([LW, LH]);
    p.drawRectangle({ x: 0, y: LH - 56, width: LW, height: 56, color: C.olive });
    text(p, site.name.toUpperCase(), M, LH - 34, 16, bold, C.cream);
    const ph = regular.widthOfTextAtSize(clean(phones), 9);
    text(p, phones, LW - M - ph, LH - 34, 9, bold, C.cream);
    text(p, `${t.pdfSample} · ${t.sampleWeek.replace("{n}", String(w + 1))}`, M, LH - 88, 16, bold);

    const labelW = 92, gap = 4;
    const dayW = (LW - 2 * M - labelW - 5 * gap) / 5;
    let top = LH - 106;
    // En-têtes des jours
    d.calendar.days.forEach((day, i) => {
      const x = M + labelW + gap + i * (dayW + gap);
      p.drawRectangle({ x, y: top - 24, width: dayW, height: 24, color: C.olive });
      const tw = bold.widthOfTextAtSize(clean(day), 10);
      text(p, day, x + (dayW - tw) / 2, top - 16, 10, bold, C.cream);
    });
    top -= 24 + gap;
    for (const slot of SAMPLE_SLOTS) {
      const rowH = slot === "repas" ? 78 : 50;
      p.drawRectangle({ x: M, y: top - rowH, width: labelW, height: rowH, color: C.oliveSoft });
      wrap(d.calendar.slots[slot], bold, 8.5, labelW - 12).forEach((l, i) => text(p, l, M + 6, top - 16 - i * 10, 8.5, bold, C.olive));
      days.forEach((day, i) => {
        const meal: Meal | undefined = day[slot];
        const x = M + labelW + gap + i * (dayW + gap);
        const tone = meal ? allergenTone(meal.allergens) : null;
        p.drawRectangle({
          x,
          y: top - rowH,
          width: dayW,
          height: rowH,
          color: tone ? toneFill[tone] : C.paper,
          borderColor: C.line,
          borderWidth: 0.6,
        });
        const size = slot === "repas" ? 9.5 : 8.5;
        wrap(meal ? mealName(meal, locale) : "—", bold, size, dayW - 12)
          .slice(0, 5)
          .forEach((l, k) => text(p, l, x + 6, top - 15 - k * (size + 2.5), size, bold));
      });
      top -= rowH + gap;
    }
    // Légende
    let lx = M;
    const ly = top - 18;
    text(p, `${t.legendTitle} :`, lx, ly, 8.5, bold);
    lx += bold.widthOfTextAtSize(clean(`${t.legendTitle} :`), 8.5) + 10;
    (
      [
        ["milkEggs", d.calendar.legendMilkEggs],
        ["milk", d.calendar.legendMilk],
        ["eggs", d.calendar.legendEggs],
        ["fish", d.calendar.legendFish],
      ] as const
    ).forEach(([k, label]) => {
      p.drawRectangle({ x: lx, y: ly - 2, width: 18, height: 9, color: toneFill[k], borderColor: C.line, borderWidth: 0.5 });
      text(p, label, lx + 23, ly, 8.5);
      lx += 23 + regular.widthOfTextAtSize(clean(label), 8.5) + 16;
    });
    wrap(t.pdfSampleNote, regular, 8, LW - 2 * M).forEach((l, i) => text(p, l, M, ly - 18 - i * 10, 8, regular, C.soft));
    footer(p);
  });

  const bytes = await pdf.save();
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${t.pdfFile}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
