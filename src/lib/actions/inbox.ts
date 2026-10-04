"use server";

import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/session";
import { getAccount, getUser } from "@/lib/auth";
import { notifyTeam } from "@/lib/email";

/**
 * Notifications, messagerie et profil (portail client).
 * Toutes les écritures passent par la session : la RLS limite chacun à ses données.
 */

const refreshPortal = () => {
  revalidatePath("/portail", "layout");
  revalidatePath("/en/portal", "layout");
};

export async function markNotificationsRead(ids?: string[]) {
  const user = await getUser();
  if (!user) return;
  const supabase = await createSessionClient();
  let q = supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  if (ids?.length) q = q.in("id", ids.slice(0, 50));
  await q;
  refreshPortal();
}

export async function markConversationRead(requestId: string) {
  const supabase = await createSessionClient();
  await supabase.rpc("mark_conversation_read", { p_request_id: requestId });
}

export type ReplyState = { status: "idle" | "sent" | "error" };

/** Réponse du client dans une conversation : l'équipe est avisée par courriel. */
export async function replyToConversation(_: ReplyState, formData: FormData): Promise<ReplyState> {
  const user = await getUser();
  const requestId = String(formData.get("requestId") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (!user || !requestId || !body) return { status: "error" };
  const supabase = await createSessionClient();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
  const { data: request } = await supabase.from("support_requests").select("subject, establishment_id").eq("id", requestId).maybeSingle();
  if (!request) return { status: "error" };
  const { error } = await supabase
    .from("support_messages")
    .insert({ request_id: requestId, author_id: user.id, from_staff: false, author_name: profile?.full_name || user.email, body });
  if (error) return { status: "error" };

  const account = await getAccount();
  const est = account?.establishments.find((e) => e.id === request.establishment_id);
  await notifyTeam(`Réponse client — ${est?.name ?? ""} : ${request.subject}`, [`De : ${user.email}`, "", body], user.email ?? undefined);
  refreshPortal();
  return { status: "sent" };
}

export type ProfileState = { status: "idle" | "saved" | "error" };

const AVATAR_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Profil : nom, téléphone, photo (dossier privé avatars/<user_id>/), préférences. */
export async function saveProfile(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await getUser();
  if (!user) return { status: "error" };
  const supabase = await createSessionClient();
  const { data: current } = await supabase.from("profiles").select("avatar_path").eq("user_id", user.id).maybeSingle();
  let avatarPath: string | null = current?.avatar_path ?? null;

  const file = formData.get("avatar");
  const remove = formData.get("removeAvatar") === "1";
  if (file instanceof File && file.size > 0) {
    const ext = AVATAR_TYPES[file.type];
    if (!ext || file.size > 3 * 1024 * 1024) return { status: "error" };
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: false });
    if (error) return { status: "error" };
    if (avatarPath) await supabase.storage.from("avatars").remove([avatarPath]);
    avatarPath = path;
  } else if (remove && avatarPath) {
    await supabase.storage.from("avatars").remove([avatarPath]);
    avatarPath = null;
  }

  const { error } = await supabase.from("profiles").upsert({
    user_id: user.id,
    full_name: String(formData.get("fullName") ?? "").trim().slice(0, 120) || null,
    phone: String(formData.get("phone") ?? "").trim().slice(0, 40) || null,
    avatar_path: avatarPath,
    email_reminders: formData.get("emailReminders") === "on",
    updated_at: new Date().toISOString(),
  });
  if (error) return { status: "error" };
  refreshPortal();
  return { status: "saved" };
}
