import { NavLink } from "react-router-dom";
import { LayoutDashboard, Search, History, User } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze", label: "Analyze Review", icon: Search },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  return (
    <aside className="w-full bg-white p-4 shadow md:min-h-[calc(100vh-52px)] md:w-60">
      <ul className="flex gap-2 overflow-x-auto md:flex-col">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-indigo-600 font-semibold text-white shadow"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}