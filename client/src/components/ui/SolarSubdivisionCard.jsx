// src/components/ui/SubDivisionCard.jsx (New – Extracted Sub Division Link Card)
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SolarSubdivisionCard = ({ subdivision, to, icon }) => {
  return (
    <Link
      to={to}
      className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition duration-300 text-center block"
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
        <FontAwesomeIcon 
          icon={icon} 
          className="text-green-600 text-3xl" 
        />
      </div>
      <h3 className="text-2xl font-bold mb-4 text-green-900">{subdivision.title}</h3>
      <p className="text-gray-600 text-lg">{subdivision.description}</p>
    </Link>
  );
};

export default SolarSubdivisionCard;