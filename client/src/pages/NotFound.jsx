// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome } from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg">
        {/* Icon & 404 */}
        <FontAwesomeIcon 
          icon={faExclamationTriangle} 
          className="text-green-600 text-8xl md:text-9xl mb-6 animate-pulse" 
        />
        <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
          Oops! Page Not Found
        </h2>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Back Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-full font-medium text-lg hover:bg-green-700 transition shadow-lg"
          >
            <FontAwesomeIcon icon={faHome} />
            Back to Home
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 border-2 border-green-600 rounded-full font-medium text-lg hover:bg-green-50 transition"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;