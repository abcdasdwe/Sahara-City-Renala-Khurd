import { useState, useEffect } from 'react';
import { Calculator, Calendar, DollarSign, Table, Layers, ArrowUpRight, HelpCircle } from 'lucide-react';
import { Property } from '../types';

interface InstallmentCalcProps {
  properties: Property[];
  presetProperty?: Property | null;
}

export default function InstallmentCalc({ properties, presetProperty }: InstallmentCalcProps) {
  // Preset Sizes
  const presetSizes = [
    { label: '5 Marla Residential Plot', value: 1850000, key: '5m-res' },
    { label: '10 Marla Residential Plot', value: 3400000, key: '10m-res' },
    { label: '1 Kanal Residential Plot', value: 7800000, key: '1k-res' },
    { label: '4 Marla Commercial Plot', value: 6500000, key: '4m-com' }
  ];

  const [selectedPreset, setSelectedPreset] = useState('5m-res');
  const [totalPrice, setTotalPrice] = useState(1850000);
  const [downPayPercent, setDownPayPercent] = useState(20); // 20% by default
  const [years, setYears] = useState(3); // 3 years installment schedule
  const [quarterlyPlan, setQuarterlyPlan] = useState(true); // Allocate some portion to quarterly installments

  // Set preset if passed
  useEffect(() => {
    if (presetProperty) {
      setTotalPrice(presetProperty.price);
      setSelectedPreset('custom');
      if (presetProperty.installmentDetails) {
        const details = presetProperty.installmentDetails;
        const totalCost = presetProperty.price;
        const downP = details.downPayment;
        setDownPayPercent(Math.round((downP / totalCost) * 100));
        setYears(Math.round(details.totalInstallments / 12));
      }
    }
  }, [presetProperty]);

  // Handle Preset Selection
  const handlePresetChange = (key: string) => {
    setSelectedPreset(key);
    if (key === 'custom') return;
    const found = presetSizes.find(p => p.key === key);
    if (found) {
      setTotalPrice(found.value);
    }
  };

  // Calculations
  const downPayment = Math.round((totalPrice * downPayPercent) / 100);
  const remainingBalance = totalPrice - downPayment;
  const totalMonths = years * 12;
  const totalQuarters = years * 4;

  // Let's divide remaining balance: e.g. 60% on monthly payments, 40% on quarterly payments (very common in Sahara City)
  const monthlyAllocation = quarterlyPlan ? remainingBalance * 0.6 : remainingBalance;
  const quarterlyAllocation = quarterlyPlan ? remainingBalance * 0.4 : 0;

  const monthlyInstallmentValue = Math.round(monthlyAllocation / totalMonths);
  const quarterlyInstallmentValue = quarterlyPlan ? Math.round(quarterlyAllocation / totalQuarters) : 0;

  // Generate Payment schedule
  const scheduleRows = [];
  let cumulativePaid = downPayment;
  for (let m = 1; m <= totalMonths; m++) {
    let type = 'Monthly Installment';
    let paymentAmount = monthlyInstallmentValue;

    const isQuarter = quarterlyPlan && m % 3 === 0;
    if (isQuarter) {
      type = 'Monthly + Quarterly';
      paymentAmount += quarterlyInstallmentValue;
    }

    cumulativePaid += paymentAmount;
    // Cap paid at total price to avoid rounding errors
    if (m === totalMonths) {
      paymentAmount += (totalPrice - cumulativePaid);
      cumulativePaid = totalPrice;
    }

    scheduleRows.push({
      month: m,
      type,
      amount: paymentAmount,
      balance: Math.max(0, totalPrice - cumulativePaid)
    });
  }

  // Visual Chart percentages
  const dpShare = Math.round((downPayment / totalPrice) * 100);
  const monthlyShare = Math.round((monthlyAllocation / totalPrice) * 100);
  const quarterlyShare = quarterlyPlan ? Math.round((quarterlyAllocation / totalPrice) * 100) : 0;

  return (
    <div className="font-sans text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#090E16] text-[#F4F6F9]">
      
      {/* Page Header */}
      <div className="border-b border-[#C5A880]/15 pb-6 mb-10 text-left">
        <span className="text-[#C5A880] text-xs font-bold uppercase tracking-widest bg-[#C5A880]/10 py-1 px-3.5 border border-[#C5A880]/35 rounded-full inline-block font-mono">FINANCIAL PORTAL</span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white flex items-center gap-3 mt-3">
          <Calculator className="h-8 w-8 text-[#C5A880]" />
          Sahara <span className="text-[#C5A880] italic font-medium">Installment Engine</span>
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl text-xs sm:text-sm">
          Calculate custom interest-free installment schedules, discover down payments, quarterly updates, possession metrics, and download payment guides.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Calculator Settings */}
        <div className="lg:col-span-5 bg-[#0F1A2C] border border-[#C5A880]/10 rounded-2xl p-6 shadow-2xl space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#C5A880] pb-2 border-b border-[#C5A880]/10">
            Calculator Parameters
          </h2>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Available Sahara Templates
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {presetSizes.map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handlePresetChange(p.key)}
                  className={`py-2 px-3 text-left rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                    selectedPreset === p.key
                      ? 'border-[#C5A880]/80 bg-[#C5A880]/15 text-[#C5A880]'
                      : 'border-white/5 bg-white/5 text-gray-300 hover:border-[#C5A880]/40'
                  }`}
                >
                  <span className="font-sans leading-none">{p.label}</span>
                  <span className="font-mono text-[#C5A880] font-bold">PKR {p.value.toLocaleString()}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedPreset('custom')}
                className={`py-2 px-3 text-left rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                  selectedPreset === 'custom'
                    ? 'border-[#C5A880]/80 bg-[#C5A880]/15 text-[#C5A880]'
                    : 'border-white/5 bg-white/5 text-gray-300 hover:border-[#C5A880]/40'
                }`}
              >
                <span>Custom Specific Amount</span>
                <span className="font-mono text-[#C5A880] font-bold">Enter Below</span>
              </button>
            </div>
          </div>

          {/* Price Input */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Property Price (PKR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#C5A880] text-xs font-bold font-mono">PKR</span>
              <input
                type="number"
                disabled={selectedPreset !== 'custom'}
                value={totalPrice}
                onChange={(e) => setTotalPrice(Math.max(100000, Number(e.target.value)))}
                className="w-full bg-[#090E16] border border-[#C5A880]/15 rounded-xl py-2.5 pl-12 pr-4 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#C5A880]"
              />
            </div>
          </div>

          {/* Down Payment % Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-gray-400">Down Payment</span>
              <span className="text-[#C5A880] font-mono">{downPayPercent}% (PKR {downPayment.toLocaleString()})</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={downPayPercent}
              onChange={(e) => setDownPayPercent(Number(e.target.value))}
              className="w-full h-1.5 bg-[#090E16] rounded-lg appearance-none cursor-pointer accent-[#C5A880]"
            />
            <div className="flex justify-between text-[9px] text-[#C5A880] font-mono">
              <span>Min: 10%</span>
              <span>Max: 50%</span>
            </div>
          </div>

          {/* Tenure Selection */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Payment Tenure (Duration)
            </label>
            <select
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full bg-[#090E16] border border-[#C5A880]/15 rounded-xl py-2.5 px-4 text-xs text-white font-bold focus:outline-none focus:border-[#C5A880]"
            >
              <option value={1}>1 Year (12 Months)</option>
              <option value={2}>2 Years (24 Months)</option>
              <option value={3}>3 Years (36 Months) [Standard]</option>
              <option value={4}>4 Years (48 Months)</option>
              <option value={5}>5 Years (60 Months) [Max Plan]</option>
            </select>
          </div>

          {/* Include Quarterly option */}
          <div className="flex items-center justify-between p-3.5 bg-[#090E16] rounded-xl border border-white/5">
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-gray-200">Quarterly Installments</span>
              <span className="text-[10px] text-gray-400">Split 40% of remaining balance to quarters</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={quarterlyPlan}
                onChange={() => setQuarterlyPlan(!quarterlyPlan)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#0F1A2C] after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5A880]"></div>
            </label>
          </div>

        </div>

        {/* Right Dashboard results & details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-[#0F1A2C] border-l-4 border-[#C5A880] p-5 rounded-2xl shadow-md text-left">
              <p className="text-[10px] uppercase tracking-widest text-[#C5A880] font-bold">
                Required Down Payment
              </p>
              <h3 className="text-2xl font-black mt-1 text-white font-sans">
                PKR {downPayment.toLocaleString()}
              </h3>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-sans">
                <Calendar className="h-3.5 w-3.5 text-[#C5A880]" />
                Payable at signing (Immediate Approval)
              </p>
            </div>

            <div className="bg-[#0F1A2C] border border-white/5 p-5 rounded-2xl shadow-md text-left">
              <p className="text-[10px] uppercase tracking-widest text-[#C5A880] font-bold">
                Remaining Balance
              </p>
              <h3 className="text-2xl font-black mt-1 text-white font-sans">
                PKR {remainingBalance.toLocaleString()}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Zero Interest over {years} years rate.
              </p>
            </div>

            <div className="bg-[#0F1A2C] border border-white/5 p-5 rounded-2xl shadow-md text-left">
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                Monthly Payment ({totalMonths}x)
              </p>
              <h3 className="text-2xl font-black mt-1 text-white font-sans">
                PKR {monthlyInstallmentValue.toLocaleString()}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Due before 10th of every month
              </p>
            </div>

            {quarterlyPlan ? (
              <div className="bg-[#0F1A2C] border border-white/5 p-5 rounded-2xl shadow-md text-left">
                <p className="text-[10px] uppercase tracking-widest text-[#C5A880] font-bold">
                  Quarterly Payment ({totalQuarters}x)
                </p>
                <h3 className="text-2xl font-black mt-1 text-white font-sans">
                  PKR {quarterlyInstallmentValue.toLocaleString()}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Due every 3rd month (Quarter End)
                </p>
              </div>
            ) : (
              <div className="bg-[#0F1A2C]/60 border border-white/5 p-5 rounded-2xl shadow-md opacity-50 text-left">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  Quarterly Payment
                </p>
                <h3 className="text-xl font-bold mt-1 text-gray-400">
                  Skipped / Disabled
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Re-enable for lower monthly metrics.
                </p>
              </div>
            )}

          </div>

          {/* Visual Progress Graph */}
          <div className="bg-[#0F1A2C] border border-white/5 rounded-2xl p-5 shadow-md text-left">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 font-mono">
              Visual Payment Allocation Breakdown
            </h3>
            
            {/* Visual Bar */}
            <div className="h-5 w-full bg-[#090E16] rounded-full overflow-hidden flex shadow-inner border border-white/5">
              <div
                style={{ width: `${dpShare}%` }}
                className="bg-[#C5A880] h-full flex items-center justify-center text-[9px] text-[#090E16] font-bold hover:opacity-90 transition-opacity"
                title={`Down Payment: ${dpShare}%`}
              >
                {dpShare > 12 && `${dpShare}% DP`}
              </div>
              <div
                style={{ width: `${monthlyShare}%` }}
                className="bg-sky-500 h-full flex items-center justify-center text-[9px] text-[#090E16] font-bold hover:opacity-90 transition-opacity"
                title={`Monthly: ${monthlyShare}%`}
              >
                {monthlyShare > 12 && `${monthlyShare}% Mon`}
              </div>
              {quarterlyPlan && (
                <div
                  style={{ width: `${quarterlyShare}%` }}
                  className="bg-indigo-500 h-full flex items-center justify-center text-[9px] text-[#090E16] font-bold hover:opacity-90 transition-opacity"
                  title={`Quarterly: ${quarterlyShare}%`}
                >
                  {quarterlyShare > 12 && `${quarterlyShare}% Qtr`}
                </div>
              )}
            </div>

            {/* Legends */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-[11px] font-medium font-sans">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[#C5A880]"></span>
                <span className="text-gray-400">Down Payment ({dpShare}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-sky-500"></span>
                <span className="text-gray-400">Monthly Installment ({monthlyShare}%)</span>
              </div>
              {quarterlyPlan && (
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-indigo-500"></span>
                  <span className="text-gray-400">Quarterly Installment ({quarterlyShare}%)</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Schedule Table Box (Limited view with scroll) */}
          <div className="bg-[#0F1A2C] border border-[#C5A880]/10 rounded-2xl p-5 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880] flex items-center gap-2">
                <Table className="h-4 w-4 text-[#C5A880]" />
                Amortized Payment Schedule ({totalMonths} Months)
              </h3>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Interest Free
              </span>
            </div>

            <div className="overflow-y-auto max-h-72 rounded-xl border border-white/5">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#090E16] text-[#C5A880] uppercase tracking-widest text-[9px] border-b border-white/5">
                  <tr>
                    <th className="py-2.5 px-4 text-center">Month</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4 text-right">Payment Amount</th>
                    <th className="py-2.5 px-4 text-right">Remaining Loan Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="bg-[#C5A880]/5 text-gray-300 font-semibold text-xs">
                    <td className="py-2.5 px-4 text-center font-bold text-[#C5A880]">-</td>
                    <td className="py-2.5 px-4 uppercase text-[9px] font-bold tracking-widest text-[#C5A880]">Initial Downpayment</td>
                    <td className="py-2.5 px-4 text-right font-bold text-[#C5A880]">PKR {downPayment.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right text-gray-400 font-mono">PKR {remainingBalance.toLocaleString()}</td>
                  </tr>
                  
                  {scheduleRows.map((row) => (
                    <tr
                      key={row.month}
                      className="hover:bg-white/5 text-gray-300 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-center font-bold text-gray-500 font-mono">Month {row.month}</td>
                      <td className="py-2.5 px-4 font-medium font-sans">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          row.type.includes('Quarterly')
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'bg-[#090E16] text-gray-400 border border-white/5'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-white font-bold font-mono">
                        PKR {row.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-400">
                        PKR {row.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-orange-500/5 text-amber-300 text-[11px] leading-relaxed border border-amber-500/10">
              <strong>*Important Note:</strong> This is a client-side interest-free simulation based on active standard Sahara City Renala Khurd rates (e.g. at House #130). General pricing plans may undergo routine revisions depending on the land authority board guidelines. Please get a stamped ledger copy from the head office block to verify actual allotment conditions.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
