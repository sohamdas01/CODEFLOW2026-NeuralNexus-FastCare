"use client";
import { FileX } from "lucide-react";

export default function EmptyState({ icon: Icon = FileX, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#1f2d1f] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#6b7280]" />
      </div>
      <h3 className="text-[#f0fdf4] font-semibold text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-[#6b7280] text-sm max-w-sm leading-relaxed mb-6">{description}</p>
      )}
      {action && action}
    </div>
  );
}
