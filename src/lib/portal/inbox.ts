import "server-only";
import { cache } from "react";
import { createSessionClient } from "@/lib/supabase/session";
import type { NotificationRow, ProfileRow, SupportMessageRow, SupportRequestRow } from "@/lib/supabase/types";

/** Profil de la personne connectée (+ lien temporaire vers sa photo). */
export const getProfile = cache(async (userId: string) => {
  const supabase = await createSessionClient();
  const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  const profile = (data as ProfileRow | null) ?? null;
  let avatarUrl: string | null = null;
  if (profile?.avatar_path) {
    const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(profile.avatar_path, 60 * 60);
    avatarUrl = signed?.signedUrl ?? null;
  }
  return { profile, avatarUrl };
});

export const getNotifications = cache(async (userId: string) => {
  const supabase = await createSessionClient();
  const [{ data }, { count }] = await Promise.all([
    supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(15),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).is("read_at", null),
  ]);
  return { items: (data ?? []) as NotificationRow[], unread: count ?? 0 };
});

export const getConversations = cache(async (organizationId: string) => {
  const supabase = await createSessionClient();
  const { data } = await supabase
    .from("support_requests")
    .select("id, organization_id, establishment_id, user_id, subject, message, status, created_at, last_message_at, client_unread, staff_unread")
    .eq("organization_id", organizationId)
    .order("last_message_at", { ascending: false })
    .limit(50);
  return (data ?? []) as SupportRequestRow[];
});

export async function getThread(requestId: string) {
  const supabase = await createSessionClient();
  const [{ data: request }, { data: messages }] = await Promise.all([
    supabase.from("support_requests").select("*").eq("id", requestId).maybeSingle(),
    supabase.from("support_messages").select("*").eq("request_id", requestId).order("created_at"),
  ]);
  if (!request) return null;
  return { request: request as SupportRequestRow, messages: (messages ?? []) as SupportMessageRow[] };
}
