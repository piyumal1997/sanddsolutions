// src/pages/SolarEnergy.jsx (Updated – Calculator moved to separate page)
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faIndustry } from '@fortawesome/free-solid-svg-icons';
import SolarSubdivisionCard from '../components/ui/SolarSubdivisionCard';
import { divisions } from '../data/divisions';
import { partners } from '../data/partners';

import solarBg from '../assets/images/background/solar-bg.jpg';

const SolarEnergy = () => {
  const solarSubdivisions = divisions[0]?.subdivisions || [];

  return (
    <main className="pt-0">
      {/* Hero Section */}
      <section className="relative h-96 pt-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed" 
          style={{ backgroundImage: `url(${solarBg})` }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-6 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              {divisions[0]?.title || "Solar & Energy Systems"}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
              {divisions[0]?.details || "Delivering complete solar power solutions for homes, businesses, and industries focused on performance, reliability, and long-term savings."}
            </p>
          </div>
        </div>
      </section>

      {/* Division Overview */}
      <section className="py-15 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            At S & D Solutions (Pvt) Ltd, we specialize in innovative solar and energy systems across Sri Lanka. 
            With a focus on renewable energy, we provide tailored solutions for residential and industrial needs, 
            promoting sustainability and efficiency.
          </p>
        </div>
      </section>

      {/* Subdivisions */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-900">Our Solar Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solarSubdivisions.map((subdivision, index) => (
              <SolarSubdivisionCard
                key={index}
                subdivision={subdivision}
                to={index === 0 ? '/solar-home' : '/solar-industry'}
                icon={index === 0 ? faHome : faIndustry}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Link to Calculator Page */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-900">
            Calculate Your Solar Savings
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
            Estimate your potential savings with our interactive solar calculator. Input your details for a customized report.
          </p>
          <Link
            to="/solar-calculator"
            className="inline-block bg-green-600 text-white px-10 py-5 rounded-full font-medium text-xl hover:bg-green-700 shadow-lg transition transform hover:-translate-y-1"
          >
            Open Solar Calculator
          </Link>
        </div>
      </section>

      {/* Horizontal Scrolling Partners */}
      <section className="py-16 bg-white border-t border-gray-200 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12 text-green-900">Our Partners</h2>
          
          <div className="relative h-32 overflow-hidden">
            <div className="absolute inset-0 flex animate-horizontal-scroll space-x-12 items-center">
              {[...partners, ...partners].map((partner, index) => (
                <div key={index} className="flex-shrink-0 w-60 h-20 flex items-center justify-center">
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
    </main>
  );
};

export default SolarEnergy;