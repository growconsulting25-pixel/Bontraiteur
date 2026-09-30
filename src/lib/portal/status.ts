import type { DeliveryStatus, InvoiceStatus, MonthlyMenuStatus, OrderStatus, SupportStatus } from "@/lib/supabase/types";

type Tone = "good" | "warn" | "bad" | "neutral";

export const menuTone: Record<MonthlyMenuStatus, Tone> = { brouillon: "neutral", publie: "warn", confirme: "good", modifie: "good" };
export const orderTone: Record<OrderStatus, Tone> = { brouillon: "neutral", soumise: "warn", confirmee: "good", annulee: "neutral", livree: "good" };
export const deliveryTone: Record<DeliveryStatus, Tone> = { planifiee: "warn", en_route: "warn", livree: "good", suspendue: "neutral", annulee: "neutral" };
export const invoiceTone: Record<InvoiceStatus, Tone> = { brouillon: "neutral", a_payer: "warn", payee: "good", en_retard: "bad", annulee: "neutral" };
export const supportTone: Record<SupportStatus, Tone> = { ouverte: "warn", resolue: "good" };
