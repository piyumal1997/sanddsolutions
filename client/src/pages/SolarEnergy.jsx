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

      {/* Solar Division Overview - Enhanced Layout */}
      <section className="py-20 md:py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 max-w-7xl mx-auto">
            {/* Left Content Column */}
            <div className="lg:w-1/2 order-2 lg:order-1">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Solar Power Solutions <br />
                <span className="text-green-600">
                  For a Sustainable Tomorrow
                </span>
              </h2>

              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>{divisions[0]?.paragraph_one}</p>

                {/* Subdivisions highlight – using leaf icons instead of circles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-10">
                  {divisions[0]?.subdivisions?.map((sub) => (
                    <div key={sub.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-xl mb-1">
                          {sub.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-6">{divisions[0]?.paragraph_two}</p>
              </div>
            </div>

            {/* Right Image Composition Column – non-circular shapes */}
            <div className="lg:w-1/2 order-1 lg:order-2 relative h-[400px] sm:h-[500px] lg:h-[600px] w-full">
              {/* Background Decorative Leaf/Wave Shape (SVG - organic non-circle) */}
              <div className="absolute -top-10 -right-10 w-80 h-80 text-green-100 opacity-40 hidden lg:block">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full fill-current"
                >
                  <path
                    d="M100,20 C140,20 170,50 170,100 C170,150 140,180 100,180 C60,180 30,150 30,100 C30,50 60,20 100,20 Z 
                     M100,0 C44.77,0 0,44.77 0,100 C0,155.23 44.77,200 100,200 C155.23,200 200,155.23 200,100 
                     C200,44.77 155.23,0 100,0 Z"
                  />
                </svg>
              </div>

              {/* Solid Color Accent – leaf-like / irregular blob */}
              <div className="absolute bottom-8 left-8 w-48 h-64 bg-gradient-to-br from-green-500 to-green-600 rounded-[40%_60%_70%_30%] opacity-70 animate-pulse -z-10"></div>

              {/* Main Large Image – rounded but soft corners (not perfect circle) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[440px] h-80 sm:h-[420px] rounded-3xl overflow-hidden border-8 border-white shadow-2xl z-10">
                <img
                  src="https://stanthonyssolar.lk/wp-content/uploads/2025/12/shutterstock_2670916287-700x467.jpg"
                  alt="Commercial rooftop solar installation in Sri Lanka"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Secondary Smaller Image – angled/organic crop */}
              <div className="absolute bottom-4 right-4 sm:bottom-12 sm:right-12 w-48 sm:w-72 h-48 sm:h-72 rounded-[30%_70%_40%_60%] overflow-hidden border-[10px] border-white shadow-xl z-20 transform rotate-3">
                <img
                  src="https://www.lankapropertyweb.com/property-news/wp-content/uploads/2023/11/balcony-power-station-8139984_1280.jpg"
                  alt="Residential balcony / rooftop solar panels Sri Lanka"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subdivisions */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-900">
            Our Solar Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {solarSubdivisions.map((subdivision, index) => (
              <SubdivisionCard
                key={subdivision.id || index}
                subdivision={subdivision}
                to={subdivision.path || (index === 0 ? '/solar-home' : '/solar-industry')}
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
