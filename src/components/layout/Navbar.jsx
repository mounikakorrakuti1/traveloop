import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Bell, Plane, Home, Map, Building2, Search, Globe, User, Settings, LogOut, Sun, Moon, HelpCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { getUserAvatarUrl } from "@/lib/avatar";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "./ThemeProvider";
import { logout } from "@/api/auth.api";
import { startGuidedTour } from "./GuidedTour";
import { Avatar } from "@/components/shared/Avatar";
import "@/styles/components/navbar.css";

const navLinks = [
  { label: "Dashboard", to: ROUTES.home,      icon: <Home size={18} /> },
  { label: "My Trips",  to: ROUTES.trips,     icon: <Map size={18} /> },
  { label: "Cities",    to: ROUTES.cities,    icon: <Building2 size={18} /> },
  { label: "Search",    to: ROUTES.search,    icon: <Search size={18} /> },
  { label: "Community", to: ROUTES.community, icon: <Globe size={18} /> },
];

export function Navbar() {
  const user          = useAuthStore((s) => s.user);
  const storeLogout   = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useTheme();
  const navigate      = useNavigate();

  const [menuOpen, setMenuOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout().catch(() => {});
    storeLogout();
    navigate(ROUTES.landing, { replace: true });
  };

  const avatarUrl = user ? getUserAvatarUrl(user) : "";
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={ROUTES.home} className="navbar-logo">
          <span className="navbar-logo-text">Travel<Plane size={20} style={{ display: "inline-block", marginInline: "2px", verticalAlign: "middle", color: "var(--cl-accent)" }} />Loop</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span className="nav-link-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        {user && (
          <button
            className="theme-toggle"
            title="Start website tour"
            aria-label="Start website tour"
            onClick={startGuidedTour}
          >
            <HelpCircle size={18} color="rgba(244,241,222,0.7)" />
          </button>
        )}

        {user && (
          <button
            className="theme-toggle"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell size={18} color="rgba(244,241,222,0.7)" />
          </button>
        )}

          {/* User menu */}
          {user && (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <Avatar 
                  name={user.name} 
                  url={avatarUrl} 
                  size="sm" 
                />
                <span style={{ fontSize: "var(--fs-sm)", color: "rgba(244,241,222,0.7)" }}>
                  {user.name?.split(" ")[0]}
                </span>
                <span style={{ fontSize: "0.6rem", color: "rgba(244,241,222,0.5)" }}>▼</span>
              </button>

              {menuOpen && (
                <div className="user-menu-dropdown" role="menu">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{user.name}</div>
                    <div className="dropdown-email">{user.email}</div>
                  </div>
                  <Link
                    to={ROUTES.profile}
                    className="dropdown-item"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                    <User size={16} /> Profile
                  </Link>
                  <Link
                    to={ROUTES.trips}
                    className="dropdown-item"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                    <Map size={16} /> My Trips
                  </Link>
                  {user.isAdmin && (
                    <Link
                      to={ROUTES.admin}
                      className="dropdown-item"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      <Settings size={16} /> Admin Panel
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item dropdown-item-danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle mobile menu"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className={`mobile-nav${mobileOpen ? " open" : ""}`} aria-label="Mobile navigation">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="nav-link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
