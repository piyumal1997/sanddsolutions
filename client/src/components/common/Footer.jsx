// src/components/common/Footer.jsx
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faPhoneAlt,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebookF,
  faInstagram,
  faTiktok,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons';
import { company } from '../../data/company';

const Footer = () => {
  const offices = [
    {
      title: "Head Office",
      address: company.address,
      mapLink: `https://maps.app.goo.gl/8ro38ixEyEviarXV9`,
    },
    {
      title: "Colombo Office",
      address: company.office,
      mapLink: `https://maps.app.goo.gl/yFjpMCJZrBbe9ZfKA`,
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-green-900 to-green-800 text-white">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-10 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.8fr_4fr_1.3fr_1.3fr] gap-10 lg:gap-12">
          {/* Column 1: Company Info + Logo */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={company.logo[0]}
                alt={`${company.name} logo`}
                className="h-16 md:h-20 w-auto object-contain"
              />
            </div>
            <p className="text-gray-300 text-base leading-relaxed max-w-xs">
              Innovative & Sustainable Development Solutions in Solar & Energy Systems, Advanced Engineering & Automation, and Heavy & General Engineering.
            </p>
          </div>

          {/* Column 2: Contact - Two offices */}
          <div className="space-y-12">
            <h3 className="text-xl font-bold mb-6">Contact Us</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {offices.map((office, index) => (
                <div key={index} className="space-y-4">
                  <h4 className="text-lg font-bold text-green-400">{office.title}</h4>
                  <a
                    href={office.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-gray-300 hover:text-green-400 transition group text-base"
                  >
                    {/* <FontAwesomeIcon
                      icon={faLocationDot}
                      className="mt-1.5 text-xl text-green-400 group-hover:text-white transition"
                    /> */}
                    <span>{office.address}</span>
                  </a>
                  <div className="space-y-2 text-base">
                    <p>
                      Tel:{' '}
                      <a
                        href={`tel:${company.phone.replace(/\s/g, '')}`}
                        className="hover:text-green-400 transition"
                      >
                        {company.phone}
                      </a>
                    </p>
                    <p>
                      Email:{' '}
                      <a
                        href={`mailto:${company.email}`}
                        className="hover:text-green-400 transition break-all"
                      >
                        {company.email}
                      </a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <nav className="space-y-4">
            <h3 className="text-xl font-bold mb-6">Quick Links</h3>
            <div className="space-y-3 text-base">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block hover:text-green-400 transition ${isActive ? 'text-green-300 font-medium' : 'text-gray-300'}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/solutions"
                className={({ isActive }) =>
                  `block hover:text-green-400 transition ${isActive ? 'text-green-300 font-medium' : 'text-gray-300'}`
                }
              >
                Solutions
              </NavLink>
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `block hover:text-green-400 transition ${isActive ? 'text-green-300 font-medium' : 'text-gray-300'}`
                }
              >
                Projects
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `block hover:text-green-400 transition ${isActive ? 'text-green-300 font-medium' : 'text-gray-300'}`
                }
              >
                About
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `block hover:text-green-400 transition ${isActive ? 'text-green-300 font-medium' : 'text-gray-300'}`
                }
              >
                Contact
              </NavLink>
            </div>
          </nav>

          {/* Column 4: Legal + Social */}
          <div className="space-y-4">
            {/* Legal */}
            <div>
              <h3 className="text-xl font-bold mb-6">Legal</h3>
              <div className="space-y-3 text-base">
                <NavLink
                  to="/terms-and-conditions"
                  className="block hover:text-green-400 transition text-gray-300"
                >
                  Terms & Conditions
                </NavLink>
                <NavLink
                  to="/privacy-policy"
                  className="block hover:text-green-400 transition text-gray-300"
                >
                  Privacy Policy
                </NavLink>
                <NavLink
                  to="/refund-policy"
                  className="block hover:text-green-400 transition text-gray-300"
                >
                  Refund Policy
                </NavLink>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-xl font-bold mb-6">Follow Us</h3>
              <div className="flex gap-6 flex-wrap">
                <a
                  href={company.social.facebook}
                  aria-label="Facebook"
                  className="text-gray-300 hover:text-green-400 transition text-3xl hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a
                  href={company.social.instagram}
                  aria-label="Instagram"
                  className="text-gray-300 hover:text-green-400 transition text-3xl hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a
                  href={company.social.linkedin}
                  aria-label="LinkedIn"
                  className="text-gray-300 hover:text-green-400 transition text-3xl hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </a>
                {company.social.tiktok !== "#" && (
                  <a
                    href={company.social.tiktok}
                    aria-label="TikTok"
                    className="text-gray-300 hover:text-green-400 transition text-3xl hover:scale-110"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FontAwesomeIcon icon={faTiktok} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-green-700 mt-16 pt-10 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;