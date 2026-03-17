// src/pages/BTUCalculatorPage.jsx
import { useNavigate } from 'react-router-dom';
import BTUCalculator from '../components/ui/BTUCalculator'; // ← create this component next
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const BTUCalculatorPage = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cooling-solutions')}
          className="mb-8 flex items-center gap-2 text-green-600 hover:text-green-800 font-medium text-lg transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Cooling Solutions
        </button>

        {/* Main Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
            Air Conditioner BTU Calculator
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Estimate the required cooling capacity (in BTU/hr) for your room or space — 
            tailored to Sri Lanka’s hot and humid climate.
          </p>
        </div>

        {/* Calculator Component */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-200">
          <BTUCalculator />
        </div>

        {/* Extra Info / CTA */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-xl font-semibold mb-4">
            Not sure about the results? 
            <Link 
              to="/contact" 
              className="text-green-600 hover:text-green-800 hover:underline font-medium ml-2"
            >
              Get expert advice
            </Link> 
            — we offer free site assessments and consultations.
          </p>

          <p className="text-sm mt-6 text-gray-500">
            This tool provides a general estimate. Actual requirements may vary based on insulation, 
            ceiling height, number of people, appliances, and sunlight exposure.
          </p>
        </div>
      </div>
    </main>
  );
};

export default BTUCalculatorPage;