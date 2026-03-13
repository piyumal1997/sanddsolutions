// src/components/DivisionCard.jsx
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const DivisionCard = ({ division }) => {
  return (
    <Link
      to={division.link}
      className="group block relative overflow-hidden rounded-2xl shadow-xl h-84 md:h-96  transition-all duration-500 hover:shadow-2xl hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-green-500/50"
    >
      {/* Background Image with subtle zoom on hover */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${division.image})` }}
      />

      {/* Overlay – darkens on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent transition-opacity duration-500 group-hover:from-black/85 group-hover:via-black/60" />

      {/* Main Content – vertically centered, left-aligned */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
        <div className="max-w-md">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight group-hover:text-green-300 transition-colors duration-300">
            {division.title}
          </h3>
          <p className="text-lg md:text-xl opacity-90 group-hover:opacity-100 transition-opacity duration-300">
            {division.subtitle}
          </p>
        </div>
      </div>

      {/* View Details + Arrow – bottom-left, aligned with content left edge */}
      <div className="absolute bottom-16 left-8">
        <div className="flex items-center opacity-0 -translate-x-8 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400 ease-out">
          <span className="text-lg font-medium mr-3 group-hover:text-green-300 transition-colors">
            View Details
          </span>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-2xl transform group-hover:translate-x-3 transition-transform duration-300 text-green-300"
          />
        </div>
      </div>

      {/* Optional subtle shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
    </Link>
  );
};

export default DivisionCard;