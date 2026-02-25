// src/pages/Home.jsx (Updated & Complete)
import DivisionCard from '../components/ui/DivisionCard';
import { divisions } from '../data/divisions';

import sand from '../assets/images/background/home-bg.jpg';

const Home = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative h-screen pt-0">
        <div className="absolute pt-0 md:pt-70 inset-0 bg-cover bg-top bg-fixed" style={{ backgroundImage: `url(${sand})` }}></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-6 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">S & D Solutions (Pvt) Ltd.</h1>
            <p className="text-2xl md:text-4xl font-semibold mb-10 drop-shadow-md">Innovative & Sustainable Development Solutions</p>
            <p className="text-xl md:text-2xl mb-10 drop-shadow-md">Solar & Energy Systems • Advanced Engineering & Automation • Heavy & General Engineering</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-green-700 transition shadow-lg">Get Consultation</a>
              <a href="/solutions" className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white hover:text-green-900 transition">Our Solutions</a>
            </div>
          </div>
        </div>
      </section>

      {/* Three Clickable Divisions */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {divisions.map(division => (
              <DivisionCard key={division.id} division={division} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;