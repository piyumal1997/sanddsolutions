// src/components/ui/CoolingSubdivisionCard.jsx
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

const CoolingSubdivisionCard = ({ subdivision, to, icon }) => {
  const { title, description, image } = subdivision;

  return (
    <Link
      to={to}
      className="group block bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:border-green-600 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-green-300"
    >
      {/* Image / Visual Area */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
            <FontAwesomeIcon
              icon={icon}
              className="text-green-500 text-8xl opacity-30 group-hover:opacity-50 transition-opacity"
            />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Title overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg group-hover:text-green-300 transition-colors">
            {title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          {description}
        </p>

        <div className="flex items-center text-green-600 font-medium group-hover:text-green-700 transition-colors">
          <span>Explore this solution</span>
          <svg
            className="ml-3 w-5 h-5 transform group-hover:translate-x-2 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

CoolingSubdivisionCard.propTypes = {
  subdivision: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string, // optional
  }).isRequired,
  to: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired, // FontAwesome icon object
};

export default CoolingSubdivisionCard;