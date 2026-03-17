import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Constants extracted outside to keep the component clean
const ROOM_FACTORS = { bedroom: 0.85, living: 1.0, kitchen: 1.25, office: 1.1, other: 1.0 };
const SUN_FACTORS = { low: 0.9, medium: 1.0, high: 1.3 };

const BTUCalculator = () => {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState(10);
  const [roomType, setRoomType] = useState('living');
  const [sunExposure, setSunExposure] = useState('medium');
  const [people, setPeople] = useState(2);
  const [appliances, setAppliances] = useState(0);
  const [resultBTU, setResultBTU] = useState(null);
  const [resultTons, setResultTons] = useState(null);

  const calculate = () => {
    if (!length || !width || !height) {
      setResultBTU(null);
      setResultTons(null);
      return;
    }

    const area = Number(length) * Number(width);
    let btu = area * 25; // Base: 25 BTU per sq ft

    // Adjustments
    btu *= Number(height) / 10;
    btu *= ROOM_FACTORS[roomType];
    btu *= SUN_FACTORS[sunExposure];
    btu += (Number(people) || 0) * 400;
    btu += (Number(appliances) || 0) * 400;

    // Standard rounding for AC sizing (nearest 500)
    const roundedBTU = Math.round(btu / 500) * 500;
    setResultBTU(roundedBTU);
    setResultTons(Number((roundedBTU / 12000).toFixed(1)));
  };

  useEffect(() => {
    const timer = setTimeout(calculate, 400);
    return () => clearTimeout(timer);
  }, [length, width, height, roomType, sunExposure, people, appliances]);

  const reset = () => {
    setLength('');
    setWidth('');
    setHeight(10);
    setRoomType('living');
    setSunExposure('medium');
    setPeople(2);
    setAppliances(0);
    setResultBTU(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-4 tracking-tight">
            BTU / Air Conditioner Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect cooling capacity for your room in Sri Lanka’s tropical climate.
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Column 1: Physical Space */}
              <section className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">1. Room Dimensions</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Length (ft)</label>
                    <input
                      type="number"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="15"
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Width (ft)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="12"
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ceiling Height (ft)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                  />
                </div>
                
                <div className="p-4 bg-green-50 rounded-xl text-green-800 text-sm italic">
                  Total Area: <span className="font-bold">{length && width ? (Number(length) * Number(width)) : 0} sq ft</span>
                </div>
              </section>

              {/* Column 2: Environmental Factors */}
              <section className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">2. Environmental Factors</h2>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Room Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition appearance-none"
                  >
                    <option value="bedroom">Bedroom / Guest Room</option>
                    <option value="living">Living Room / Hall</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="office">Office / Study</option>
                    <option value="other">Other Commercial</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sun Exposure</label>
                  <select
                    value={sunExposure}
                    onChange={(e) => setSunExposure(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition appearance-none"
                  >
                    <option value="low">Shaded / Low Exposure</option>
                    <option value="medium">Medium / East or West Windows</option>
                    <option value="high">High / Large West Windows / Top Floor</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">People</label>
                    <input
                      type="number"
                      value={people}
                      onChange={(e) => setPeople(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Appliances</label>
                    <input
                      type="number"
                      value={appliances}
                      onChange={(e) => setAppliances(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Actions */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 border-t pt-8">
              <button
                onClick={reset}
                className="px-8 py-3 text-gray-500 hover:text-gray-800 font-medium transition"
              >
                Reset Fields
              </button>
              <button 
                className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                Calculate Now
              </button>
            </div>

            {/* Result Display */}
            {resultBTU && (
              <div className="mt-12 p-8 bg-green-800 rounded-3xl text-white text-center animate-in fade-in zoom-in duration-500">
                <h3 className="text-green-200 uppercase tracking-widest text-sm font-bold mb-2">Recommended Capacity</h3>
                <div className="text-5xl md:text-6xl font-black mb-4">
                  {resultBTU.toLocaleString()} <span className="text-2xl font-normal">BTU/hr</span>
                </div>
                <div className="text-xl md:text-2xl font-semibold opacity-90">
                  Approx. {resultTons} – {Math.ceil(resultTons * 2) / 2} Ton Unit
                </div>
                
                <div className="mt-8 flex flex-col items-center">
                  <p className="text-green-100 text-sm max-w-md mb-6 leading-relaxed">
                    Sizing depends on Sri Lankan humidity and building insulation. We recommend a professional survey for best results.
                  </p>
                  <Link
                    to="/contact"
                    className="bg-white text-green-900 px-8 py-3 rounded-full font-bold hover:bg-green-50 transition shadow-xl"
                  >
                    Request Free Site Survey
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BTUCalculator;