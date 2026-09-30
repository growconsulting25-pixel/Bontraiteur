/**
 * Génère supabase/seed.sql à partir de src/data/menu.ts.
 *   npm run db:seed:generate
 * Idempotent : « on conflict (slug) do update », on peut le relancer.
 */
import { writeFileSync } from "node:fs";
import { meals } from "../src/data/menu.ts";

const q = (v: string | null) => (v === null ? "null" : `'${v.replace(/'/g, "''")}'`);
const b = (v: boolean | null) => (v === null ? "null" : String(v));
const arr = (values: string[], type: string) => (values.length ? `array[${values.map(q).join(", ")}]::${type}[]` : `'{}'::${type}[]`);

const rows = meals.map(
  (m, i) =>
    `  (${[
      q(m.slug),
      q(m.name),
      q(m.nameEn),
      q(m.sourceName),
      `${q(m.category)}::public.meal_category`,
      `${q(m.mealType)}::public.meal_type`,
      m.rotationType ? `${q(m.rotationType)}::public.rotation_type` : "null",
      arr(m.allergens, "public.allergen"),
      b(m.allergensVerified),
      `${q(m.status)}::public.meal_status`,
      q(m.image),
      b(m.availableHot),
      b(m.availableFrozen),
      b(m.availableReadyToEat),
      String((i + 1) * 10),
    ].join(", ")})`,
);

const sql = `-- GÉNÉRÉ AUTOMATIQUEMENT par scripts/generate-meals-seed.mts — ne pas modifier à la main.
-- Source : src/data/menu.ts (feuille Google Sheets « Menu Complet »).
insert into public.meals (
  slug, name_fr, name_en, source_name, category, meal_type, rotation_type,
  allergens, allergens_verified, status, image_url,
  available_hot, available_frozen, available_ready_to_eat, sort_order
) values
${rows.join(",\n")}
on conflict (slug) do update set
  name_fr = excluded.name_fr,
  name_en = excluded.name_en,
  source_name = excluded.source_name,
  category = excluded.category,
  meal_type = excluded.meal_type,
  rotation_type = excluded.rotation_type,
  allergens = excluded.allergens,
  sort_order = excluded.sort_order;
`;

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`supabase/seed.sql : ${meals.length} plats`);
