import React, { useState } from "react";
import { Sliders, HelpCircle, Activity, Heart, CheckCircle } from "lucide-react";
import { TamState } from "../types.ts";

export default function TAMPanel() {
  const [tam, setTam] = useState<TamState>({
    perceivedUsefulness: 80,
    perceivedEaseOfUse: 85,
    socialInfluence: 70,
    facilitatingConditions: 75,
  });

  const handleSliderChange = (key: keyof TamState, val: number) => {
    setTam((prev) => ({ ...prev, [key]: val }));
  };

  // TAM math simulator: calculate Behavioral Intention (BI) and Actual Usage (AU)
  // BI = 0.5 * PU + 0.3 * PEOU + 0.2 * SI
  // AU = 0.6 * BI + 0.4 * FC
  const behavioralIntention = Math.round(
    0.5 * tam.perceivedUsefulness + 
    0.3 * tam.perceivedEaseOfUse + 
    0.2 * tam.socialInfluence
  );

  const actualUsage = Math.round(
    0.6 * behavioralIntention + 
    0.4 * tam.facilitatingConditions
  );

  // Determine trust recommendation tier
  let trustRating = "Excellent Adoption";
  let ratingColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (actualUsage < 50) {
    trustRating = "High Adoption Barrier";
    ratingColor = "text-rose-700 bg-rose-50 border-rose-200";
  } else if (actualUsage < 75) {
    trustRating = "Moderate Acceptance";
    ratingColor = "text-amber-700 bg-amber-50 border-amber-200";
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-100/50 text-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            TAM & UTAUT Trust Simulator
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Model how security indicators affect customer confidence and technology adoption rates.
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${ratingColor}`}>
          {trustRating} ({actualUsage}%)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sliders Control */}
        <div className="space-y-5 bg-slate-50 p-5 rounded-xl border border-slate-200/60">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
            <Sliders className="w-4 h-4 text-slate-500" /> User Trust & Perception Sliders
          </h3>

          {/* Perceived Usefulness */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Perceived Usefulness (PU)
                <span className="text-slate-400 font-normal hover:text-emerald-600 cursor-help" title="How effectively the customer feels the app expedites shopping (fast checkout, instant secure verification).">
                  <HelpCircle className="w-3 h-3" />
                </span>
              </label>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded">{tam.perceivedUsefulness}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={tam.perceivedUsefulness}
              onChange={(e) => handleSliderChange("perceivedUsefulness", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-[10px] text-slate-400 font-medium">Triggered by: Biometric Quick Checkout, Real-time SMS confirmation</span>
          </div>

          {/* Perceived Ease of Use */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Perceived Ease of Use (PEOU)
                <span className="text-slate-400 font-normal hover:text-emerald-600 cursor-help" title="Effort Expectancy. Simple navigation, friction-free registration, instant login via device fingerprint.">
                  <HelpCircle className="w-3 h-3" />
                </span>
              </label>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/50 px-1.5 py-0.5 rounded">{tam.perceivedEaseOfUse}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={tam.perceivedEaseOfUse}
              onChange={(e) => handleSliderChange("perceivedEaseOfUse", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[10px] text-slate-400 font-medium">Triggered by: Fingerprint Login, Autocomplete checkout forms</span>
          </div>

          {/* Social Influence */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Social Influence (SI)
                <span className="text-slate-400 font-normal hover:text-emerald-600 cursor-help" title="Peer recommendations, Trust reviews, security certificates, brand trust badges.">
                  <HelpCircle className="w-3 h-3" />
                </span>
              </label>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200/50 px-1.5 py-0.5 rounded">{tam.socialInfluence}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={tam.socialInfluence}
              onChange={(e) => handleSliderChange("socialInfluence", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <span className="text-[10px] text-slate-400 font-medium">Triggered by: Security Trust Badges, SSL Locks, Customer Reviews</span>
          </div>

          {/* Facilitating Conditions */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Facilitating Conditions (FC)
                <span className="text-slate-400 font-normal hover:text-emerald-600 cursor-help" title="Device hardware support, multi-platform performance, cross-browser biometric stability.">
                  <HelpCircle className="w-3 h-3" />
                </span>
              </label>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200/50 px-1.5 py-0.5 rounded">{tam.facilitatingConditions}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={tam.facilitatingConditions}
              onChange={(e) => handleSliderChange("facilitatingConditions", Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <span className="text-[10px] text-slate-400 font-medium">Triggered by: Responsive design, reliable server uptime</span>
          </div>
        </div>

        {/* SVG Diagram and Adoption Stats */}
        <div className="flex flex-col justify-between">
          {/* Static SVG representation with interactive line widths */}
          <div className="flex-1 bg-[#0F172A] rounded-xl p-4 flex items-center justify-center border border-slate-800 min-h-[220px] shadow-inner">
            <svg viewBox="0 0 450 200" className="w-full h-full max-w-[380px]">
              {/* Nodes definitions */}
              {/* PU */}
              <rect x="10" y="10" width="80" height="30" rx="4" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1.5" />
              <text x="50" y="28" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">Perceived PU</text>

              {/* PEOU */}
              <rect x="10" y="75" width="80" height="30" rx="4" fill="#6366f1" fillOpacity="0.1" stroke="#6366f1" strokeWidth="1.5" />
              <text x="50" y="93" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">Perceived PEOU</text>

              {/* Social Influence */}
              <rect x="10" y="140" width="80" height="30" rx="4" fill="#a855f7" fillOpacity="0.1" stroke="#a855f7" strokeWidth="1.5" />
              <text x="50" y="158" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">Social Influence</text>

              {/* FC */}
              <rect x="180" y="140" width="80" height="30" rx="4" fill="#14b8a6" fillOpacity="0.1" stroke="#14b8a6" strokeWidth="1.5" />
              <text x="220" y="158" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">Facilitating Cond.</text>

              {/* Behavioral Intention (BI) */}
              <rect x="180" y="40" width="90" height="40" rx="6" fill="#f43f5e" fillOpacity="0.1" stroke="#f43f5e" strokeWidth="2" />
              <text x="225" y="60" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">Behavioral Intention</text>
              <text x="225" y="73" fill="#f43f5e" fontSize="10" textAnchor="middle" fontWeight="bold">{behavioralIntention}%</text>

              {/* Actual Usage (AU) */}
              <rect x="340" y="55" width="90" height="50" rx="6" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="2" />
              <text x="385" y="80" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">Actual System Use</text>
              <text x="385" y="96" fill="#10b981" fontSize="12" textAnchor="middle" fontWeight="bold">{actualUsage}%</text>

              {/* Path Arrows / Lines with dynamic stroke widths */}
              {/* PU -> BI */}
              <path d="M 90 25 L 180 50" stroke="#10b981" strokeWidth={1 + (tam.perceivedUsefulness / 25)} strokeDasharray="3" fill="none" opacity="0.8" />
              {/* PEOU -> BI */}
              <path d="M 90 90 L 180 65" stroke="#6366f1" strokeWidth={1 + (tam.perceivedEaseOfUse / 25)} strokeDasharray="3" fill="none" opacity="0.8" />
              {/* PEOU -> PU */}
              <path d="M 50 75 L 50 40" stroke="#6366f1" strokeWidth={1 + (tam.perceivedEaseOfUse / 30)} strokeDasharray="1" fill="none" opacity="0.5" />
              {/* SI -> BI */}
              <path d="M 90 155 L 220 80" stroke="#a855f7" strokeWidth={1 + (tam.socialInfluence / 25)} strokeDasharray="3" fill="none" opacity="0.8" />
              {/* BI -> AU */}
              <path d="M 270 60 L 340 75" stroke="#f43f5e" strokeWidth={1 + (behavioralIntention / 20)} fill="none" opacity="0.9" />
              {/* FC -> AU */}
              <path d="M 260 155 L 385 105" stroke="#14b8a6" strokeWidth={1 + (tam.facilitatingConditions / 25)} strokeDasharray="3" fill="none" opacity="0.8" />
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <span className="font-semibold text-slate-700 block">Behavioral Intention</span>
              <p className="mt-1 font-mono text-sm font-bold text-slate-900">{behavioralIntention}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Strength of customer's conscious intent to use SmartTrade.</p>
            </div>
            <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-200/50">
              <span className="font-semibold text-emerald-800 block">Actual System Adoption</span>
              <p className="mt-1 font-mono text-sm font-bold text-emerald-900">{actualUsage}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Likelihood of long-term transaction acceptance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
