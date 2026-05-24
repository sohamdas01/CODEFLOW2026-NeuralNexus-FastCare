 
export const RISK_LEVELS = {
  low: {
    label: "Low Risk",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
    dotColor: "bg-success",
    badgeClass: "bg-success/10 text-success border border-success/30",
  },
  medium: {
    label: "Medium Risk",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    dotColor: "bg-warning",
    badgeClass: "bg-warning/10 text-warning border border-warning/30",
  },
  high: {
    label: "High Risk",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    dotColor: "bg-orange-400",
    badgeClass: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
  },
  critical: {
    label: "Critical",
    color: "text-critical",
    bgColor: "bg-critical/10",
    borderColor: "border-critical/30",
    dotColor: "bg-critical",
    badgeClass: "bg-critical/10 text-critical border border-critical/30",
  },
};
 
export function getRiskConfig(level) {
  return RISK_LEVELS[level] || RISK_LEVELS.low;
}
 
export function getRiskBadgeClass(level) {
  return getRiskConfig(level).badgeClass;
}
 
export function getRiskLabel(level) {
  return getRiskConfig(level).label;
}
 
export function getRiskDotColor(level) {
  return getRiskConfig(level).dotColor;
}