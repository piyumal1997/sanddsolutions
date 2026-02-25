// src/pages/About.jsx (Fixed – Achievements Icons Now Display Correctly)
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import {
  faSun,
  faRobot,
  faGears,
  faHelmetSafety,
  faMapMarkedAlt,
  faTrophy,
  faEye,
  faBullseye,
} from '@fortawesome/free-solid-svg-icons';

import aboutBg from '../assets/images/background/about-bg.jpg';
import { company } from "../data/company";

// Create a lookup map for icon strings → actual icon objects
const iconMap = {
  faSun: faSun,
  faRobot: faRobot,
  faGears: faGears,
  faHelmetSafety: faHelmetSafety,
  faMapMarkedAlt: faMapMarkedAlt,
  faTrophy: faTrophy,
  // Add more if you have other icons
};

const About = () => {
  const divisions = [
    {
      id: 1,
      title: "Solar & Energy Systems",
      content: "Innovative solar power solutions for residential, commercial, and industrial applications, promoting renewable energy across Sri Lanka.",
      icon: faSun,
    },
    {
      id: 2,
      title: "Advanced Engineering & Automation",
      content: "Cutting-edge automation, control systems, and smart engineering solutions for enhanced efficiency and productivity.",
      icon: faRobot,
    },
    {
      id: 3,
      title: "General Engineering",
      content: "Comprehensive engineering services, custom fabrication, and project management tailored to diverse client needs.",
      icon: faGears,
    },
  ];

  return (
    <main className="pt-0 bg-white">
      {/* Hero Section */}
      <section className="relative h-96 pt-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed" 
          style={{ backgroundImage: `url(${aboutBg})` }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-6 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              About {company.name}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
              Leading provider of sustainable energy and advanced engineering solutions across Sri Lanka
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            We specialize in innovative and sustainable development solutions across three major core sectors: <br />
            <span className="font-semibold text-green-700">Solar & Energy Systems</span>,{' '}
            <span className="font-semibold text-green-700">Advanced Engineering & Automation</span>, and{' '}
            <span className="font-semibold text-green-700">General Engineering</span>.<br /><br />
            With over 15 years of excellence serving Sri Lanka, we are committed to quality, efficiency, and environmental responsibility.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Vision */}
            <div className="relative bg-gradient-to-br from-green-50 to-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-t from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-10 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-md">
                  <FontAwesomeIcon icon={faEye} className="text-green-700 text-5xl" />
                </div>
                <h3 className="text-3xl font-bold text-green-900 mb-6">Our Vision</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{company.vision}</p>
              </div>
            </div>

            {/* Mission */}
            <div className="relative bg-gradient-to-br from-green-50 to-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-t from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-10 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-md">
                  <FontAwesomeIcon icon={faBullseye} className="text-green-700 text-5xl" />
                </div>
                <h3 className="text-3xl font-bold text-green-900 mb-6">Our Mission</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{company.mission}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Divisions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-green-900">
            Our Core Divisions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {divisions.map((division) => (
              <div 
                key={division.id} 
                className="group bg-gray-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                data-aos="fade-up"
              >
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <FontAwesomeIcon icon={division.icon} className="text-green-600 text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">
                      {division.title}
                    </h3>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-gray-600 leading-relaxed">
                    {division.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements – Fixed Icons */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-green-900">
            Our Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {company.achievements.map((ach) => (
              <div 
                key={ach.id} 
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                data-aos="fade-up"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {/* Use the icon map to convert string → actual icon */}
                  <FontAwesomeIcon 
                    icon={iconMap[ach.icon]} 
                    className="text-green-600 text-4xl" 
                  />
                </div>
                <p className="text-4xl font-bold text-green-700 mb-2">{ach.value}</p>
                <p className="text-gray-600 text-lg">{ach.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Ready to Build a Sustainable Future Together?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
            Contact us today for a free consultation and discover how we can support your goals.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-green-600 text-white px-10 py-5 rounded-full font-medium text-xl hover:bg-green-700 shadow-lg transition transform hover:-translate-y-1"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
};

export default About;