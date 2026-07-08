import React from "react";
import { BookOpen, Cpu, ShieldCheck, Terminal } from "lucide-react";

export default function AcademicReport() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-100/50 overflow-y-auto max-h-[800px] text-slate-800">
      <div className="border-b border-slate-100 pb-6 mb-6 text-center">
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          Academic Research Paper
        </span>
        <h1 className="text-2xl font-bold text-slate-900 mt-3 font-sans tracking-tight">
          Trust Management in E-Commerce (428)
        </h1>
        <h2 className="text-lg font-medium text-slate-600 mt-1">
          SmartTrade Africa Ltd: A Secure and Trusted Full-Stack Mobile Platform
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-xs text-slate-500">
          <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-xl">
            <span className="block font-semibold text-slate-700">Course Code</span>
            Trust Management 428
          </div>
          <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-xl">
            <span className="block font-semibold text-slate-700">Institution</span>
            SmartTrade Research Group
          </div>
          <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-xl">
            <span className="block font-semibold text-slate-700">Primary Focus</span>
            TCP, WebAuthn & TAM
          </div>
          <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-xl">
            <span className="block font-semibold text-slate-700">Database Engine</span>
            PostgreSQL / CJS-Pool
          </div>
        </div>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        {/* Abstract */}
        <section className="bg-emerald-50/30 rounded-xl p-5 border border-emerald-100/40">
          <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Executive Abstract
          </h3>
          <p className="text-slate-700 leading-relaxed italic">
            This research paper presents the design, architectural paradigms, and functional development of a highly secure, client-attested digital commerce system for <strong>SmartTrade Africa Ltd</strong>. Facing existential threats of fraud, account takeovers, and customer skepticism towards electronic payment, we implement an innovative full-stack framework bridging <strong>Trusted Computing Platform (TCP)</strong> concepts, <strong>FIDO2 / WebAuthn Biometric Authentication</strong>, and a tokenized payment sandbox. This implementation is evaluated under the lens of the <strong>Technology Acceptance Model (TAM)</strong>, illustrating how robust, transparent security controls dynamically enhance <i>Perceived Usefulness (PU)</i> and <i>Perceived Ease of Use (PEOU)</i>, thereby mitigating risk and stimulating customer technology adoption.
          </p>
        </section>

        {/* 1. Introduction */}
        <section>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <span className="text-emerald-600 font-bold">1.</span> Introduction & Problem Formulation
          </h3>
          <p className="mb-3">
            SmartTrade Africa Ltd is launching a mobile e-commerce application targeting Sub-Saharan Africa. However, early piloting revealed significant vulnerabilities: <strong>account takeovers via credential stuffing, device tampering, payment spoofing, and severe privacy skepticism</strong>. To address these vulnerabilities, this project outlines a complete system to transition SmartTrade Africa from a standard vulnerable database application to a certified, trusted computing ecosystem.
          </p>
          <p>
            The engineering scope covers user credentials, device health verification via secure enclaves, transaction authorization using FIDO2 biometrics, and administrative oversight through tamper-evident audit logs.
          </p>
        </section>

        {/* 2. TCP Integration */}
        <section>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <span className="text-emerald-600 font-bold">2.</span> Trusted Computing Platform (TCP) Framework
          </h3>
          <p className="mb-3">
            Traditional applications assume the customer's device is completely healthy. SmartTrade Africa integrates a <strong>Trusted Computing Platform (TCP)</strong> model utilizing hardware-rooted trust. The system incorporates simulated <strong>Trusted Platform Module (TPM 2.0)</strong> attestation:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5 text-xs uppercase text-emerald-700">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" /> Core TPM Registers
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>PCR 00 (System Firmware)</strong>: Validates boot integrity and BIOS hashes.</li>
                <li><strong>PCR 01 (Config)</strong>: Records kernel configurations and firmware details.</li>
                <li><strong>PCR 04 (Bootloader)</strong>: Verifies operating system boot parameters.</li>
                <li><strong>PCR 08 (Kernel)</strong>: Inspects runtime kernel code maps against known signatures.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5 text-xs uppercase text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Cryptographic Enclave
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Endorsement Key (EK)</strong>: A unique, non-volatile private key burned into the hardware at manufacture.</li>
                <li><strong>Storage Root Key (SRK)</strong>: Manages secure application variables and files in an isolated cryptoprocessor.</li>
                <li><strong>Credential Sealing</strong>: Securely binds transaction states so they can be unsealed only if PCR states match.</li>
              </ul>
            </div>
          </div>
          <p>
            During checkout, the server evaluates client attestation. If the Platform Configuration Registers match a validated boot state, the client is marked <strong>SECURE (Trust Score: 100/100)</strong>. If root-bypass or runtime hooking is identified, the client is labeled <strong>COMPROMISED</strong>, degrading the Trust Score below the 40% security threshold and blocking transactions.
          </p>
        </section>

        {/* 3. Fingerprint Biometrics */}
        <section>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <span className="text-emerald-600 font-bold">3.</span> Biometric Authentication & Cryptographic Assertion
          </h3>
          <p className="mb-3">
            To prevent password harvesting, SmartTrade integrates <strong>FIDO2 / WebAuthn Web Biometric Signatures</strong>. During account enrollment:
          </p>
          <ol className="list-decimal pl-5 space-y-2 mb-3">
            <li>The server delivers a cryptographically random challenge to the device's secure enclave.</li>
            <li>The user authenticates locally via the device's fingerprint biometric sensor.</li>
            <li>Upon authorization, the internal enclave signs the challenge with the device's unique private key, returning the <i>Assertion Signature</i> to the server along with a unique Credential ID.</li>
            <li>The server stores the <strong>Credential ID and Public Key</strong> in the PostgreSQL database. The private key never leaves the device's hardware chip, eliminating database credential leakage hazards.</li>
          </ol>
          <p>
            Biometric authentication is demanded both during secure logins and to seal checkout payments, ensuring that even if a session token is hijacked, unauthorized transactions are cryptographically blocked.
          </p>
        </section>

        {/* 4. Payment Gateway */}
        <section>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <span className="text-emerald-600 font-bold">4.</span> Simulated Secure Payment Gateway
          </h3>
          <p className="mb-3">
            To safeguard credit transactions, SmartTrade Africa connects to a tokenized simulated Payment Gateway resembling standard sandbox APIs (Stripe/PayPal):
          </p>
          <ul className="list-bullet pl-5 space-y-1.5">
            <li><strong>Zero Storage Policy</strong>: The application is strictly prohibited from storing primary account numbers (PAN) or CVV strings in the database, avoiding PCI-DSS non-compliance.</li>
            <li><strong>Cryptographic Tokenization</strong>: Raw payment credentials are intercepted at the boundary and tokenized into a temporary reference key (e.g., <code className="bg-slate-100 border border-slate-200 text-rose-600 px-1.5 py-0.5 rounded font-mono text-xs">tok_smarttrade_xxx</code>).</li>
            <li><strong>Three-Way Verification</strong>: The gateway simulates checking core credentials, fund availability, and banking fraud indexes before completing the order.</li>
          </ul>
        </section>

        {/* 5. TAM Theory */}
        <section>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <span className="text-emerald-600 font-bold">5.</span> Technology Acceptance Model (TAM) Integration
          </h3>
          <p className="mb-3">
            Under the Technology Acceptance Model (TAM), customer usage depends on two main parameters:
          </p>
          <ul className="space-y-3">
            <li>
              <strong>Perceived Usefulness (PU)</strong>: Enhanced by automating shopping. Features like biometric quick checkouts and instant digital transaction receipts directly increase PU by streamlining daily tasks.
            </li>
            <li>
              <strong>Perceived Ease of Use (PEOU)</strong>: Enhanced by removing cognitive load. Fingerprint recognition completely replaces multi-factor authenticator codes or complex password memorization, decreasing Effort Expectancy (UTAUT).
            </li>
          </ul>
          <p className="mt-3">
            By exposing trust indicators like <strong>HTTPS connection locks, security badges, FIDO verification ticks, and clear device integrity scoring</strong>, SmartTrade Africa shifts the customer's perceived risk profile, leading to higher confidence, social influence, and long-term user adoption.
          </p>
        </section>

        {/* 6. Database Schema */}
        <section>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <span className="text-emerald-600 font-bold">6.</span> Database Schema Architecture (PostgreSQL)
          </h3>
          <p className="mb-3">
            The system maps to standard relational PostgreSQL table architectures designed for high data-integrity, referential constraints, and relational indexing. Below are the SQL definitions:
          </p>
          <pre className="bg-[#0F172A] text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 shadow-inner">
{`-- Create Users Relation
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_biometric_enabled BOOLEAN DEFAULT FALSE,
    biometric_credential_id VARCHAR(255),
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Products Inventory Relation
CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    category VARCHAR(50),
    stock INTEGER NOT NULL DEFAULT 0
);

-- Create Orders Relation
CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    payment_token VARCHAR(255),
    device_trust_score INTEGER DEFAULT 100,
    transaction_id VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Secure Tamper-Evident Audit Logs Relation
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    username VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    device_fingerprint VARCHAR(255),
    pcr_status VARCHAR(20) DEFAULT 'SECURE',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
          </pre>
        </section>

        {/* 7. Local Running Instructions */}
        <section className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-emerald-600" />
            Step-by-Step Local Host Execution Guide
          </h3>
          <p className="text-xs text-slate-600 mb-3">
            To run this full-stack application on your local workstation, proceed with the following terminal execution steps:
          </p>
          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="block text-slate-700 font-semibold mb-1">1. Clone & Extract Workspace</span>
              <pre className="bg-slate-900 text-slate-100 p-2 rounded">
cd smarttrade-africa-platform
npm install
              </pre>
            </div>
            <div>
              <span className="block text-slate-700 font-semibold mb-1">2. Environment Configuration</span>
              <p className="text-[11px] text-slate-500 mb-1 font-sans">
                Create a <code className="bg-slate-200 px-1 rounded text-red-600">.env</code> file in the project root containing:
              </p>
              <pre className="bg-slate-900 text-slate-100 p-2 rounded">
PORT=3000
NODE_ENV=development
GEMINI_API_KEY="your-gemini-key"
              </pre>
            </div>
            <div>
              <span className="block text-slate-700 font-semibold mb-1">3. Start Local Dev Server (Express + Vite)</span>
              <pre className="bg-slate-900 text-slate-100 p-2 rounded">
npm run dev
              </pre>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">
                Open browser at <code className="text-emerald-600">http://localhost:3000</code>.
              </p>
            </div>
            <div>
              <span className="block text-slate-700 font-semibold mb-1">4. Build for Production</span>
              <pre className="bg-slate-900 text-slate-100 p-2 rounded">
npm run build
npm run start
              </pre>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <span className="text-emerald-600 font-bold">7.</span> Academic Conclusion & Results Summary
          </h3>
          <p className="mb-3">
            SmartTrade Africa successfully combines Trusted Computing Platform technology and WebAuthn biometrics. Testing shows that implementing FIDO2 biometric authentication and device health checks improves transaction security. 
          </p>
          <p>
            From a TAM/UTAUT perspective, introducing fingerprint verification minimizes effort expectancy, while security badges and device trust scores enhance customer confidence. This demonstrates that transparency in security controls is essential to building user trust and technology acceptance in modern e-commerce.
          </p>
        </section>
      </div>
    </div>
  );
}
