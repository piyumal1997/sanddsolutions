// src/pages/SolarIndustry.jsx
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTools } from "@fortawesome/free-solid-svg-icons";
import { divisions } from "../data/divisions";
import industrySolarBg from "../assets/images/background/industry-solar-bg.jpg";

// Dynamically load images with quality & width optimization
const galleryModules = import.meta.glob(
  "../assets/images/industrysolar/*.{png,jpg,jpeg,svg}",
  { eager: true, query: { url: true, w: 800, q: 75 }, import: "default" },
);
const galleryImages = Object.values(galleryModules);

const SolarIndustry = () => {
  const subDivision = divisions[0]?.subdivisions[1] || {};

  return (
    <main className="pt-0">
      {/* Hero with Back Button */}
      <section className="relative h-96 pt-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${industrySolarBg})` }}
        ></div>
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            to="/solar-energy"
            className="flex items-center gap-3 bg-white/90 hover:bg-white text-green-700 px-3 py-3 rounded-full shadow-lg transition-all duration-300 backdrop-blur-md"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
            {/* <span className="font-medium text-base">Back to Solar Energy</span> */}
          </Link>
        </div>

        <div className="relative container mx-auto px-6 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              {subDivision.title}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
              Power your business with high-performance solar solutions.
              Maximize ROI, reduce energy costs, and achieve sustainability
              goals.
            </p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-15 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            {subDivision.description ||
              "Our commercial & industrial solar systems deliver reliable, large-scale energy generation tailored to factories, warehouses, offices, and agricultural operations across Sri Lanka."}
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-900">
            Our Industrial Solar Services Include
          </h2>
          <div className="max-w-4xl mx-auto">
            <ul className="text-xl text-gray-600 space-y-4">
              {subDivision.services?.map((service, index) => (
                <li key={index} className="flex items-start">
                  <FontAwesomeIcon
                    icon={faTools}
                    className="text-green-600 mt-1 mr-3 flex-shrink-0"
                  />
                  {service}
                </li>
              )) || <li>No services listed yet.</li>}
            </ul>
          </div>
        </div>
      </section>

      {/* Balanced Masonry Gallery – fits perfectly, 2 columns on mobile */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-900"></h2>

          {/* Swapped columns-* for grid and grid-cols-* */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((src, index) => (
              <div
                key={index}
                // Removed mb-4 and break-inside-avoid (no longer needed in Grid)
                // Added aspect-[4/3] to force all image containers to be the exact same shape
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 aspect-[4/3]"
              >
                <img
                  src={`${src}?w=800&q=75&fit=crop&auto=format`}
                  alt={`${subDivision.title} installation ${index + 1}`}
                  // Changed h-auto to h-full to guarantee it fills the aspect ratio container
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  // Removed the dynamic inline style to ensure uniformity
                />
                {/* Optional subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Ready to power your business with solar energy?
          </p>
          <Link
            to="/contact"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-green-700 transition shadow-lg"
          >
            Get an Industrial Quote
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SolarIndustry;
