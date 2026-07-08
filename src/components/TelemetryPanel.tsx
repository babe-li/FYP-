import React from "react";
import { Cpu, ShieldAlert, KeyRound, Radio, Shield, HelpCircle, Activity } from "lucide-react";
import { TelemetryData } from "../types.ts";

interface TelemetryProps {
  telemetry: TelemetryData | null;
  clientIntegrity: "healthy" | "unverified" | "compromised";
  setClientIntegrity: (val: "healthy" | "unverified" | "compromised") => void;
  loading: boolean;
}

export default function TelemetryPanel({ telemetry, clientIntegrity, setClientIntegrity, loading }: TelemetryProps) {
  if (loading || !telemetry) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-100/50 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Activity className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Querying hardware security enclaves...</p>
        </div>
      </div>
    );
  }

  // Get live status based on integrity toggle
  let computedTrustScore = 100;
  let statusText = "Active / Secure";
  let statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
  
  if (clientIntegrity === "compromised") {
    computedTrustScore = 40;
    statusText = "Compromised / Tampered";
    statusBadge = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (clientIntegrity === "unverified") {
    computedTrustScore = 70;
    statusText = "Unsigned Firmware Alert";
    statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-100/50 text-slate-800 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            TCP & TPM 2.0 Security Telemetry
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Monitor real-time cryptographic attestation keys, PCR boot status, and client node health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">TPM Status:</span>
          <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${statusBadge}`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Interactive Environment Mocker */}
      <div className="bg-[#0F172A] text-white rounded-xl p-5 border border-slate-800">
        <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
          Active Hardware Vulnerability Mocker (Academic Lab tool)
        </h3>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Simulate operating system states. Change this selection and observe how the SmartTrade mobile application immediately adjusts trust indicators, requires biometric assertion, or blocks checkout actions at the API gateway layer.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setClientIntegrity("healthy")}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer border ${
              clientIntegrity === "healthy"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white"
            }`}
          >
            ● Healthy Operating State
          </button>
          
          <button
            onClick={() => setClientIntegrity("unverified")}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer border ${
              clientIntegrity === "unverified"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white"
            }`}
          >
            ▲ Unsigned Kernel/Firmware
          </button>
          
          <button
            onClick={() => setClientIntegrity("compromised")}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer border ${
              clientIntegrity === "compromised"
                ? "bg-rose-600 text-white border-rose-500 shadow-sm animate-pulse"
                : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white"
            }`}
          >
            ■ Compromised / Rooted (TPM Fail)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TPM Cryptographic Registers */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <KeyRound className="w-4 h-4 text-emerald-600" /> Cryptographic Key Registers (Sealed State)
          </h3>
          
          <div className="space-y-2 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <span className="font-semibold text-slate-600 block">Endorsement Key (EK) Reference</span>
              <code className="text-[10px] text-emerald-600 font-mono select-all block mt-1 break-all bg-white border border-slate-200/50 p-1.5 rounded">
                {telemetry.tpmStatus.endorsementKeyHash}
              </code>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <span className="font-semibold text-slate-600 block">Storage Root Key (SRK) Reference</span>
              <code className="text-[10px] text-teal-600 font-mono select-all block mt-1 break-all bg-white border border-slate-200/50 p-1.5 rounded">
                {telemetry.tpmStatus.storageRootKeyHash}
              </code>
            </div>

            <div className="p-3 rounded-lg border bg-emerald-50/40 border-emerald-100">
              <span className="font-semibold text-emerald-900 block">TPM Chip Version</span>
              <p className="text-[11px] text-emerald-700 mt-1 font-mono">{telemetry.tpmStatus.chipVersion}</p>
            </div>
          </div>
        </div>

        {/* PCR Values */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Shield className="w-4 h-4 text-emerald-600" /> Platform Configuration Registers (PCR)
          </h3>
          
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200/60">
              <span className="font-bold text-slate-700 text-[10px]">PCR_00 (Firmware Hash)</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${clientIntegrity === "compromised" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                {clientIntegrity === "compromised" ? "TAMPERED_HASH" : "MATCH_GOLDEN"}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200/60">
              <span className="font-bold text-slate-700 text-[10px]">PCR_01 (System Config)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">MATCH_SECURE</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200/60">
              <span className="font-bold text-slate-700 text-[10px]">PCR_04 (Bootloader Signature)</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${clientIntegrity !== "healthy" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                {clientIntegrity !== "healthy" ? "UNSIGNED_FW" : "VERIFIED_LOADER"}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200/60">
              <span className="font-bold text-slate-700 text-[10px]">PCR_08 (Kernel Integrity)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">KERNEL_OK</span>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" /> Hardware Attestation Score
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Your simulated device registers calculate a hardware trustworthiness rating of <strong>{computedTrustScore}/100</strong>. At checkout, checkouts are cryptographically barred if the rating falls below 40%.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Security Log Stream */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" /> Platform Security Alert Stream (Live Logs)
        </h3>
        
        <div className="bg-[#0F172A] text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-900 overflow-y-auto max-h-[220px] space-y-2 shadow-inner">
          {telemetry.securityAlertFeed.length === 0 ? (
            <p className="text-slate-500 italic text-center py-4">No critical security occurrences recorded on enclave.</p>
          ) : (
            telemetry.securityAlertFeed.map((event, idx) => (
              <div key={idx} className="border-b border-slate-900 pb-2 last:border-b-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-slate-500">
                  <span>Timestamp: {new Date(event.timestamp).toLocaleTimeString()}</span>
                  <span className="bg-rose-900/40 text-rose-400 px-1 rounded uppercase tracking-widest font-bold text-[9px]">
                    Alert: {event.action}
                  </span>
                </div>
                <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">{event.details}</p>
                <div className="flex gap-4 mt-0.5 text-[9px] text-slate-500">
                  <span>IP: {event.ip}</span>
                  <span>Enclave ID: {event.fingerprint.substring(0, 16)}...</span>
                  <span className={event.status === "COMPROMISED" ? "text-rose-400 font-bold" : "text-emerald-400"}>
                    PCR: {event.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
