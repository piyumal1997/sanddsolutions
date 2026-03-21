// src/pages/Engineering.jsx
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGears, faTools } from '@fortawesome/free-solid-svg-icons';
import { divisions } from '../data/divisions';

// Import images (add these to your assets folder)
import engineeringBg from '../assets/images/background/engineering-bg.jpg';
import engineeringContent from '../assets/images/engineering/engineering_content.png'; // ← Add this image

const Engineering = () => {
  const division = divisions[2]; // Heavy and General Engineering

  return (
    <main className="pt-0">
      {/* Hero Section – identical style */}
      <section className="relative h-96 pt-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${engineeringBg})` }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-6 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              {division.title || "Heavy & General Engineering"}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
              {division.title_note ||
                "Comprehensive engineering services, custom fabrication, and project management tailored to diverse client needs across Sri Lanka."}
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Division Overview – matching SolarEnergy.jsx exactly */}
      <section className="py-12 md:py-16 lg:py-20 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center max-w-7xl mx-auto">
            {/* Text Column – mobile below, desktop left */}
            <div className="w-full lg:w-1/2 order-2 lg:order-1 mt-12 lg:mt-0 z-10 lg:pr-10 xl:pr-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Heavy Engineering Excellence <br />
                <span className="text-green-600">Precision That Powers Progress</span>
              </h2>

              <div className="space-y-6 text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
                <p className="font-medium text-gray-700">
                  {division.paragraph_one}
                </p>

                {/* Checkmark list (uses subdivisions if available, otherwise services or defaults) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  {(division.service_points).map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
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
                        {typeof item === 'string' ? item : item.title}
                      </span>
                    </div>
                  ))}
                </div>

                <p>
                  {division.paragraph_two}
                </p>
              </div>
            </div>

            {/* Image Column – mobile top, desktop right */}
            <div className="w-full lg:w-1/2 order-1 lg:order-2 relative h-[350px] sm:h-[500px] lg:h-[680px]">
              <div className="absolute inset-0 diagonal-clip lg:-ml-16 shadow-2xl bg-gray-100 overflow-hidden">
                <img
                  src={engineeringContent}
                  alt="Heavy Engineering Fabrication"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/5 lg:bg-transparent"></div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-8 right-2 md:bottom-[-2rem] md:right-4 bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl z-20 border-b-4 border-green-500">
                <p className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-none">
                  4+
                </p>
                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Years Experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section (kept and improved) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-900">
            Our Services Include
          </h2>
          <div className="max-w-4xl mx-auto">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-700">
              {division.services?.map((service, index) => (
                <li key={index} className="flex items-start">
                  <FontAwesomeIcon icon={faGears} className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Improved Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-900">
            Ready to Build Something Extraordinary?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
            From concept to commissioning — let our engineering team turn your vision into reality.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-green-600 text-white px-10 py-5 rounded-full font-medium text-xl hover:bg-green-700 shadow-lg transition transform hover:-translate-y-1"
          >
            Start Your Engineering Project
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Engineering;