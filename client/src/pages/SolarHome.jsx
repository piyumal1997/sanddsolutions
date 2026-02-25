// src/pages/SolarHome.jsx (Updated – Sectioned with Hero, Overview, Services, Masonry Gallery, CTA)
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTools } from '@fortawesome/free-solid-svg-icons'; // For services if needed
import { divisions } from '../data/divisions';
import homeSolarBg from '../assets/images/background/home-solar-bg.jpg';

// Dynamically load all images from the folder (supports .jpg, .png, .jpeg, etc.)
const galleryModules = import.meta.glob(
  '../assets/images/homesolar/*.{png,jpg,jpeg,svg}',
  { eager: true, query: '?url', import: 'default' }
);
const galleryImages = Object.values(galleryModules);

const SolarHome = () => {
  const subDivision = divisions[0]?.subdivisions[0] || {}; // Safeguard

  return (
    <main className="pt-0">
      {/* Hero Section */}
      <section className="relative h-96 pt-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed" 
          style={{ backgroundImage: `url(${homeSolarBg})` }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-6 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              {subDivision.title}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
              Empower your home with clean, renewable solar energy. Reduce bills and contribute to a sustainable future.
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-15 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            {subDivision.description || "Our residential solar solutions provide reliable, cost-effective energy for homes across Sri Lanka, tailored to your needs for maximum efficiency and savings."}
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-900">Our Services Include</h2>
          <div className="max-w-4xl mx-auto">
            <ul className="text-xl text-gray-600 space-y-4">
              {subDivision.services?.map((service, index) => (
                <li key={index} className="flex items-start">
                  <FontAwesomeIcon icon={faTools} className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  {service}
                </li>
              )) || <li>No services listed yet.</li>}
            </ul>
          </div>
        </div>
      </section>

      {/* Masonry Grid Gallery Section – Dynamically loads images from folder */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-900">Home Solar Installations Gallery</h2>
          <div className="columns-2 gap-3 lg:gap-8 sm:columns-4 [&>img:not(:first-child)]:mt-5 lg:[&>img:not(:first-child)]:mt-8">
            {galleryImages.map((src, index) => (
              <img key={index} src={src} alt={`Home solar installation ${index + 1}`} className="w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Ready to switch to solar for your home?
          </p>
          <Link
            to="/contact"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-green-700 transition shadow-lg"
          >
            Get a Free Quote
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SolarHome;