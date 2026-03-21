// src/pages/SolarEnergy.jsx
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faIndustry,
  faCheckCircle,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import SubdivisionCard from "../components/ui/SubdivisionCard";
import { divisions } from "../data/divisions";
import { partners } from "../data/partners";

import solarBg from "../assets/images/background/solar-bg.jpg";
import solarContent from "../assets/images/solar/solar_content.png";

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
              {divisions[0]?.details ||
                "Delivering complete solar power solutions for homes, businesses, and industries focused on performance, reliability, and long-term savings."}
            </p>
          </div>
        </div>
      </section>

      {/* Solar Division Overview*/}
      <section className="py-12 md:py-16 lg:py-20 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center max-w-7xl mx-auto">
            {/* Text Column */}
            {/* Mobile: order-2 (text below image) | Desktop: order-1 (text left) */}
            <div className="w-full lg:w-1/2 order-2 lg:order-1 mt-12 lg:mt-0 z-10 lg:pr-10 xl:pr-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Solar Power Solutions <br />
                <span className="text-green-600">
                  For a Sustainable Tomorrow
                </span>
              </h2>

              <div className="space-y-6 text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
                <p className="font-medium text-gray-700">
                  {divisions[0]?.paragraph_one}
                </p>

                {/* Subdivisions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  {divisions[0]?.subdivisions?.map((sub) => (
                    <div key={sub.id} className="flex items-center space-x-3">
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

                <p>{divisions[0]?.paragraph_two}</p>
              </div>
            </div>

            {/* Image Column */}
            <div className="w-full lg:w-1/2 order-1 lg:order-2 relative h-[350px] sm:h-[500px] lg:h-[680px]">
              <div className="absolute inset-0 diagonal-clip lg:-ml-16 shadow-2xl bg-gray-100 overflow-hidden">
                <img
                  src={solarContent}
                  alt="Solar Panels Installation"
                  className="w-full h-full object-cover object-center"
                />
                {/* Overlay to ensure the 25+ badge pops */}
                <div className="absolute inset-0 bg-black/5 lg:bg-transparent"></div>
              </div>

              {/* Floating Badge - Positioned relative to the image container */}
              <div className="absolute -bottom-8 right-2 md:bottom--6 md:right-4 bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl z-20 border-b-4 border-green-500">
                <p className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-none">
                  25+
                </p>
                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Years Warranty
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subdivisions */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-18 text-green-900">
            Our Solar Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {solarSubdivisions.map((subdivision, index) => (
              <SubdivisionCard
                key={subdivision.id || index}
                subdivision={subdivision}
                to={
                  subdivision.path ||
                  (index === 0 ? "/solar-home" : "/solar-industry")
                }
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
            Estimate your potential savings with our interactive solar
            calculator. Input your details for a customized report.
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
          <h2 className="text-3xl font-bold mb-12 text-green-900">
            Our Partners
          </h2>

          <div className="relative h-32 overflow-hidden">
            <div className="absolute inset-0 flex animate-horizontal-scroll space-x-12 items-center">
              {[...partners, ...partners].map((partner, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-60 h-20 flex items-center justify-center"
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
    </main>
  );
};

export default SolarEnergy;
