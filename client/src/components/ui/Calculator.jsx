import { useState, useEffect } from 'react';

const Calculator = () => {
  const [bill, setBill] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (bill > 5000) {
      const avgUnitPrice = 50;
      const monthlyUnits = bill / avgUnitPrice;
      const generationPerKW = 130;
      const systemKW = Math.round((monthlyUnits / generationPerKW) * 10) / 10;
      const costPerKW = 250000;
      const totalCost = Math.round(systemKW * costPerKW / 50000) * 50000;
      const monthlySavings = Math.round(bill * 0.95);
      const annualSavings = monthlySavings * 12;
      const paybackYears = (totalCost / annualSavings).toFixed(1);

      setResults({
        systemKW,
        monthlySavings,
        annualSavings,
        totalCost,
        paybackYears
      });
    } else {
      setResults(null);
    }
  }, [bill]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <h3 className="text-3xl font-semibold text-center mb-10 text-green-900">Solar Savings Calculator</h3>
      <div className="grid md:grid-cols-2 gap-10 items-end">
        <div className="self-start">
          <label className="block text-lg font-medium mb-2">Average Monthly Electricity Bill (LKR)</label>
          <input
            type="number"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            placeholder="e.g. 25000"
            className="w-full px-6 py-4 border rounded-lg focus:border-green-500"
          />
        </div>
        {results && (
          <div className="bg-green-100 p-6 self-start rounded-xl">
            <p className="text-2xl font-bold text-green-800">Recommended System: {results.systemKW} kW</p>
            <p className="text-lg mt-2">Monthly Savings: Rs. {results.monthlySavings.toLocaleString()}</p>
            <p className="text-lg">Annual Savings: Rs. {results.annualSavings.toLocaleString()}</p>
            <p className="text-lg">Approximate Cost: Rs. {results.totalCost.toLocaleString()}</p>
            <p className="text-lg font-semibold text-green-700 mt-4">Payback Period: {results.paybackYears} years</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;