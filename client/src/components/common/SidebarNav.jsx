// src/components/common/SidebarNav.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUsers,
  faSun,
  faBox,
  faBatteryFull,
  faBolt,
  faSignOutAlt,
  faBars,
  faTimes,
  faHorseHead,
  faMailBulk,
} from '@fortawesome/free-solid-svg-icons';
import { logout } from '../../utils/auth';
import Swal from 'sweetalert2';

const SidebarNav = ({ role }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: faHome },
    { path: '/admin/projects', label: 'Projects', icon: faSun },
    { path: '/admin/packages', label: 'Solar Packages', icon: faBox },
    { path: '/admin/inquiries', label: 'Inquiries', icon: faMailBulk },
    { path: '/admin/brands', label: 'Brands', icon: faHorseHead },
    { path: '/admin/capacities', label: 'Capacities', icon: faBolt },
    { path: '/admin/batteries', label: 'Batteries', icon: faBatteryFull },
  ];

  if (role === 'admin') {
    links.splice(1, 0, { path: '/admin/users', label: 'Users', icon: faUsers });
  }

  const handleLogout = async () => {
    const confirmed = await Swal.fire({
      title: 'Log out?',
      text: 'You will be logged out of the admin panel.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, log out',
    });

    if (confirmed.isConfirmed) {
      logout('You have been logged out successfully.');
    }
  };

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gray-900 text-white rounded-full shadow-lg focus:outline-none"
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="lg" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - removed lg:relative to keep it fixed always */}
      <aside
        className={`w-64 bg-gray-900 text-white fixed inset-y-0 left-0 z-50 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 text-2xl font-bold border-b border-gray-800 flex items-center justify-between shrink-0">
          <span>S & D Admin</span>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-white focus:outline-none"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-1 p-3 rounded-lg mb-1 transition ${
                location.pathname === link.path
                  ? 'bg-green-600 text-white'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={link.icon} className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800 mt-auto shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 transition"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarNav;