"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Upload,
  Clock,
  CreditCard,
  User,
  Users,
  Bell,
  Activity,
  ChevronRight,
  Heart,
} from "lucide-react";

const patientNav = [
  { href: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/patient/upload", icon: Upload, label: "Upload Record" },
  { href: "/patient/timeline", icon: Clock, label: "Timeline" },
  { href: "/patient/emergency-card", icon: CreditCard, label: "Emergency Card" },
  { href: "/patient/profile", icon: User, label: "Profile" },
];

const doctorNav = [
  { href: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/doctor/patients", icon: Users, label: "Patients" },
  { href: "/doctor/alerts", icon: Bell, label: "Alerts" },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role;
  const navItems = role === "doctor" ? doctorNav : patientNav;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-surface border-r border-border
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-green">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <div>
            <span className="text-textprimary font-bold text-lg tracking-tight">Fastcare</span>
            <div className="text-xs text-textmuted font-mono">v1.0</div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-6 py-3 border-b border-border">
          <span className={`text-xs font-mono px-2 py-1 rounded-md border ${
            role === "doctor"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
              : "bg-primary/10 text-accent border-primary/30"
          }`}>
            {role === "doctor" ? "PHYSICIAN" : "PATIENT"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group
                  ${isActive
                    ? "bg-primary/15 text-accent border border-primary/30 glow-green"
                    : "text-textmuted hover:text-textprimary hover:bg-surface2"
                  }
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-textmuted group-hover:text-textprimary"}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface2 transition-colors">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-textprimary text-sm font-medium truncate">
                {user?.fullName || user?.firstName || "User"}
              </p>
              <p className="text-textmuted text-xs truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
