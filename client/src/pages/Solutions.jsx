// src/pages/Solutions.jsx
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { divisions } from '../data/divisions';

import solutionsBg from '../assets/images/background/solutions-bg.jpg'; // Import your background image here

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
              Delivering cutting-edge, environmentally responsible solutions across three core divisions.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Grid Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {divisions.map((division) => (
              <div 
                key={division.id} 
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                data-aos="fade-up"
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
            Contact us for a free consultation and discover how our solutions can benefit you.
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