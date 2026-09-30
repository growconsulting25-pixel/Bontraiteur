import { PageTitle } from "@/components/portal/ui/PortalUI";
import { Flash, Label, SubmitButton, inputClass } from "@/components/admin/AdminUI";
import { createSessionClient } from "@/lib/supabase/session";
import { MEAL_COLUMNS, type MealRow } from "@/lib/supabase/rows";
import { updateMeal } from "@/lib/actions/admin";
import { getDictionary } from "@/i18n";

export const metadata = { title: "Repas" };

const tri = (v: boolean | null) => (v === true ? "oui" : v === false ? "non" : "");

export default async function AdminMealsPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams;
  const d = getDictionary("fr").menu;
  // Tous les plats, y compris « indisponible » (l'équipe peut les réactiver)
  const supabase = await createSessionClient();
  const { data } = await supabase.from("meals").select(MEAL_COLUMNS).order("sort_order");
  const meals = (data ?? []) as MealRow[];

  return (
    <>
      <PageTitle title="Repas" lead="Source de vérité du menu : ce que vous modifiez ici apparaît sur le site public et dans le portail." />
      <Flash msg={msg} />
      <ul className="grid gap-3">
        {meals.map((m) => (
          <li key={m.id}>
            <details className="group rounded-[var(--radius-lg)] bg-paper ring-1 ring-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="font-semibold">{m.name_fr}</span>
                  <span className="ml-2 text-sm text-ink-soft">{d.categories[m.category]}{m.rotation_type ? ` · ${d.rotations[m.rotation_type]}` : ""}{m.status === "indisponible" ? " · masqué" : ""}</span>
                </span>
                <span className="flex items-center gap-2 text-xs">
                  {!m.image_url && <span className="rounded-full bg-saffron-soft px-2 py-0.5 font-bold">sans photo</span>}
                  {!m.allergens_verified && <span className="rounded-full bg-coral-soft px-2 py-0.5 font-bold text-coral-ink">allergènes à valider</span>}
                </span>
              </summary>
              <form action={updateMeal} className="grid gap-3 border-t border-line p-4 sm:grid-cols-2">
                <input type="hidden" name="id" value={m.id} />
                <Label text="Nom (FR)"><input name="nameFr" defaultValue={m.name_fr} required className={inputClass} /></Label>
                <Label text="Nom (EN)"><input name="nameEn" defaultValue={m.name_en} required className={inputClass} /></Label>
                <Label text="Description (FR)"><input name="descriptionFr" defaultValue={m.description_fr} className={inputClass} /></Label>
                <Label text="Description (EN)"><input name="descriptionEn" defaultValue={m.description_en} className={inputClass} /></Label>
                <Label text="URL de la photo" className="sm:col-span-2"><input name="imageUrl" defaultValue={m.image_url ?? ""} placeholder="https://… ou /images/plat.jpg" className={inputClass} /></Label>
                <Label text="Statut">
                  <select name="status" defaultValue={m.status} className={inputClass}>
                    <option value="disponible">Disponible</option>
                    <option value="saisonnier">Saisonnier</option>
                    <option value="indisponible">Indisponible (masqué)</option>
                  </select>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["hot", "Chaud", m.available_hot],
                    ["ready", "Prêt-à-manger", m.available_ready_to_eat],
                    ["frozen", "Congelé", m.available_frozen],
                  ].map(([name, label, value]) => (
                    <Label key={name as string} text={label as string}>
                      <select name={name as string} defaultValue={tri(value as boolean | null)} className={inputClass}>
                        <option value="">?</option>
                        <option value="oui">Oui</option>
                        <option value="non">Non</option>
                      </select>
                    </Label>
                  ))}
                </div>
                <fieldset className="flex flex-wrap items-center gap-4 text-sm sm:col-span-2">
                  <legend className="mb-1 font-semibold">Allergènes déclarés</legend>
                  {(Object.keys(d.allergens) as Array<keyof typeof d.allergens>).map((a) => (
                    <label key={a} className="flex items-center gap-2">
                      <input type="checkbox" name="allergens" value={a} defaultChecked={m.allergens.includes(a)} /> {d.allergens[a]}
                    </label>
                  ))}
                  <label className="ml-auto flex items-center gap-2 font-semibold">
                    <input type="checkbox" name="allergensVerified" defaultChecked={m.allergens_verified} /> Allergènes validés par l&apos;équipe
                  </label>
                </fieldset>
                <div className="sm:col-span-2"><SubmitButton>Enregistrer</SubmitButton></div>
              </form>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}
