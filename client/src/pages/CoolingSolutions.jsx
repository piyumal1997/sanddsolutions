// src/pages/CoolingSolutions.jsx
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faHome } from '@fortawesome/free-solid-svg-icons';
import SubdivisionCard from '../components/ui/SubdivisionCard';
import { divisions } from '../data/divisions';
import { partners } from '../data/partners';

import coolingBg from '../assets/images/background/cooling-bg.jpg';
import coolingContent from '../assets/images/cooling/cooling_content.png'; // ← ADD THIS IMAGE

const CoolingSolutions = () => {
  // Find the Cooling division reliably
  const division = divisions.find(d => d.title === 'Cooling Solutions');

  // Safety fallback
  if (!division) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-red-600">Division not found</h1>
        <p className="mt-4 text-xl">Please check divisions.js — "Cooling Solutions" entry is missing.</p>
      </div>
    );
  }

  const { title, subdivisions = [] } = division;

  return (
    <main className="pt-0">
      {/* Hero Section – unchanged (already matches style) */}
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

      {/* Enhanced Division Overview – exact same layout as SolarEnergy.jsx */}
      <section className="py-12 md:py-16 lg:py-20 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center max-w-7xl mx-auto">
            {/* Text Column – mobile: below image | desktop: left */}
            <div className="w-full lg:w-1/2 order-2 lg:order-1 mt-12 lg:mt-0 z-10 lg:pr-10 xl:pr-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Advanced Cooling Solutions <br />
                <span className="text-green-600">
                  Perfect Comfort in Sri Lanka’s Climate
                </span>
              </h2>

              <div className="space-y-6 text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
                <p className="font-medium text-gray-700">
                  {division.paragraph_one}
                </p>

                {/* Subdivisions / Key Solutions Checkmark List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  {subdivisions.map((sub, index) => (
                    <div key={sub.id || index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="4"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="font-semibold text-gray-800 text-sm md:text-base">
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </div>

                <p>
                  {division.paragraph_two}
                </p>
              </div>
            </div>

            {/* Image Column – mobile: top | desktop: right */}
            <div className="w-full lg:w-1/2 order-1 lg:order-2 relative h-[350px] sm:h-[500px] lg:h-[680px]">
              <div className="absolute inset-0 diagonal-clip lg:-ml-16 shadow-2xl bg-gray-100 overflow-hidden">
                <img
                  src={coolingContent}
                  alt="Air Conditioning & Cooling Systems Installation"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/5 lg:bg-transparent"></div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-8 right-2 md:bottom-[-2rem] md:right-4 bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl z-20 border-b-4 border-green-500">
                <p className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-none">
                  10
                </p>
                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Years Warranty
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subdivisions / Solutions Cards – unchanged */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-24 text-green-900">
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

      {/* BTU Calculator CTA – unchanged */}
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

      {/* Partners Carousel – unchanged */}
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