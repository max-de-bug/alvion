"use client";

import React from "react";
import { Check } from "lucide-react";

interface NotificationToastProps {
  notification: string | null;
}

export const NotificationToast = React.memo<NotificationToastProps>(function NotificationToast({ notification }) {
  if (!notification) return null;

  return (
    <div className="fixed top-14 right-4 z-50 bg-slate-900 border border-slate-700 shadow-lg rounded-md px-3.5 py-2.5 text-xs flex items-center gap-2.5 text-slate-200">
      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
      <span>{notification}</span>
    </div>
  );
});
