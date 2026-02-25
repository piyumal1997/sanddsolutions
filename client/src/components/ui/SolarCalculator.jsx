// src/components/ui/SolarCalculator.jsx
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlug,
  faBolt,
  faSolarPanel,
  faMoneyBillWave,
  faPiggyBank,
  faCalendarAlt,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const SolarCalculator = () => {
  const [bill, setBill] = useState(5000);
  const [phase, setPhase] = useState('single');
  const [option, setOption] = useState('financed');
  const [term, setTerm] = useState(5);
  const [rate, setRate] = useState(11.0);
  const [results, setResults] = useState(null);

  const PACKAGE_PRICES = {
    5: 750000,
    10: 1540000,
    15: 2050000,
    20: 2360000,
    30: 3350000,
    40: 3960000,
  };

  // 2025 Solar Export Tariff (Net Accounting) – Rs per exported unit
  const getExportRate = (systemSizeKw) => {
    if (systemSizeKw < 5) return 20.90;
    if (systemSizeKw <= 20) return 19.61;
    if (systemSizeKw <= 100) return 17.46;
    if (systemSizeKw <= 500) return 15.49;
    if (systemSizeKw <= 1000) return 15.07;
    return 14.46;
  };

  // Energy charge only (no fuel surcharge)
  const calculateEnergyCharge = (units) => {
    if (units <= 0) return 0;
    let energy = 0;

    if (units <= 60) {
      energy += Math.min(units, 30) * 4.5;
      if (units > 30) energy += (units - 30) * 8;
    } else {
      energy += 60 * 12.75;
      if (units > 60) energy += Math.min(units - 60, 30) * 18.5;
      if (units > 90) energy += Math.min(units - 90, 30) * 24.5;
      if (units > 120) energy += Math.min(units - 120, 60) * 41;
      if (units > 180) energy += (units - 180) * 61;
    }

    return Math.round(energy);
  };

  // Fixed charge (your table)
  const getFixedCharge = (units) => {
    if (units <= 30) return 80;
    if (units <= 60) return 210;
    if (units <= 90) return 400;
    if (units <= 120) return 1000;
    if (units <= 180) return 1500;
    return 2100;
  };

  // Full CEB bill = energy + fixed (no fuel)
  const calculateCEBBill = (units) => {
    const energy = calculateEnergyCharge(units);
    const fixed = getFixedCharge(units);
    return Math.round(energy + fixed);
  };

  // Accurate reverse lookup for consumption units
  const estimateUnitsFromBill = (inputBill) => {
    if (inputBill < 5000) return 80;
    let bestUnits = 0;
    let bestDiff = Infinity;

    for (let u = 30; u <= 1200; u += 0.5) {
      const calcBill = calculateCEBBill(Math.round(u));
      const diff = Math.abs(calcBill - inputBill);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestUnits = Math.round(u);
      }
      if (calcBill > inputBill + 3000) break;
    }

    let finalUnits = bestUnits;
    for (let u = Math.max(0, bestUnits - 10); u <= bestUnits + 10; u++) {
      const diff = Math.abs(calculateCEBBill(u) - inputBill);
      if (diff < Math.abs(calculateCEBBill(finalUnits) - inputBill)) {
        finalUnits = u;
      }
    }

    return finalUnits;
  };

  const calculateSavings = () => {
    if (isNaN(bill) || bill < 5000) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Please enter a valid monthly bill of at least 5,000 LKR.',
      });
      return;
    }

    const UNITS_PER_KW_MONTH = 125;

    const estimatedUnits = estimateUnitsFromBill(bill);
    const theoreticalKw = Math.ceil(estimatedUnits / UNITS_PER_KW_MONTH);

    const packageSizes = Object.keys(PACKAGE_PRICES).map(Number).sort((a, b) => a - b);
    let selectedKw = packageSizes.find(kw => kw >= theoreticalKw) || 40;

    const totalCost = PACKAGE_PRICES[selectedKw];
    const monthlyGeneration = Math.round(selectedKw * UNITS_PER_KW_MONTH);

    // Net Accounting logic
    const netImportedUnits = Math.max(0, estimatedUnits - monthlyGeneration);
    const excessUnits = Math.max(0, monthlyGeneration - estimatedUnits);

    const grossBill = calculateCEBBill(netImportedUnits);

    const exportRate = getExportRate(selectedKw);
    const monthlyExportPayment = excessUnits * exportRate;

    const finalBill = Math.max(0, grossBill - monthlyExportPayment);

    const monthlyBillSavings = bill - finalBill;
    const totalMonthlyBenefit = monthlyBillSavings + monthlyExportPayment;

    const annualBenefit = totalMonthlyBenefit * 12;
    const paybackYears = annualBenefit > 0 ? (totalCost / annualBenefit).toFixed(1) : 'N/A';

    const phaseDisplay = phase === 'single' ? 'Single Phase' : 'Three Phase';

    let phaseNote = '';
    if (selectedKw > 5 && phase === 'single') {
      phaseNote = `A ${selectedKw} kW system requires a three-phase connection for net metering compliance and optimal performance in Sri Lanka. Single-phase is limited to 5 kW.`;
    } else if (selectedKw > 5) {
      phaseNote = `The selected ${selectedKw} kW package is suitable for three-phase connection.`;
    } else {
      phaseNote = `A 5 kW system is generally compatible with single-phase connections.`;
    }

    const common = {
      estimatedUnits: estimatedUnits.toLocaleString() + ' units',
      theoreticalKw: theoreticalKw + ' kW',
      recommendedPackage: selectedKw + ' kW',
      generation: monthlyGeneration.toLocaleString() + ' units',
      excessUnits: excessUnits.toLocaleString() + ' units',
      exportRate: exportRate.toFixed(2) + ' LKR/unit',
      monthlyNetIncome: 'Rs. ' + Math.round(monthlyExportPayment).toLocaleString(),
      costDisplay: 'Rs. ' + totalCost.toLocaleString(),
      paybackDisplay: paybackYears + ' years',
      phaseDisplay,
      phaseNote,
      totalMonthlyBenefit: Math.round(totalMonthlyBenefit),
    };

    let calculatedResults;
    if (option === 'financed') {
      const monthlyRate = rate / 100 / 12;
      const months = term * 12;
      let emi = totalCost / months;
      if (monthlyRate > 0) {
        emi = totalCost * monthlyRate * Math.pow(1 + monthlyRate, months) /
              (Math.pow(1 + monthlyRate, months) - 1);
      }
      emi = Math.round(emi);

      const netMonthly = common.totalMonthlyBenefit - emi;

      calculatedResults = {
        type: 'financed',
        ...common,
        emiDisplay: 'Rs. ' + emi.toLocaleString(),
        netMonthlyDisplay: netMonthly >= 0
          ? 'Rs. ' + netMonthly.toLocaleString()
          : 'Rs. ' + (-netMonthly).toLocaleString(),
        netPositive: netMonthly >= 0,
      };
    } else {
      calculatedResults = {
        type: 'cash',
        ...common,
        savingsDisplay: 'Rs. ' + common.totalMonthlyBenefit.toLocaleString(),
      };
    }

    setResults(calculatedResults);
  };

  return (
    <div className="max-w-lg md:max-w-2xl mx-auto relative px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
        Solar Package & Savings Calculator
      </h1>
      <p className="text-center text-base md:text-lg text-gray-600 mb-10">
        Net Accounting – 2025 CEB Export Tariffs
      </p>

      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-8">
        {/* Monthly Bill Input */}
        <div>
          <label htmlFor="bill" className="block text-base md:text-lg font-semibold text-gray-700 mb-2">
            Your Current Monthly Bill (LKR)
          </label>
          <input
            type="number"
            id="bill"
            min="5000"
            value={bill}
            onChange={(e) => setBill(parseFloat(e.target.value) || 0)}
            placeholder="e.g. 5000"
            className="w-full px-4 py-3 md:py-4 text-base md:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Phase Selection */}
        <div className="flex flex-col items-center border border-gray-200 p-4 rounded-lg">
          <label className="text-base md:text-lg font-semibold text-gray-700 mb-4">
            Connection Type
          </label>
          <div className="flex items-center justify-center space-x-8">
            <span className="text-lg font-medium text-gray-600">Single Phase</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={phase === 'three'}
                onChange={() => setPhase(phase === 'single' ? 'three' : 'single')}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-blue-600 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-lg font-medium text-gray-600">Three Phase</span>
          </div>
        </div>

        {/* Payment Option */}
        <div className="flex flex-col items-center border border-gray-200 p-4 rounded-lg">
          <label className="text-base md:text-lg font-semibold text-gray-700 mb-4">
            Payment Option
          </label>
          <div className="flex items-center justify-center space-x-8">
            <span className="text-lg font-medium text-gray-600">Cash</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={option === 'financed'}
                onChange={() => setOption(option === 'cash' ? 'financed' : 'cash')}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-400 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-lg font-medium text-gray-600">Financed / Loan</span>
          </div>
        </div>

        {/* Loan Fields */}
        {option === 'financed' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="term" className="block text-base md:text-lg font-semibold text-gray-700 mb-2">
                Loan Term (Years)
              </label>
              <select
                id="term"
                value={term}
                onChange={(e) => setTerm(parseInt(e.target.value))}
                className="w-full px-4 py-3 md:py-4 text-base md:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              >
                <option value={3}>3 Years</option>
                <option value={5}>5 Years</option>
                <option value={7}>7 Years</option>
                <option value={10}>10 Years</option>
              </select>
            </div>
            <div>
              <label htmlFor="rate" className="block text-base md:text-lg font-semibold text-gray-700 mb-2">
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                id="rate"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 8.0"
                className="w-full px-4 py-3 md:py-4 text-base md:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
        )}

        <button
          onClick={calculateSavings}
          className="w-full mt-8 py-4 md:py-5 bg-green-600 hover:bg-green-700 text-white font-bold text-lg md:text-xl rounded-lg shadow-md transition transform hover:scale-105"
        >
          Calculate Savings & Package
        </button>
      </div>

      {/* RESULTS */}
      {results && (
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
            {results.type === 'financed' ? 'Financed Solar Package' : 'Cash Purchase Solar Package'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-5 text-center shadow-md">
              <FontAwesomeIcon icon={faPlug} className="text-green-600 text-4xl mb-3" />
              <p className="text-sm text-gray-600 font-medium">Connection Type</p>
              <p className="text-xl font-bold">{results.phaseDisplay}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 text-center shadow-md">
              <FontAwesomeIcon icon={faBolt} className="text-green-600 text-4xl mb-3" />
              <p className="text-sm text-gray-600 font-medium">Estimated Consumption</p>
              <p className="text-xl font-bold">{results.estimatedUnits}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 text-center shadow-md">
              <FontAwesomeIcon icon={faSolarPanel} className="text-green-600 text-4xl mb-3" />
              <p className="text-sm text-gray-600 font-medium">Required System Size</p>
              <p className="text-xl font-bold">{results.theoreticalKw}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-5 text-center shadow-md ring-2 ring-green-400">
              <FontAwesomeIcon icon={faSolarPanel} className="text-green-700 text-4xl mb-3" />
              <p className="text-sm text-green-800 font-semibold">Recommended Package</p>
              <p className="text-2xl font-bold text-green-800">{results.recommendedPackage}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 text-center shadow-md">
              <FontAwesomeIcon icon={faSolarPanel} className="text-green-600 text-4xl mb-3" />
              <p className="text-sm text-gray-600 font-medium">Avg Monthly Generation</p>
              <p className="text-xl font-bold">{results.generation}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-5 text-center shadow-md ring-2 ring-green-400 md:col-span-3">
              <FontAwesomeIcon icon={faPiggyBank} className="text-green-700 text-4xl mb-3" />
              <p className="text-sm text-green-800 font-semibold">Monthly Net Income</p>
              <p className="text-3xl font-bold text-green-800">{results.monthlyNetIncome}</p>
              <p className="text-sm text-gray-600 mt-2">
                (Income from excess units exported to CEB)
              </p>
            </div>

            {option === 'financed' && (
              <>
                <div className="bg-gray-50 rounded-lg p-5 text-center shadow-md">
                  <FontAwesomeIcon icon={faPiggyBank} className="text-green-600 text-4xl mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Monthly EMI</p>
                  <p className="text-xl font-bold">{results.emiDisplay}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-5 text-center shadow-md ring-2 ring-green-300 md:col-span-2">
                  <FontAwesomeIcon icon={faPiggyBank} className="text-green-600 text-4xl mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Net Monthly Cashflow</p>
                  <p className={`text-3xl font-bold ${results.netPositive ? 'text-green-700' : 'text-red-700'}`}>
                    {results.netMonthlyDisplay}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {results.netPositive 
                      ? "Positive: You gain this amount each month after EMI"
                      : "Negative: Loan EMI exceeds solar benefit this month"}
                  </p>
                </div>
              </>
            )}

            <div className="bg-gray-50 rounded-lg p-5 text-center shadow-md">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600 text-4xl mb-3" />
              <p className="text-sm text-gray-600 font-medium">Estimated Payback Period</p>
              <p className="text-xl font-bold">{results.paybackDisplay}</p>
            </div>

            {results.phaseNote && (
              <div className="bg-orange-50 rounded-lg p-5 text-center shadow-md md:col-span-3">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-orange-600 text-4xl mb-3" />
                <p className="text-sm text-gray-600 font-medium">Important Note</p>
                <p className="text-lg font-semibold text-orange-700">{results.phaseNote}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assumptions */}
      <div className="mt-12 bg-gray-100 rounded-2xl p-6 md:p-8 text-sm md:text-base text-gray-600">
        <strong className="block mb-3 text-lg text-gray-800">Real-World Assumptions (2025–2026):</strong>
        <ul className="list-disc list-inside space-y-2 font-semibold">
          <li>CEB domestic tariff + fixed charges</li>
          <li>Net Accounting: export payment for excess units</li>
          <li>Export rates: 20.90 (&lt;5 kW), 19.61 (5–20 kW), 17.46 (20–100 kW), etc.</li>
          <li>Generation: 125 units per 1kW (Western Province average)</li>
          <li>Monthly Net Income = only export payment from excess units</li>
          <li>Net Monthly Cashflow (financed) = Total benefit - EMI</li>
          <li>Payback includes full benefit (bill reduction + export income)</li>
        </ul>
        <p className="mt-4 font-semibold text-red-700">
          This is an estimate only. Actual tariffs, export rates, generation and billing may vary.
        </p>
      </div>
    </div>
  );
};

export default SolarCalculator;