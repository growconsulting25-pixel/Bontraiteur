"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markConversationRead } from "@/lib/actions/inbox";

/** Marque la conversation comme lue à l'ouverture (pastilles mises à jour). */
export function MarkRead({ requestId, unread }: { requestId: string; unread: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (unread) void markConversationRead(requestId).then(() => router.refresh());
  }, [requestId, unread, router]);
  return null;
}
