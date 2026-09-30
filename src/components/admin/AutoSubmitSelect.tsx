"use client";

import type { ComponentProps } from "react";

export function AutoSubmitSelect(props: ComponentProps<"select">) {
  return (
    <select
      {...props}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className={props.className ?? "h-9 rounded-[var(--radius-sm)] bg-paper px-2 text-sm ring-1 ring-line"}
    />
  );
}
