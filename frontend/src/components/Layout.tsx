import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Settings,
  Search,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/resume", icon: FileText, label: "Resume" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">
              Job Recommender
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Find your perfect entry-level role
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60">
        <div className="max-w-7xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
