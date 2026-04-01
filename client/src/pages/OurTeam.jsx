// src/pages/OurTeam.jsx
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCakeCandles } from '@fortawesome/free-solid-svg-icons';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const OurTeam = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/employees`);
        const data = await res.json();
        setTeam(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading team...</div>;
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">Our Team</h1>
        <p className="text-center text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Meet the dedicated professionals behind S&D Solutions
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <div key={member.id} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="relative h-64 bg-gray-100">
                {member.photo ? (
                  <img src={member.photo} alt={member.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">👤</div>
                )}
              </div>

              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900">{member.full_name}</h3>
                <p className="text-green-600 font-medium mt-1">{member.position}</p>

                {member.birthday && (
                  <div className="flex items-center justify-center gap-2 mt-4 text-amber-600 text-sm">
                    <FontAwesomeIcon icon={faCakeCandles} />
                    <span>Birthday: {new Date(member.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                  </div>
                )}

                <div className="mt-6 text-gray-600 text-sm">
                  {member.contact_number}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurTeam;