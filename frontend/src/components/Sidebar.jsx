import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analyze", label: "Analyze Review" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" },
];

export default function Sidebar() {
  return (
    <aside className="w-full bg-white p-4 shadow md:w-56 md:min-h-[calc(100vh-52px)]">
      <ul className="flex gap-2 md:flex-col">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? "bg-indigo-600 font-semibold text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}