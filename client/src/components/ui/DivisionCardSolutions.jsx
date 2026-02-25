
// src/components/ui/DivisionCard.jsx (Updated – Renamed to DivisionSolutionsCard with Chevron Icons)
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const DivisionCardSolutions = ({ division, showChevron = false }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition duration-300 text-center flex flex-col"
    >
      <FontAwesomeIcon
        icon={division.icon}
        className="text-6xl text-green-600 mb-6 mx-auto"
      />
      <h3 className="text-2xl font-bold mb-4 text-gray-900">{division.title}</h3>
      <p className="text-gray-600 mb-8 flex-1">{division.description}</p>
      <Link
        to={division.link || division.path} // Use link or path from data
        className="text-green-600 font-semibold hover:underline mt-auto flex items-center justify-center gap-1"
      >
        View Details
        {showChevron && <FontAwesomeIcon icon={faChevronRight} className="text-sm" />}
      </Link>
    </div>
  );
};

export default DivisionCardSolutions;