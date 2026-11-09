import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  HardDrive,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Cloud,
} from 'lucide-react';
import { PlanId, StoragePlan, StorageSummary, User } from '../types/drive';
import { formatBytes, STORAGE_PLANS } from '../utils/driveLogic';

interface StoragePlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  storageSummary: StorageSummary;
  onSelectPlan: (planId: PlanId) => Promise<void>;
}

export const StoragePlansModal: React.FC<StoragePlansModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  storageSummary,
  onSelectPlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (planId: PlanId) => {
    setUpgrading(planId);
    try {
      await onSelectPlan(planId);
      setSuccessMessage(`Successfully switched to ${planId.replace('_', ' ').toUpperCase()} storage plan!`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setUpgrading(null);
    }
  };

  const categories = [
    { key: 'image', label: 'Images & Photos', color: 'bg-emerald-500' },
    { key: 'video', label: 'Videos', color: 'bg-purple-500' },
    { key: 'audio', label: 'Audio', color: 'bg-amber-500' },
    { key: 'document', label: 'Documents & PDFs', color: 'bg-blue-500' },
    { key: 'spreadsheet', label: 'Spreadsheets', color: 'bg-green-600' },
    { key: 'code', label: 'Code & Data', color: 'bg-indigo-500' },
    { key: 'other', label: 'Other Files', color: 'bg-gray-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-8 text-white relative">
          <button
            onClick={onClose}
            aria-label="Close storage plans"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-3 border border-white/20">
              <Cloud className="w-3.5 h-3.5" />
              <span>Google Cloud Storage Plans</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Expand your cloud capacity
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Seamlessly sync, search, and preview your files across all your devices with high-speed bandwidth and Gemini AI.
            </p>
          </div>

          {/* Current Storage Meter Overview */}
          <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">
              <span className="font-medium text-blue-100">
                Current Storage Used ({currentUser?.name || 'Guest'})
              </span>
              <span className="font-bold text-white text-sm">
                {storageSummary.isUnlimited ? (
                  <span className="text-emerald-300">Unlimited Active (Admin)</span>
                ) : (
                  `${storageSummary.formattedUsed} of ${storageSummary.formattedQuota} (${storageSummary.percentageUsed}%)`
                )}
              </span>
            </div>

            {/* Visual Storage Bar Breakdown */}
            <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden flex">
              {storageSummary.isUnlimited ? (
                <div className="h-full bg-emerald-400 w-full animate-pulse" />
              ) : (
                categories.map((cat) => {
                  const bytes = storageSummary.breakdown[cat.key as keyof typeof storageSummary.breakdown] || 0;
                  const pct = storageSummary.quotaBytes > 0 ? (bytes / storageSummary.quotaBytes) * 100 : 0;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={cat.key}
                      className={`h-full ${cat.color} transition-all`}
                      style={{ width: `${pct}%` }}
                      title={`${cat.label}: ${formatBytes(bytes)}`}
                    />
                  );
                })
              )}
            </div>

            {/* Category breakdown tags */}
            {!storageSummary.isUnlimited && (
              <div className="flex flex-wrap gap-3 mt-3 pt-2 border-t border-white/10 text-[11px] text-blue-100">
                {categories.map((cat) => {
                  const bytes = storageSummary.breakdown[cat.key as keyof typeof storageSummary.breakdown] || 0;
                  if (bytes === 0) return null;
                  return (
                    <div key={cat.key} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                      <span>{cat.label}:</span>
                      <span className="font-semibold text-white">{formatBytes(bytes)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Billing Cycle Switcher */}
        <div className="p-6 bg-gray-50/50 flex flex-col items-center border-b border-gray-100">
          <div className="inline-flex items-center p-1 bg-gray-200/70 rounded-xl text-xs font-semibold text-gray-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'yearly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                Save 18%
              </span>
            </button>
          </div>
        </div>

        {/* The 4 Requested Storage Plans + Admin Tier */}
        <div className="p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STORAGE_PLANS.filter((p) => p.id !== 'admin_unlimited').map((plan) => {
              const isCurrent = currentUser?.planId === plan.id;
              const isPopular = plan.highlight;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 border ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-md'
                      : isPopular
                      ? 'border-indigo-300 bg-white shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Top Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold tracking-wide uppercase shadow-sm">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-3xl font-extrabold text-gray-900 mb-1">
                      {plan.displayStorage}
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                      {plan.priceMonthly === 0 ? (
                        <span className="font-semibold text-emerald-600">Free Forever</span>
                      ) : (
                        <span>
                          <strong className="text-gray-900 text-base">
                            ${billingCycle === 'monthly' ? plan.priceMonthly : (plan.priceYearly / 12).toFixed(2)}
                          </strong>
                          /month
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-5 pb-4 border-b border-gray-100">
                      {plan.description}
                    </p>

                    <ul className="space-y-2.5 text-xs text-gray-700 mb-6">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={isCurrent || upgrading !== null}
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {upgrading === plan.id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : (
                      <>
                        <span>Select {plan.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Admin Unlimited Special Banner */}
          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Administrator Unlimited Tier (Eyad.Eliwa)
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  The administrator account is granted infinite storage capacity, complete system inspection, and cross-user management.
                </p>
              </div>
            </div>

            {currentUser?.role === 'admin' ? (
              <span className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm whitespace-nowrap text-center">
                Admin Unlimited Active
              </span>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  // prompt admin login
                }}
                className="px-4 py-2 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold shadow-xs transition whitespace-nowrap cursor-pointer text-center"
              >
                Sign In as Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
