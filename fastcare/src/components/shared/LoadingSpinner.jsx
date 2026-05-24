"use client";

export default function LoadingSpinner({ size = "md", label = "" }) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-surface2 border-t-primary animate-spin`}
        style={{ borderTopColor: "var(--primary)" }}
      />
      {label && (
        <p className="text-textmuted text-sm font-medium animate-pulse">{label}</p>
      )}
    </div>
  );
}