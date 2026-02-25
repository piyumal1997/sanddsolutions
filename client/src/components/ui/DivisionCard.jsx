import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DivisionCard = ({ division }) => {
  return (
    <Link to={division.link} className="block relative overflow-hidden rounded-2xl shadow-xl h-96 hover:scale-105 transition-transform duration-500">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${division.image})` }}></div>
      <div className="absolute inset-0 bg-black/50 hover:bg-black/40 transition flex items-center justify-center text-white text-center p-8">
        <div>
          <h3 className="text-3xl font-bold mb-2">{division.title}</h3>
          <p className="text-xl">{division.subtitle}</p>
        </div>
      </div>
    </Link>
  );
};

export default DivisionCard;