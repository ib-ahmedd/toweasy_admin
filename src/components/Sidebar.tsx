"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/" },
    { name: "All Requests", href: "/requests" },
    { name: "Accepted Requests", href: "/accepted-requests" },
    { name: "Disputes", href: "/disputes" },
    { name: "Applications", href: "/applications" },
    { name: "Drivers", href: "/drivers" },
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className={`sidebar-toggle ${isOpen ? "open" : ""}`}
        onClick={handleToggle}
        aria-label="Toggle Sidebar"
        aria-expanded={isOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div
          className="sidebar-brand"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>TowEasy Admin</h2>
          <button
            className="sidebar-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close Sidebar"
          >
            &times;
          </button>
        </div>
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={pathname === item.href ? "active" : ""}
                  onClick={handleLinkClick}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {isOpen && (
        <div
          className="sidebar-overlay active"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
