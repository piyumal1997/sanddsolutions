// src/components/common/Header.jsx
import { useState, useRef, useLayoutEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faPhoneAlt, faEnvelope, faBars, faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faLinkedinIn, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { company } from '../../data/company';
import { divisions } from '../../data/divisions';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // For desktop dropdown
  const topBarRef = useRef(null);
  const headerRef = useRef(null);
  const [headerTop, setHeaderTop] = useState(60);

  const updateHeights = () => {
    let topHeight = 60;
    if (topBarRef.current) {
      topHeight = topBarRef.current.offsetHeight;
      setHeaderTop(topHeight);
    }
    let mainHeight = 80;
    if (headerRef.current) {
      mainHeight = headerRef.current.offsetHeight;
    }
    const totalHeight = topHeight + mainHeight;
    document.documentElement.style.setProperty('--total-header-height', `${totalHeight}px`);
  };

  useLayoutEffect(() => {
    updateHeights();
    window.addEventListener('resize', updateHeights);
    return () => window.removeEventListener('resize', updateHeights);
  }, []);

  // Hardcode paths based on division titles (update if your titles differ)
  const getDivisionPath = (title) => {
    switch (title) {
      case 'Solar & Energy Systems':
        return '/solar-energy';
      case 'Advanced Engineering & Automation':
        return '/automation';
      case 'Heavy and General Engineering':
        return '/engineering';
      default:
        return '/solutions'; // Fallback
    }
  };

  const getSubdivisionPath = (title) => {
    switch (title) {
      case 'Home / Residential Solar Solutions':
        return '/solar-home';
      case 'Industry Solar Solutions':
        return '/solar-industry';
      default:
        return '/solar-energy'; // Fallback
    }
  };

  return (
    <>
      {/* Top Contact Bar */}
      <div
        ref={topBarRef}
        className="fixed top-0 left-0 right-0 bg-gray-900 text-gray-50 py-3 text-sm z-50"
        role="complementary"
      >
        <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-5 order-2 sm:order-1">
            <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-white transition">
              <FontAwesomeIcon icon={faPhoneAlt} className="text-base" />
              <span>{company.phone}</span>
            </a>
            <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white transition">
              <FontAwesomeIcon icon={faEnvelope} className="text-base" />
              <span>{company.email}</span>
            </a>
          </div>
          <div className="flex items-center gap-4 order-1 sm:order-2 hidden sm:flex">
            <a href={company.social.facebook} aria-label="Facebook" className="hover:text-white transition" target="_blank">
              <FontAwesomeIcon icon={faFacebookF} className="text-xl" />
            </a>
            <a href={company.social.instagram} aria-label="Instagram" className="hover:text-white transition" target="_blank">
              <FontAwesomeIcon icon={faInstagram} className="text-xl" />
            </a>
            <a href={company.social.linkedin} aria-label="LinkedIn" className="hover:text-white transition" target="_blank">
              <FontAwesomeIcon icon={faLinkedinIn} className="text-xl" />
            </a>
            <a href={company.social.tiktok} aria-label="TikTok" className="hover:text-white transition" target="_blank">
              <FontAwesomeIcon icon={faTiktok} className="text-xl" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        ref={headerRef}
        className="fixed left-0 right-0 bg-white shadow-lg z-40 transition-all duration-300"
        style={{ top: `${headerTop}px` }}
      >
        <div className="container mx-auto px-6 py-3 md:py-4 flex justify-between items-center">
          <NavLink to="/" className="flex items-center gap-3 shrink-0">
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="h-10 md:h-12 w-auto object-contain"
            />
          </NavLink>

          <nav className="hidden text-lg md:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-green-600 font-semibold"
                  : "text-gray-700 hover:text-green-600 font-medium transition"
              }
            >
              Home
            </NavLink>

            {/* Solutions Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <NavLink
                to="/solutions"
                className={({ isActive }) =>
                  isActive
                    ? "text-green-600 font-semibold"
                    : "text-gray-700 hover:text-green-600 font-medium transition"
                }
              >
                Solutions
              </NavLink>
              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-0 bg-white shadow-lg rounded-lg py-2 w-84 z-50">
                  {divisions.map((division) => (
                    <div key={division.id} className="relative">
                      <NavLink
                        to={getDivisionPath(division.title)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-green-600 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {division.title}
                      </NavLink>
                      {/* Submenu for Solar */}
                      {division.title === 'Solar & Energy Systems' && division.subdivisions && (
                        <div className="ml-4 border-l-2 border-gray-200">
                          {division.subdivisions.map((sub, index) => (
                            <NavLink
                              key={index}
                              to={getSubdivisionPath(sub.title)}
                              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-green-600 transition"
                              onClick={() => setDropdownOpen(false)}
                            >
                              {sub.title}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <NavLink
              to="/projects"
              className={({ isActive }) =>
                isActive
                  ? "text-green-600 font-semibold"
                  : "text-gray-700 hover:text-green-600 font-medium transition"
              }
            >
              Projects
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "text-green-600 font-semibold"
                  : "text-gray-700 hover:text-green-600 font-medium transition"
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive
                  ? "text-green-600 font-semibold"
                  : "text-gray-700 hover:text-green-600 font-medium transition"
              }
            >
              Contact
            </NavLink>
          </nav>

          <a
            href="/contact"
            className="hidden md:block bg-green-600 text-white text-md px-5 py-2.5 rounded-full font-medium hover:bg-green-700 transition shadow-md"
          >
            Get Quote
          </a>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-700">
            <FontAwesomeIcon icon={mobileOpen ? faTimes : faBars} className="text-3xl" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="absolute left-0 right-0 top-full bg-white shadow-lg border-t z-50">
            <div className="container mx-auto px-6 py-5 flex flex-col gap-3">
              <NavLink to="/" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-green-600 font-medium py-2">
                Home
              </NavLink>

              {/* Mobile Solutions Accordion - FIXED */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center w-full">
                  {/* The Link to /solutions */}
                  <NavLink 
                    to="/solutions" 
                    onClick={() => setMobileOpen(false)} 
                    className="text-gray-700 hover:text-green-600 font-medium py-2 flex-grow"
                  >
                    Solutions
                  </NavLink>
                  
                  {/* The Dropdown Toggler Button */}
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)} 
                    className="p-2 text-gray-700 hover:text-green-600 transition"
                  >
                    <FontAwesomeIcon icon={faChevronDown} className={`text-sm transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Dropdown Content */}
                {dropdownOpen && (
                  <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-100 ml-2 mb-2">
                    {divisions.map((division) => (
                      <div key={division.id}>
                        <NavLink
                          to={getDivisionPath(division.title)}
                          className="block text-gray-700 hover:text-green-600 transition py-1"
                          onClick={() => setMobileOpen(false)}
                        >
                          {division.title}
                        </NavLink>
                        {/* Submenu for Solar */}
                        {division.title === 'Solar & Energy Systems' && division.subdivisions && (
                          <div className="pl-4">
                            {division.subdivisions.map((sub, index) => (
                              <NavLink
                                key={index}
                                to={getSubdivisionPath(sub.title)}
                                className="block text-sm text-gray-600 hover:text-green-600 transition py-1"
                                onClick={() => setMobileOpen(false)}
                              >
                                {sub.title}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <NavLink to="/projects" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-green-600 font-medium py-2">
                Projects
              </NavLink>
              <NavLink to="/about" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-green-600 font-medium py-2">
                About
              </NavLink>
              <NavLink to="/contact" onClick={() => setMobileOpen(false)} className="text-gray-700 hover:text-green-600 font-medium py-2">
                Contact
              </NavLink>
              <a
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="bg-green-600 text-white px-6 py-3 rounded-full font-medium text-center hover:bg-green-700 transition mt-2"
              >
                Get Quote
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;