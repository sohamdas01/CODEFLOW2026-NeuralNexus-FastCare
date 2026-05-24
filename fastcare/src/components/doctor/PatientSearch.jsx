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
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
  "": "bg-[#1a1a1a] text-[#f0fdf4] border-[#1f2d1f]",
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280] pointer-events-none" />
        <input
          type="text"
          placeholder="Search patients by name..."
          value={searchValue}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-10 py-2.5 bg-[#111111] border border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition rounded-xl text-[#f0fdf4] placeholder-textmuted focus:outline-none focus:border-green-600 text-sm transition-colors"
        />
        {searchValue && (
          <button
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#f0fdf4] transition-colors"
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
                ? value ? RISK_COLORS[value] : "bg-green-600/15 text-green-400 border-green-600/40"
                : "bg-[#1a1a1a] text-[#6b7280] border-[#1f2d1f] hover:border-green-600/30 hover:text-[#f0fdf4]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}