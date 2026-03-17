// src/pages/CoolingSolutions.jsx
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faHome } from '@fortawesome/free-solid-svg-icons';
import SubdivisionCard from '../components/ui/SubdivisionCard';
import { divisions } from '../data/divisions';
import { partners } from '../data/partners';

import coolingBg from '../assets/images/background/cooling-bg.jpg'; // your hero background

const CoolingSolutions = () => {
  // Find the Cooling division reliably
  const coolingDivision = divisions.find(d => d.title === 'Cooling Solutions');

  // Safety fallback (should not be needed anymore)
  if (!coolingDivision) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-red-600">Division not found</h1>
        <p className="mt-4 text-xl">Please check divisions.js — "Cooling Solutions" entry is missing.</p>
      </div>
    );
  }

  const { title, subdivisions = [] } = coolingDivision;

  return (
    <main className="pt-0">
      {/* Hero Section */}
      <section className="relative h-96 pt-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${coolingBg})` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-6 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              {title}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
              Advanced Air Conditioning & Climate Control Systems for Comfort and Efficiency
            </p>
          </div>
        </div>
      </section>

      {/* Division Overview */}
      <section className="py-16 md:py-20 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            At S & D Solutions (Pvt) Ltd, we provide cutting-edge cooling solutions tailored to Sri Lanka’s tropical climate. 
            From energy-efficient inverter ACs for homes to powerful VRV/VRF and central chilled water systems for commercial & industrial spaces — we ensure optimal comfort, energy savings, and reliability.
          </p>
        </div>
      </section>

      {/* Subdivisions / Solutions Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-900">
            Our Cooling Solutions
          </h2>

          {subdivisions.length === 0 ? (
            <p className="text-center text-gray-600 text-xl">
              No detailed solutions available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {subdivisions.map((subdivision, index) => (
                <SubdivisionCard
                  key={subdivision.id || index}
                  subdivision={subdivision}
                  to={subdivision.path || (index === 0 ? '/residential-cooling' : '/commercial-cooling')}
                  icon={index === 0 ? faHome : faBuilding}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BTU Calculator CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-900">
            Calculate Your Cooling Needs
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
            Find the perfect air conditioner capacity (in BTU/hr) for your room or space — 
            tailored to Sri Lanka’s hot & humid climate.
          </p>
          <Link
            to="/btu-calculator"
            className="inline-block bg-green-600 text-white px-10 py-5 rounded-full font-medium text-lg md:text-xl hover:bg-green-700 shadow-lg transition transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Open BTU Calculator →
          </Link>
        </div>
      </section>

      {/* Partners Carousel */}
      {partners?.length > 0 && (
        <section className="py-16 bg-white border-t border-gray-200 overflow-hidden">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-12 text-green-900">
              Our Cooling Partners
            </h2>

            <div className="relative h-32 overflow-hidden">
              <div className="absolute inset-0 flex animate-horizontal-scroll space-x-12 md:space-x-16 items-center">
                {[...partners, ...partners].map((partner, index) => (
                  <div
                    key={`${partner.name}-${index}`}
                    className="flex-shrink-0 w-48 md:w-60 h-20 flex items-center justify-center"
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition duration-300 opacity-80 hover:opacity-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default CoolingSolutions;