// src/components/ui/SolarSubdivisionCard.jsx
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types'; // optional – remove if not using

const SolarSubdivisionCard = ({ subdivision, to, icon }) => {
  const { title, description, image } = subdivision;

  return (
    <Link
      to={to}
      className="group relative block overflow-hidden rounded-2xl shadow-lg h-80 md:h-96 transition-all duration-500 hover:shadow-2xl hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-green-500/40"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{
          backgroundImage: image
            ? `url(${image})`
            : 'none'
        }}
      />

      {/* Dark Gradient Overlay – stronger on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-transparent/80 transition-all duration-500 group-hover:from-black/90 group-hover:via-black/70" />

      {/* Icon in top-right corner (small accent) */}
      <div className="absolute top-6 right-6 w-14 h-14 bg-green-600/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-400 shadow-md">
        <FontAwesomeIcon icon={icon} className="text-2xl" />
      </div>

      {/* Main Content – bottom aligned */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 pb-12 text-white">
        <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight group-hover:text-green-300 transition-colors duration-300">
          {title}
        </h3>

        <p className="text-base md:text-lg opacity-90 mb-6 line-clamp-3 group-hover:opacity-100 transition-opacity duration-300">
          {description}
        </p>

        {/* Call-to-action arrow – slides in on hover */}
        <div className="flex items-center opacity-0 translate-x-[-20px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400 ease-out">
          <span className="font-medium text-lg mr-3 group-hover:text-green-300 transition-colors">
            Explore Solutions
          </span>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-xl transform group-hover:translate-x-3 transition-transform duration-300 text-green-300"
          />
        </div>
      </div>

      {/* Subtle shine / gloss effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shine-fast" />
      </div>
    </Link>
  );
};

// Optional PropTypes (remove if using TypeScript or not needed)
SolarSubdivisionCard.propTypes = {
  subdivision: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
  to: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired, // FontAwesome icon
};

export default SolarSubdivisionCard;