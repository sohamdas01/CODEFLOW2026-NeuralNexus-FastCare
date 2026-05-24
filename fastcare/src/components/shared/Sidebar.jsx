"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();
  const role = session?.user?.isDoctor ? "doctor" : "patient";
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
          bg-[#111111] border-r border-[#1f2d1f] hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.1)] transition
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1f2d1f]">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shadow-[0_0_20px_rgba(22,163,74,0.1)]">
            <Heart className="w-4 h-4 text-[#f0fdf4]" fill="white" />
          </div>
          <div>
            <span className="text-[#f0fdf4] font-bold text-lg tracking-tight">Fastcare</span>
            <div className="text-xs text-[#6b7280] font-mono">v1.0</div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-6 py-3 border-b border-[#1f2d1f]">
          <span className={`text-xs font-mono px-2 py-1 rounded-md border ${
            role === "doctor"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
              : "bg-green-600/10 text-green-400 border-green-600/30"
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
                    ? "bg-green-600/10 text-green-400 border-l-2 border-green-600 rounded-none shadow-[0_0_20px_rgba(22,163,74,0.1)]"
                    : "text-[#6b7280] hover:text-[#f0fdf4] hover:bg-[#1a1a1a]"
                  }
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-green-600" : "text-[#6b7280] group-hover:text-[#f0fdf4]"}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-green-600" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-[#1f2d1f]">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors">
            <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center text-green-600 font-bold text-sm">
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#f0fdf4] text-sm font-medium truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-[#6b7280] text-xs truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
