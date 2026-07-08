import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, ShieldCheck, Cpu, Users, BookOpen, 
  Activity, ArrowRight, HelpCircle, FileText, Download, GraduationCap
} from "lucide-react";
import { Product, TelemetryData, User } from "./types.ts";
import MobileApp from "./components/MobileApp.tsx";
import TelemetryPanel from "./components/TelemetryPanel.tsx";
import AdminPanel from "./components/AdminPanel.tsx";
import TAMPanel from "./components/TAMPanel.tsx";
import AcademicReport from "./components/AcademicReport.tsx";

export default function App() {
  // Global App State
  const [products, setProducts] = useState<Product[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingTelemetry, setLoadingTelemetry] = useState(true);

  // Simulated client integrity environment ('healthy' | 'unverified' | 'compromised')
  // This value is appended to header requests from the client to enforce TCP rules
  const [clientIntegrity, setClientIntegrity] = useState<"healthy" | "unverified" | "compromised">("healthy");

  // Admin Session State
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("smarttrade_admin_token"));
  const [adminUser, setAdminUser] = useState<any | null>(null);

  // Customer Session State
  const [customerUser, setCustomerUser] = useState<User | null>(null);

  // Dashboard Active Navigation Tab: "telemetry" | "admin" | "tam" | "paper"
  const [activeTab, setActiveTab] = useState<"telemetry" | "admin" | "tam" | "paper">("telemetry");

  // Fetch product inventory
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to load products inventory catalog", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch security platform telemetry & alert feed
  const fetchTelemetry = async () => {
    setLoadingTelemetry(true);
    try {
      const res = await fetch("/api/platform/telemetry");
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error("Failed to fetch security telemetry status", err);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTelemetry();
  }, []);

  // Update telemetry and log lists on key events (checkouts, logins, etc.)
  const triggerLogRefresh = () => {
    fetchTelemetry();
  };

  const handleAdminLogin = (token: string, user: any) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem("smarttrade_admin_token", token);
    fetchTelemetry();
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem("smarttrade_admin_token");
    fetchTelemetry();
  };

  const handleCustomerLogin = (token: string, user: User) => {
    setCustomerUser(user);
  };

  const handleCustomerLogout = () => {
    setCustomerUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      
      {/* Platform Professional Header Banner */}
      <header className="bg-[#0F172A] text-white px-6 py-4 shadow-md border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-sans tracking-tight text-white">SmartTrade Africa Ltd</h1>
                <span className="bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Academic Prototype Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full-Stack E-Commerce Trust Architecture & TPM Attestation Lab — Trust Management in E-Commerce (428)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 font-medium">Selected Lab State:</span>
            <span className={`inline-flex items-center gap-1 font-semibold ${
              clientIntegrity === "healthy" 
                ? "text-emerald-400" 
                : clientIntegrity === "unverified" 
                ? "text-amber-400" 
                : "text-rose-400"
            }`}>
              {clientIntegrity === "healthy" && (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Healthy Operating State
                </>
              )}
              {clientIntegrity === "unverified" && (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Unsigned Firmware State
                </>
              )}
              {clientIntegrity === "compromised" && (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Compromised / Rooted State
                </>
              )}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: INTERACTIVE MOBILE SMARTPHONE PREVIEW BEZEL (Lg: 5/12 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 p-4 md:p-8 shadow-sm shadow-slate-100/50">
          <div className="text-center mb-4 space-y-1">
            <span className="text-xs uppercase tracking-widest font-bold text-slate-400 block">Mobile Application Preview</span>
            <p className="text-[11px] text-slate-500 leading-normal max-w-[280px]">
              Click inside the simulated phone mockup to register, log in, browse products, or purchase.
            </p>
          </div>

          {/* iOS / Android Physical styled Bezel mockup */}
          <div className="relative w-[310px] sm:w-[325px] h-[640px] rounded-[42px] border-[10px] border-slate-900 bg-slate-950 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
            
            {/* Top Speaker and Notch cutout */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4.5 bg-slate-900 rounded-b-xl z-50 flex items-center justify-center">
              <span className="w-10 h-1 bg-slate-800 rounded-full block"></span>
            </div>

            {/* Simulated Glass Reflection effect Overlay (non-blocking) */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10 z-40"></div>

            {/* The E-Commerce App running inside */}
            <div className="flex-1 w-full h-full bg-slate-50 flex flex-col">
              <MobileApp
                user={customerUser}
                onLoginSuccess={handleCustomerLogin}
                onLogoutSuccess={handleCustomerLogout}
                products={products}
                clientIntegrity={clientIntegrity}
                triggerLogRefresh={triggerLogRefresh}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: UTILITY CONTROL CENTER (Lg: 7/12 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Section tab buttons */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner shrink-0 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold text-center cursor-pointer transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === "telemetry" 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-500" />
              TPM Telemetry
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold text-center cursor-pointer transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === "admin" 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
              }`}
            >
              <Users className="w-4 h-4 text-emerald-500" />
              Admin Console
            </button>
            <button
              onClick={() => setActiveTab("tam")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold text-center cursor-pointer transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === "tam" 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-500" />
              TAM Simulator
            </button>
            <button
              onClick={() => setActiveTab("paper")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold text-center cursor-pointer transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === "paper" 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Academic Report
            </button>
          </div>

          {/* Active Panel View */}
          <div className="flex-1 flex flex-col justify-stretch">
            {activeTab === "telemetry" && (
              <TelemetryPanel
                telemetry={telemetry}
                clientIntegrity={clientIntegrity}
                setClientIntegrity={setClientIntegrity}
                loading={loadingTelemetry}
              />
            )}

            {activeTab === "admin" && (
              <AdminPanel
                token={adminToken}
                onAdminLogin={handleAdminLogin}
                onAdminLogout={handleAdminLogout}
                products={products}
                refreshProducts={fetchProducts}
                clientIntegrity={clientIntegrity}
              />
            )}

            {activeTab === "tam" && (
              <TAMPanel />
            )}

            {activeTab === "paper" && (
              <AcademicReport />
            )}
          </div>
        </div>
      </main>

      {/* Trust Platform Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>SmartTrade Africa Ltd. © 2026. Academic Study Interface for E-Commerce Trust & Security.</span>
          <div className="flex gap-4">
            <a href="#rules" className="hover:underline hover:text-emerald-600 font-semibold text-slate-600">FIDO2 WebAuthn Specs</a>
            <span>•</span>
            <a href="#tpm" className="hover:underline hover:text-emerald-600 font-semibold text-slate-600">ISO/IEC 11889 TPM 2.0</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
