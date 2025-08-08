import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaClipboardList } from "react-icons/fa";

const AdminLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: "Dashboard", icon: <FaHome />, path: "/admin/dashboard" },
    { label: "Người dùng", icon: <FaUser />, path: "/admin/users" },
    {
      label: "Quản lý đơn hàng",
      icon: <FaClipboardList />,
      path: "/admin/orders",
    },
  ];

  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <aside className='w-64 bg-black text-white p-5 space-y-4'>
        <h2 className='text-2xl text-blue-500 font-bold mb-6'>
          Welcome Admin{" "}
        </h2>
        <nav className='flex flex-col gap-3'>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 transition ${
                currentPath === item.path ? "bg-gray-700" : ""
              }`}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className='flex-1 bg-gray-100 p-6'>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
