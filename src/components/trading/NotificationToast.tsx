"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface NotificationToastProps {
  notification: string | null;
}

export const NotificationToast = React.memo<NotificationToastProps>(function NotificationToast({ notification }) {
  if (!notification) return null;

  return (
    <div className="fixed top-16 right-4 z-50 bg-slate-900 border border-cyan-500/40 shadow-xl shadow-cyan-500/10 rounded-lg p-3 text-sm flex items-center gap-3 text-slate-200 animate-in fade-in slide-in-from-top duration-200">
      <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
      <span>{notification}</span>
    </div>
  );
});

