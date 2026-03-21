// src/pages/Solutions.jsx
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { divisions } from "../data/divisions";

import solutionsBg from "../assets/images/background/solutions-bg.jpg"; // Import your background image here

const Solutions = () => {
  return (
    <main className="pt-0 bg-white">
      {/* Hero Section – Same style as SolarEnergy.jsx */}
      <section className="relative h-96 pt-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${solutionsBg})` }} // Replace with your actual image import
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-6 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              Our Innovative & Sustainable Solutions
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
              Delivering cutting-edge, environmentally responsible solutions
              across three core divisions.
            </p>
          </div>
        </div>
      </section>

      {/* Company Description - Modern Overlapping Circle Layout */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
            {/* Left Content Column */}
            <div className="lg:w-1/2 order-2 lg:order-1">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Engineering Excellence <br />
                <span className="text-green-600">For a Greener Future</span>
              </h2>

              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  Embrace a sustainable future with{" "}
                  <span className="font-bold text-gray-900">
                    S & D Solutions
                  </span>
                  , Sri Lanka’s premier partner for integrated engineering. We
                  have streamlined our expertise into four specialized divisions
                  to meet the evolving needs of our nation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
                  {[
                    "Solar & Energy Systems",
                    "Cooling Solutions",
                    "Advanced Engineering",
                    "Heavy Engineering",
                  ].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-800">{item}</span>
                    </div>
                  ))}
                </div>

                <p>
                  From custom solar installations (On-Grid, Hybrid, and
                  Off-Grid) and energy-efficient cooling systems to innovative
                  industrial automation and robust heavy engineering projects,
                  we provide high-quality, dependable solutions for both
                  residential and commercial sectors.
                </p>
              </div>
            </div>

            {/* Right Image Composition Column */}
            <div className="lg:w-1/2 order-1 lg:order-2 relative h-[450px] sm:h-[600px] w-full">
              {/* Background Decorative SVG Shape (The "Circle Outline") */}
              <div className="absolute top-0 right-10 w-64 h-64 text-green-200 opacity-50 hidden sm:block">
                <svg
                  viewBox="0 0 160 160"
                  className="w-full h-full fill-current"
                >
                  <path d="M80,30c27.6,0,50,22.4,50,50s-22.4,50-50,50s-50-22.4-50-50S52.4,30,80,30 M80,0C35.8,0,0,35.8,0,80s35.8,80,80,80 s80-35.8,80-80S124.2,0,80,0L80,0z"></path>
                </svg>
              </div>

              {/* Solid Color Accent Circle */}
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-green-600 rounded-full -z-10 animate-pulse"></div>

              {/* Main Large Image Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[450px] sm:h-[450px] rounded-full overflow-hidden border-6 border-white shadow-2xl z-10">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
                  alt="Engineering Office"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Secondary Smaller Image Circle */}
              <div className="absolute bottom-0 right-4 sm:right-10 w-40 h-40 sm:w-64 sm:h-64 rounded-full overflow-hidden border-[8px] border-white shadow-xl z-20">
                <img
                  src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=600"
                  alt="Automation Tech"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-20 text-green-900">Our Specialized Divisions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
            {divisions.map((division) => (
              <div
                key={division.id}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                // data-aos="fade-up"
              >
                {/* Division Image/Header */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={division.image}
                    alt={division.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">
                      {division.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {division.description}
                  </p>
                  <Link
                    to={division.link}
                    className="inline-flex items-center text-green-600 font-medium hover:text-green-800 transition group-hover:translate-x-1"
                  >
                    Learn More
                    <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Ready to Start Your Sustainable Journey?
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Contact us for a free consultation and discover how our solutions
            can benefit you.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-green-700 shadow-md transition"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Solutions;
