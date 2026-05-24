"use client";
import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";

const RISK_FILTERS = [
  { value: "", label: "All Risk" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const RISK_COLORS = {
  critical: "bg-critical/10 text-critical border-critical/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  low: "bg-success/10 text-success border-success/30",
  "": "bg-surface2 text-textprimary border-border",
};

export default function PatientSearch({ onSearch, onRiskFilter, searchValue, riskValue }) {
  const handleSearchChange = useCallback(
    (e) => onSearch(e.target.value),
    [onSearch]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textmuted pointer-events-none" />
        <input
          type="text"
          placeholder="Search patients by name..."
          value={searchValue}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-xl text-textprimary placeholder-textmuted focus:outline-none focus:border-primary text-sm transition-colors"
        />
        {searchValue && (
          <button
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-textmuted hover:text-textprimary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Risk filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {RISK_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onRiskFilter(value)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-150 ${
              riskValue === value
                ? value ? RISK_COLORS[value] : "bg-primary/15 text-accent border-primary/40"
                : "bg-surface2 text-textmuted border-border hover:border-primary/30 hover:text-textprimary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}