// src/components/common/Footer.jsx
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhoneAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
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
    <footer className="bg-gradient-to-b from-green-800 to-green-700 text-white py-12 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_4fr_1fr_1fr] gap-8 lg:gap-12">
          {/* Company Info + Logo */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={company.logo[0]}
                alt={`${company.name} logo`}
                className="h-16 md:h-24 w-auto object-contain"
              />
            </div>
            <p className="text-gray-50 text-sm md:text-base leading-relaxed">
              Innovative & Sustainable Development Solutions in Solar & Energy Systems, Advanced Engineering & Automation and Heavy & General Engineering.
            </p>
          </div>

          {/* Contact - Two offices with clickable Google Maps links */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-6">Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {offices.map((office, index) => (
                <div key={index}>
                  <h4 className="text-base md:text-lg font-bold underline mb-4">
                    {office.title}
                  </h4>
                  <a
                    href={office.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-gray-50 hover:text-green-300 transition text-sm md:text-base mb-6 group"
                  >
                    {/* <FontAwesomeIcon 
                      icon={faLocationDot} 
                      className="mt-1 text-green-300 group-hover:text-white transition" 
                    /> */}
                    <span>{office.address}</span>
                  </a>
                  <div className="space-y-2">
                    <p className="text-gray-50 text-sm md:text-base">
                      Tel:{' '}
                      <a
                        href={`tel:${company.phone.replace(/\s/g, '')}`}
                        className="hover:text-green-300 transition"
                      >
                        {company.phone}
                      </a>
                    </p>
                    <p className="text-gray-50 text-sm md:text-base">
                      Email:{' '}
                      <a
                        href={`mailto:${company.email}`}
                        className="hover:text-green-300 transition"
                      >
                        {company.email}
                      </a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <nav>
            <h3 className="text-lg md:text-xl font-bold mb-6">Quick Links</h3>
            <div className="space-y-3 text-sm md:text-base">
              <NavLink to="/" className="block text-gray-50 hover:text-green-300 transition">
                Home
              </NavLink>
              <NavLink to="/solutions" className="block text-gray-50 hover:text-green-300 transition">
                Solutions
              </NavLink>
              <NavLink to="/projects" className="block text-gray-50 hover:text-green-300 transition">
                Projects
              </NavLink>
              <NavLink to="/about" className="block text-gray-50 hover:text-green-300 transition">
                About
              </NavLink>
              <NavLink to="/contact" className="block text-gray-50 hover:text-green-300 transition">
                Contact
              </NavLink>
            </div>
          </nav>

          {/* Social Media */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-6">Follow Us</h3>
            <div className="flex gap-6">
              <a
                href={company.social.facebook}
                aria-label="Facebook"
                className="text-gray-50 hover:text-green-300 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faFacebookF} className="text-3xl" />
              </a>
              <a
                href={company.social.instagram}
                aria-label="Instagram"
                className="text-gray-50 hover:text-green-300 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faInstagram} className="text-3xl" />
              </a>
              <a
                href={company.social.linkedin}
                aria-label="LinkedIn"
                className="text-gray-50 hover:text-green-300 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faLinkedinIn} className="text-3xl" />
              </a>
              {company.social.tiktok !== "#" && (
                <a
                  href={company.social.tiktok}
                  aria-label="TikTok"
                  className="text-gray-50 hover:text-green-300 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faTiktok} className="text-3xl" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-green-600 mt-12 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;