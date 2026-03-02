// client/src/components/SidebarNav.jsx
import { Link, useLocation } from 'react-router-dom';

const SidebarNav = ({ role }) => {
  const location = useLocation();

  const links = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/admin/projects', label: 'Projects', icon: '☀️' },
    { path: '/admin/packages', label: 'Solar Packages', icon: '📦' },
    { path: '/admin/panel-brands', label: 'Panel Brands', icon: '🔋' },
    { path: '/admin/inverter-brands', label: 'Inverter Brands', icon: '⚡' },
  ];

  if (role === 'admin') {
    links.splice(1, 0, { path: '/admin/users', label: 'Users', icon: '👥' });
  }

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed top-0 left-0 flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-gray-800">
        S&D Admin
      </div>
      <nav className="flex-1 p-4">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 p-4 rounded-lg mb-2 transition ${
              location.pathname === link.path
                ? 'bg-green-600 text-white'
                : 'hover:bg-gray-800'
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default SidebarNav;