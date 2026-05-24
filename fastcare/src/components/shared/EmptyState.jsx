"use client";
import { FileX } from "lucide-react";

export default function EmptyState({ icon: Icon = FileX, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface2 border border-border flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-textmuted" />
      </div>
      <h3 className="text-textprimary font-semibold text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-textmuted text-sm max-w-sm leading-relaxed mb-6">{description}</p>
      )}
      {action && action}
    </div>
  );
}
