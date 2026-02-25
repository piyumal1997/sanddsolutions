// src/pages/Automation.jsx (Updated – Full Section Mode with Hero Image like SolarEnergy.jsx)
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faCogs, faIndustry } from '@fortawesome/free-solid-svg-icons';
import { divisions } from '../data/divisions';

// Import automation background image (add this file to src/assets/images/)
import automationBg from '../assets/images/background/automation-bg.jpg'; 

const Automation = () => {
  const division = divisions[1]; // Advanced Engineering & Automation

  return (
    <main className="pt-0">
      {/* Hero Section – Styled exactly like SolarEnergy.jsx */}
      <section className="relative h-96 pt-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed" 
          style={{ backgroundImage: `url(${automationBg})` }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-6 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              {division.title}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
              Cutting-edge automation, control systems, and smart engineering solutions for enhanced efficiency and productivity across Sri Lanka.
            </p>
          </div>
        </div>
      </section>

      {/* Division Overview */}
      <section className="py-15 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            {division.details}
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-900">
            Our Services Include
          </h2>
          <div className="max-w-4xl mx-auto">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-700">
              {division.services?.map((service, index) => (
                <li key={index} className="flex items-start">
                  <FontAwesomeIcon icon={faCogs} className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Ready to automate and optimize your operations?
          </p>
          <Link
            to="/contact"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-green-700 transition shadow-lg"
          >
            Discuss Your Automation Project
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Automation;