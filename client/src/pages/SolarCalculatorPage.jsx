// src/pages/SolarCalculatorPage.jsx
import { useNavigate } from 'react-router-dom';
import SolarCalculator from '../components/ui/SolarCalculator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const SolarCalculatorPage = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/solar-energy')}
          className="mb-8 flex items-center gap-2 text-green-600 hover:text-green-800 font-medium text-lg transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Solar & Energy Systems
        </button>

        {/* Calculator Component */}
        <SolarCalculator />

        {/* Optional: Extra info or CTA */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-xl font-semibold mb-4">
            Need personalized advice? <Link to="/contact" className="text-green-600 hover:underline font-medium">Contact us</Link> for a free consultation.
          </p>
        </div>
      </div>
    </main>
  );
};

export default SolarCalculatorPage;