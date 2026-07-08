import React, { useState } from "react";
import { 
  ShoppingBag, Search, Shield, CreditCard, KeyRound, 
  User as UserIcon, Lock, Unlock, Mail, ArrowLeft, RefreshCw, 
  Plus, Minus, Check, Fingerprint, Trash, AlertTriangle, FileText
} from "lucide-react";
import { Product, CartItem, User } from "../types.ts";

interface MobileAppProps {
  user: User | null;
  onLoginSuccess: (token: string, user: User) => void;
  onLogoutSuccess: () => void;
  products: Product[];
  clientIntegrity: "healthy" | "unverified" | "compromised";
  triggerLogRefresh: () => void;
}

export default function MobileApp({ user, onLoginSuccess, onLogoutSuccess, products, clientIntegrity, triggerLogRefresh }: MobileAppProps) {
  // Navigation: "welcome" | "register" | "recover" | "home" | "profile"
  const [screen, setScreen] = useState<"welcome" | "register" | "recover" | "home" | "profile">(user ? "home" : "welcome");
  
  // Auth Form State
  const [loginUser, setLoginUser] = useState("customer1");
  const [loginPass, setLoginPass] = useState("customer123");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Register Form State
  const [regUser, setRegUser] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  // Recover Form State
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverStep, setRecoverStep] = useState<1 | 2>(1);
  const [recoverySentCode, setRecoverySentCode] = useState("");
  const [recoveryCodeInput, setRecoveryCodeInput] = useState("");
  const [recoverUserId, setRecoverUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState("");

  // Biometric login trigger state
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricScanSuccess, setBiometricScanSuccess] = useState<boolean | null>(null);

  // Store active Token locally for application requests
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem("smarttrade_cust_token"));

  // E-Commerce UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Checkout Modal State
  const [checkoutStep, setCheckoutStep] = useState<"form" | "biometric" | "processing" | "receipt" | "error">("form");
  const [shippingAddress, setShippingAddress] = useState("12 Main Street, Nairobi");
  const [cardNumber, setCardNumber] = useState("4000 1234 5678 9010");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [checkoutError, setCheckoutError] = useState("");
  const [receiptDetails, setReceiptDetails] = useState<any | null>(null);

  // Filters & Categories
  const categories = ["All", "Mobile Phones", "Security Hardware", "Payment Security", "Computers", "Storage Security"];
  
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Cart metrics
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Manage Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const index = prev.findIndex((item) => item.product.id === product.id);
      if (index >= 0) {
        const updated = [...prev];
        if (updated[index].quantity < product.stock) {
          updated[index].quantity += 1;
        }
        return updated;
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const index = prev.findIndex((item) => item.product.id === productId);
      if (index === -1) return prev;
      const updated = [...prev];
      updated[index].quantity += delta;
      if (updated[index].quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return updated;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // ==========================================
  // CUSTOMER AUTH INTERACTIONS
  // ==========================================

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-client-integrity": clientIntegrity
        },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      const data = await res.json();
      setAuthLoading(false);
      
      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        triggerLogRefresh();
        return;
      }
      
      setAuthToken(data.token);
      localStorage.setItem("smarttrade_cust_token", data.token);
      onLoginSuccess(data.token, data.user);
      setScreen("home");
      triggerLogRefresh();
    } catch (err) {
      setAuthLoading(false);
      setAuthError("Auth communication failure");
    }
  };

  // Biometric assertion simulation (Login flow)
  const handleBiometricLogin = async () => {
    setAuthError("");
    setBiometricScanning(true);
    setBiometricScanSuccess(null);
    
    try {
      // Step 1: Challenge
      const challRes = await fetch("/api/auth/biometric/challenge", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-client-integrity": clientIntegrity
        },
        body: JSON.stringify({ username: loginUser })
      });
      const challData = await challRes.json();
      
      if (!challRes.ok) {
        setAuthError(challData.error || "FIDO2 credential matching failed");
        setBiometricScanning(false);
        triggerLogRefresh();
        return;
      }

      // Step 2: Simulate physical hardware sensor scan
      setTimeout(async () => {
        // Biometrics fail if client is root-compromised (hardware attestation constraint)
        if (clientIntegrity === "compromised") {
          setBiometricScanSuccess(false);
          setTimeout(() => {
            setBiometricScanning(false);
            setAuthError("TPM hardware error: Biometric enclave unsealed status failed due to client tampering.");
            triggerLogRefresh();
          }, 1500);
          return;
        }

        setBiometricScanSuccess(true);
        
        // Step 3: Verify Assertion signature
        setTimeout(async () => {
          try {
            const verifyRes = await fetch("/api/auth/biometric/verify", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "x-client-integrity": clientIntegrity
              },
              body: JSON.stringify({
                userId: challData.userId,
                challenge: challData.challenge,
                assertionSignature: `sig_assertion_${Math.random().toString(36).substring(2)}_signed_enclave`
              })
            });
            const verifyData = await verifyRes.json();
            setBiometricScanning(false);
            
            if (!verifyRes.ok) {
              setAuthError(verifyData.error || "WebAuthn cryptographic verification failed.");
              triggerLogRefresh();
              return;
            }

            setAuthToken(verifyData.token);
            localStorage.setItem("smarttrade_cust_token", verifyData.token);
            onLoginSuccess(verifyData.token, verifyData.user);
            setScreen("home");
            triggerLogRefresh();
          } catch (err) {
            setBiometricScanning(false);
            setAuthError("Crypto verification communication error");
          }
        }, 1000);

      }, 2000);

    } catch (err) {
      setBiometricScanning(false);
      setAuthError("Failed to issue FIDO2 credentials challenge");
    }
  };

  // Register user account
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setRegSuccess("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-client-integrity": clientIntegrity
        },
        body: JSON.stringify({ username: regUser, email: regEmail, password: regPass })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Registration failed");
        triggerLogRefresh();
        return;
      }
      setRegSuccess("Account successfully generated! Please log in.");
      setRegUser("");
      setRegEmail("");
      setRegPass("");
      setTimeout(() => {
        setScreen("welcome");
        setLoginUser(regUser);
      }, 2000);
      triggerLogRefresh();
    } catch (err) {
      setAuthError("Registration server communication failure");
    }
  };

  // Password Recovery step 1: Request
  const handleRecoverRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-client-integrity": clientIntegrity
        },
        body: JSON.stringify({ email: recoverEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Email not verified");
        triggerLogRefresh();
        return;
      }
      setRecoverySentCode(data.debugToken || "A48F");
      setRecoverUserId(data.userId || "");
      setRecoverStep(2);
      triggerLogRefresh();
    } catch (err) {
      setAuthError("Connection error during key recovery dispatch");
    }
  };

  // Password Recovery step 2: Commit Reset
  const handleRecoverReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setRecoverySuccess("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-integrity": clientIntegrity
        },
        body: JSON.stringify({
          userId: recoverUserId,
          newPassword,
          recoveryCode: recoveryCodeInput,
          debugToken: recoverySentCode
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Verification failed");
        triggerLogRefresh();
        return;
      }
      setRecoverySuccess("Credentials reset successful. Please log in.");
      setTimeout(() => {
        setScreen("welcome");
        setRecoverStep(1);
        setRecoverEmail("");
        setNewPassword("");
        setRecoveryCodeInput("");
      }, 2000);
      triggerLogRefresh();
    } catch (err) {
      setAuthError("Failed to update passwords");
    }
  };

  // FIDO2 Fingerprint enrollment (Profile settings)
  const handleEnrollBiometrics = async (checked: boolean) => {
    if (!authToken) return;
    setAuthError("");

    if (!checked) {
      // Disable biometrics
      try {
        const res = await fetch("/api/auth/biometric/disable", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${authToken}`,
            "x-client-integrity": clientIntegrity
          }
        });
        if (res.ok) {
          const updatedUser = { ...user!, isBiometricEnabled: false };
          onLoginSuccess(authToken, updatedUser); // Update state in App
          triggerLogRefresh();
        }
      } catch (err) {
        console.error("Failed to disable biometrics");
      }
      return;
    }

    // Enroll biometrics
    setBiometricScanning(true);
    setBiometricScanSuccess(null);

    // Simulate touch sensor scan to generate public key
    setTimeout(async () => {
      if (clientIntegrity === "compromised") {
        setBiometricScanSuccess(false);
        setTimeout(() => {
          setBiometricScanning(false);
          alert("TPM enrollment error: Integrity check failed. Cannot enroll biometrics on a compromised client state.");
          triggerLogRefresh();
        }, 1500);
        return;
      }

      setBiometricScanSuccess(true);
      
      setTimeout(async () => {
        try {
          const res = await fetch("/api/auth/biometric/enable", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`,
              "x-client-integrity": clientIntegrity
            },
            body: JSON.stringify({
              credentialId: `fido_cred_${Math.random().toString(36).substring(2, 10)}_smarttrade`,
              publicKey: `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv39rS47E8V${Math.random().toString(36).substring(2, 30)}`
            })
          });
          const data = await res.json();
          setBiometricScanning(false);
          
          if (!res.ok) {
            setAuthError(data.error || "Biometric enrollment rejected");
            triggerLogRefresh();
            return;
          }

          onLoginSuccess(authToken, data.user); // Update client session
          triggerLogRefresh();
        } catch (err) {
          setBiometricScanning(false);
          setAuthError("Failed to complete biometric register");
        }
      }, 1000);

    }, 2000);
  };

  // Secure Sign out
  const handleLogout = async () => {
    if (!authToken) return;
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${authToken}`,
          "x-client-integrity": clientIntegrity
        }
      });
    } catch (err) {
      console.error("Server logout alert omitted");
    }
    
    setAuthToken(null);
    localStorage.removeItem("smarttrade_cust_token");
    onLogoutSuccess();
    setCart([]);
    setShowCart(false);
    setScreen("welcome");
    triggerLogRefresh();
  };

  // ==========================================
  // E-COMMERCE TRANSACTION ACTIONS
  // ==========================================

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    setShowCart(false);
    setCheckoutError("");
    setReceiptDetails(null);
    
    // Step decision: if user has biometrics enabled, require fingerprint authorization
    if (user?.isBiometricEnabled) {
      setCheckoutStep("biometric");
    } else {
      setCheckoutStep("form");
    }
  };

  // Trigger fingerprint sensor to authorize payment
  const handleBiometricPaymentSign = () => {
    setBiometricScanning(true);
    setBiometricScanSuccess(null);

    setTimeout(async () => {
      if (clientIntegrity === "compromised") {
        setBiometricScanSuccess(false);
        setTimeout(() => {
          setBiometricScanning(false);
          setCheckoutStep("error");
          setCheckoutError("Security Enclave Failure: Your biometric assertion was aborted because the platform's PCR configurations show system modification.");
          triggerLogRefresh();
        }, 1500);
        return;
      }

      setBiometricScanSuccess(true);
      setTimeout(() => {
        setBiometricScanning(false);
        setCheckoutStep("form"); // Proceed to fill payment cards once biometric authorized
      }, 1000);

    }, 2000);
  };

  // Process payment transaction payload to API
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep("processing");
    setCheckoutError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "x-client-integrity": clientIntegrity
        },
        body: JSON.stringify({
          cartItems: cart.map((item) => ({ productId: item.product.id, name: item.product.name, quantity: item.quantity })),
          paymentMethod,
          paymentDetails: {
            cardNumber,
            shippingAddress
          },
          biometricVerified: user?.isBiometricEnabled || false
        })
      });
      const data = await res.json();
      triggerLogRefresh();

      if (!res.ok) {
        setCheckoutStep("error");
        setCheckoutError(data.error || "Checkout rejected");
        return;
      }

      setReceiptDetails(data.order);
      setCart([]); // Clear cart
      setCheckoutStep("receipt");
    } catch (err) {
      setCheckoutStep("error");
      setCheckoutError("Secure Payment server offline");
    }
  };

  // Determine TPM integrity score badge for browser header
  let tpmTrustScore = "100%";
  let tpmColor = "text-emerald-500";
  if (clientIntegrity === "compromised") {
    tpmTrustScore = "40%";
    tpmColor = "text-rose-500 animate-pulse font-bold";
  } else if (clientIntegrity === "unverified") {
    tpmTrustScore = "70%";
    tpmColor = "text-amber-500";
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none overflow-hidden relative">
      
      {/* 1. Mobile Phone Mockup Top Notch/Bar */}
      <div className="bg-slate-900 text-white px-4 py-1.5 flex justify-between items-center text-[10px] z-10 font-mono">
        <span className="font-semibold tracking-tighter">9:41 📡 SmartTrade Africa</span>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-0.5" title="Hardware TPM connection health score">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className={tpmColor}>TPM: {tpmTrustScore}</span>
          </span>
          <span className="w-4 h-2 border border-white rounded-sm relative flex items-center p-0.5">
            <span className="w-2.5 h-full bg-white block"></span>
          </span>
        </div>
      </div>

      {/* 2. Customer Application Header */}
      {screen !== "welcome" && screen !== "register" && screen !== "recover" && (
        <header className="bg-white border-b border-slate-200/80 px-4 py-3 flex justify-between items-center shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white p-1 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <span className="font-bold text-slate-900 tracking-tight text-sm font-sans">SmartTrade</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Nav controls */}
            {screen === "home" ? (
              <button
                onClick={() => setScreen("profile")}
                className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setScreen("home")}
                className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>
      )}

      {/* 3. Screen Views content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 relative">
        
        {/* ==================== A. WELCOME LOGIN SCREEN ==================== */}
        {screen === "welcome" && (
          <div className="h-full flex flex-col justify-center py-6 text-slate-800">
            <div className="text-center mb-6">
              <span className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-2xl inline-block text-emerald-600 mb-2.5 shadow-sm">
                <Shield className="w-7 h-7" />
              </span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">SmartTrade Africa</h1>
              <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed font-medium">
                Secure Mobile Banking & E-Commerce platform protected by hardware-rooted enclaves.
              </p>
            </div>

            {authError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 mb-4 leading-relaxed">
                {authError}
              </div>
            )}

            {regSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl p-3 mb-4">
                {regSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Customer Username</label>
                <input
                  type="text"
                  required
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-all"
                  placeholder="customer1"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Password</label>
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setScreen("recover"); setAuthError(""); }}
                  className="text-emerald-600 font-bold text-[11px] hover:underline cursor-pointer transition-all"
                >
                  Forgot your password?
                </button>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Unlock className="w-4 h-4 text-emerald-400" /> Sign In securely</>}
              </button>

              {/* Fingerprint Sign-in option */}
              <button
                type="button"
                onClick={handleBiometricLogin}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-2 transition-colors shadow-sm"
              >
                <Fingerprint className="w-4 h-4 text-emerald-600" /> Biometric Identity Unlock
              </button>
            </form>

            <div className="text-center mt-6 text-xs text-slate-500">
              No account?{" "}
              <button
                onClick={() => { setScreen("register"); setAuthError(""); }}
                className="text-emerald-600 font-bold hover:underline cursor-pointer transition-all"
              >
                Register Account
              </button>
            </div>
          </div>
        )}

        {/* ==================== B. REGISTER ACCOUNT SCREEN ==================== */}
        {screen === "register" && (
          <div className="h-full flex flex-col justify-center py-4 text-slate-800">
            <div className="mb-4">
              <button
                onClick={() => setScreen("welcome")}
                className="text-slate-500 hover:text-slate-900 cursor-pointer flex items-center gap-1 text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>

            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create SmartTrade Account</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Secure registration protected by SSL & encrypted hash.</p>
            </div>

            {authError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 mb-3">
                {authError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Select Username</label>
                <input
                  type="text"
                  required
                  value={regUser}
                  onChange={(e) => setRegUser(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-all"
                  placeholder="customer1"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Secure Email</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-all"
                  placeholder="customer@smarttrade.com"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Define Password</label>
                <input
                  type="password"
                  required
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-500 leading-normal font-medium">
                🔐 <strong>Technology Acceptance Note</strong>: Upon creation, you will be prompted to register your fingerprint credentials to bypass password entry.
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-2 transition-colors"
              >
                Create Secure Account
              </button>
            </form>
          </div>
        )}

        {/* ==================== C. PASSWORD RECOVERY SCREEN ==================== */}
        {screen === "recover" && (
          <div className="h-full flex flex-col justify-center py-4 text-gray-800">
            <div className="mb-4">
              <button
                onClick={() => { setScreen("welcome"); setRecoverStep(1); }}
                className="text-gray-500 hover:text-gray-900 cursor-pointer flex items-center gap-1 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cancel Recovery
              </button>
            </div>

            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-gray-900">Security Credentials Recovery</h2>
              <p className="text-xs text-gray-500 mt-0.5">Regain account access via secure dispatch protocol.</p>
            </div>

            {authError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl p-3 mb-3">
                {authError}
              </div>
            )}

            {recoverySuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl p-3 mb-3">
                {recoverySuccess}
              </div>
            )}

            {recoverStep === 1 ? (
              <form onSubmit={handleRecoverRequest} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-600 mb-1">Your Registered Email</label>
                  <input
                    type="email"
                    required
                    value={recoverEmail}
                    onChange={(e) => setRecoverEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="customer1@smarttradeafrica.com"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Dispatch Security Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleRecoverReset} className="space-y-4 text-xs">
                <div className="bg-amber-50 border border-amber-100 text-amber-800 p-3 rounded-lg leading-relaxed text-[10.5px]">
                  🔒 A recovery token has been simulated. For security research purposes, retrieve your verification code from the <strong>Security Incident Alert Feed</strong> or the developer terminal log: <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 font-bold font-mono">{recoverySentCode}</code>
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 mb-0.5">Enter Security Code</label>
                  <input
                    type="text"
                    required
                    value={recoveryCodeInput}
                    onChange={(e) => setRecoveryCodeInput(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="e.g. 5C38B"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 mb-0.5">Enter New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="New Secure Password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Verify and Commit Reset
                </button>
              </form>
            )}
          </div>
        )}

        {/* ==================== D. E-COMMERCE PRODUCTS SCREEN ==================== */}
        {screen === "home" && (
          <div className="space-y-4 text-xs">
            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Categories badge list */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar whitespace-nowrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white border border-slate-900"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 gap-3 pb-8">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-slate-400">No matching products found.</div>
              ) : (
                filteredProducts.map((prod) => (
                  <div key={prod.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm">
                    <div className="relative">
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-24 object-cover" />
                      <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                        Stock: {prod.stock}
                      </span>
                    </div>

                    <div className="p-2.5 space-y-1">
                      <h3 className="font-bold text-slate-900 line-clamp-1">{prod.name}</h3>
                      <p className="text-slate-400 text-[10px] line-clamp-2 leading-relaxed font-medium">{prod.description}</p>
                      
                      <div className="flex justify-between items-center pt-1.5">
                        <span className="text-sm font-extrabold text-slate-950">${prod.price}</span>
                        <button
                          onClick={() => addToCart(prod)}
                          disabled={prod.stock <= 0}
                          className={`p-1.5 rounded-lg cursor-pointer transition-all border ${
                            prod.stock <= 0
                              ? "bg-slate-100 text-slate-400 border-slate-200/50 cursor-not-allowed"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== E. USER PROFILE SETTINGS SCREEN ==================== */}
        {screen === "profile" && (
          <div className="space-y-5 text-xs text-slate-800">
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center space-y-1 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 border border-slate-200/60 rounded-full flex items-center justify-center mx-auto text-slate-600">
                <UserIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">{user?.username}</h3>
              <p className="text-slate-400 text-[10.5px] font-medium">{user?.email}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Role: {user?.role}</p>
            </div>

            {/* Hardware Biometric enrollment toggle */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block flex items-center gap-1">
                    <Fingerprint className="w-4 h-4 text-emerald-600" />
                    Biometric authentication
                  </span>
                  <span className="text-slate-400 text-[10px] leading-relaxed block max-w-[200px] font-medium">
                    Configure touch sensor fingerprint signature to skip passwords on checkout and login.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user?.isBiometricEnabled || false}
                    onChange={(e) => handleEnrollBiometrics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {user?.isBiometricEnabled && (
                <div className="border-t border-slate-100 pt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> WebAuthn / FIDO2 Public Key Enrolled.
                </div>
              )}
            </div>

            {/* Trust and Policy notice */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2 shadow-sm">
              <span className="font-bold text-slate-900 block flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-600" /> Privacy & Cryptographic Policy
              </span>
              <p className="text-slate-400 text-[10.5px] leading-relaxed font-medium">
                SmartTrade Africa Ltd stores your personal metrics locally on your device's isolated TPM secure cryptoprocessor. No raw fingerprints or payment credentials are ever uploaded or transmitted across insecure cloud connections.
              </p>
              <div className="pt-1.5">
                <a href="#policy" className="text-emerald-600 font-bold hover:underline flex items-center gap-1 text-[11px] transition-all">
                  <FileText className="w-3.5 h-3.5" /> Read full Privacy Pact
                </a>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl py-2.5 text-center cursor-pointer transition-colors"
            >
              Securely Sign Out
            </button>
          </div>
        )}

      </div>

      {/* ==========================================
      4. CART SLIDE-UP DRAWER
      ========================================== */}
      {showCart && (
        <div className="absolute inset-0 bg-black/60 z-30 flex flex-col justify-end">
          <div className="bg-white rounded-t-2xl max-h-[85%] flex flex-col overflow-hidden text-slate-800">
            <div className="px-4 py-3 border-b border-slate-200/80 flex justify-between items-center bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Shopping Basket</span>
              <button
                onClick={() => setShowCart(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition-all"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">Your basket is currently empty.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 max-w-[180px]">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-8 h-8 rounded object-cover" />
                      <div>
                        <span className="font-bold text-slate-900 block truncate">{item.product.name}</span>
                        <span className="text-slate-950 font-bold block">${item.product.price} each</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateCartQty(item.product.id, -1)}
                          className="px-1.5 py-1 text-slate-500 hover:bg-slate-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1.5 font-bold font-mono text-slate-900 text-[11px]">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.product.id, 1)}
                          className="px-1.5 py-1 text-slate-500 hover:bg-slate-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer p-1 transition-all"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-700">
                  <span>Subtotal Amount:</span>
                  <span className="text-base font-extrabold text-slate-950">${cartSubtotal}</span>
                </div>

                <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-[10px] text-slate-700 flex gap-2 font-medium">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>TPM Checkout Protection</strong>: SmartTrade checks device kernel parameters and hardware signature enclaves before payment.
                  </span>
                </div>

                <button
                  onClick={handleStartCheckout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-center font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-emerald-500/10"
                >
                  <CreditCard className="w-4 h-4" /> Proceed to Secure Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
      5. BIOMETRIC HARDWARE ENCLAVE SIMULATOR MODAL (DURING AUTH OR CHECKOUT)
      ========================================== */}
      {biometricScanning && (
        <div className="absolute inset-0 bg-black/85 z-50 flex items-center justify-center p-4 text-center">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 max-w-[280px] w-full space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              {biometricScanSuccess === null ? (
                <>
                  <Fingerprint className="w-16 h-16 text-indigo-500 animate-pulse" />
                  <span className="absolute inset-0 border-2 border-indigo-400 rounded-full animate-ping opacity-25"></span>
                </>
              ) : biometricScanSuccess === true ? (
                <Check className="w-16 h-16 text-emerald-500 bg-emerald-500/10 rounded-full p-2" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-rose-500 bg-rose-500/10 rounded-full p-2" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm tracking-tight">
                {biometricScanSuccess === null ? "WebAuthn Biometric Scan" : biometricScanSuccess === true ? "Assertion Authorized" : "Signature Rejected"}
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                {biometricScanSuccess === null 
                  ? "Verifying customer fingerprint credentials against sealed enclave public keys. Touch sensor now."
                  : biometricScanSuccess === true
                  ? "Cryptographic credential unsealed. Matching challenge signature verified."
                  : "TPM attestation failure. Operation blocked due to unsafe client firmware registers."
                }
              </p>
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              Enclave: FIDO2_L3_SECURE
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
      6. CHECKOUT FLOW MODAL
      ========================================== */}
      {checkoutStep !== "form" && !showCart && (
        (() => {
          // Only show when in active checkout modes
          if (checkoutStep === "biometric") {
            return (
              <div className="absolute inset-0 bg-white/95 z-40 flex flex-col justify-center p-6 text-center text-slate-800 space-y-4">
                <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Biometric Transaction Signature Required</h3>
                <p className="text-xs text-slate-500 max-w-[240px] mx-auto leading-relaxed font-medium">
                  As a trust and security control, authorize your payment of <strong>${cartSubtotal}</strong> using your registered FIDO2 fingerprint credentials.
                </p>
                <button
                  onClick={handleBiometricPaymentSign}
                  className="w-full max-w-[200px] mx-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 font-bold text-xs cursor-pointer flex items-center justify-center gap-1 transition-colors shadow-sm shadow-emerald-500/10"
                >
                  <Fingerprint className="w-4 h-4" /> Touch to Sign
                </button>
              </div>
            );
          }

          if (checkoutStep === "processing") {
            return (
              <div className="absolute inset-0 bg-white/95 z-40 flex flex-col justify-center items-center text-center text-slate-800">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
                <h3 className="font-bold text-sm text-slate-900">Processing Secure Transaction...</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px] font-medium">Tokenizing card details through Stripe simulated Gateway.</p>
              </div>
            );
          }

          if (checkoutStep === "receipt" && receiptDetails) {
            return (
              <div className="absolute inset-0 bg-white z-40 flex flex-col overflow-y-auto p-5 text-slate-800 space-y-4">
                <div className="text-center py-4 space-y-1 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                  <div className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-emerald-800 text-sm mt-2">Secure Payment Approved</h3>
                  <p className="text-[10px] text-emerald-600 font-mono">Reference: {receiptDetails.transactionId}</p>
                </div>

                <div className="space-y-2 text-xs border-b border-dashed border-slate-200 pb-4">
                  <span className="font-bold uppercase text-[10px] text-slate-400 block tracking-wider">Order Particulars</span>
                  <div className="space-y-1 font-mono text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Order ID:</span>
                      <span className="font-bold text-slate-900">{receiptDetails.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Client Trust Score:</span>
                      <span className="text-emerald-700 font-bold">{receiptDetails.deviceTrustScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sandbox Token:</span>
                      <span className="truncate max-w-[150px]">{receiptDetails.paymentToken}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-bold uppercase text-[10px] text-slate-400 block tracking-wider">Purchased Items</span>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                    {receiptDetails.items.map((it: any, index: number) => (
                      <div key={index} className="flex justify-between font-mono text-[10.5px]">
                        <span>{it.name} x {it.quantity}</span>
                        <span className="font-bold text-slate-900">${it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-semibold text-xs">
                  <span className="text-slate-700">Total Authorized Amount:</span>
                  <span className="text-sm font-extrabold text-slate-950">${receiptDetails.totalAmount}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-[10px] text-slate-500 leading-normal font-medium">
                  🌱 <strong>Safe Transaction Badge</strong>: Payments processed securely using tokenization. No sensitive billing records stored in local file-structures.
                </div>

                <button
                  onClick={() => setCheckoutStep("form")} // Reset back
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-center font-bold text-xs cursor-pointer transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            );
          }

          if (checkoutStep === "error") {
            return (
              <div className="absolute inset-0 bg-white/95 z-40 flex flex-col justify-center p-6 text-center text-slate-800 space-y-4">
                <div className="bg-rose-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-rose-600 border border-rose-100">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-rose-800 text-sm">Transaction Denied by Core Enclave</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {checkoutError}
                </p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-left space-y-1">
                  <span className="font-bold text-slate-700 text-[10.5px] block">Diagnosis recommendation:</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    This client device has virtual roots or hook variables enabled, lowering the <strong>TPM attestation registers below trust limits</strong>. Switch back to "Healthy Operating State" in the Telemetry tab to process.
                  </p>
                </div>
                <button
                  onClick={() => setCheckoutStep("form")}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2 font-bold text-xs cursor-pointer transition-colors"
                >
                  Adjust payment details
                </button>
              </div>
            );
          }

          return null;
        })()
      )}

      {/* Raw Checkout Payment Entry Form */}
      {checkoutStep === "form" && cart.length === 0 && receiptDetails === null && (
        // Reset when cart gets empty
        (() => { setCheckoutStep("form"); return null; })()
      )}

      {checkoutStep === "form" && cart.length > 0 && (
        <div className="absolute inset-0 bg-white z-40 flex flex-col p-5 overflow-y-auto text-slate-800 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5 text-slate-900">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Payment & Billing
            </h3>
            <button
              onClick={() => { setCheckoutStep("form"); setCart([]); }}
              className="text-[10.5px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
            >
              Abort
            </button>
          </div>

          <form onSubmit={handleProcessPayment} className="space-y-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Delivering To (Shipping Address)</label>
              <input
                type="text"
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Channel</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Credit Card")}
                  className={`py-2 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                    paymentMethod === "Credit Card"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  💳 Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PayPal Sandbox")}
                  className={`py-2 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                    paymentMethod === "PayPal Sandbox"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  🅿️ PayPal Sandbox
                </button>
              </div>
            </div>

            {paymentMethod === "Credit Card" && (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Card Number (Visa/Mastercard test)</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 transition-all"
                    placeholder="4000 1234 5678 9010"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      defaultValue="12/29"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CVV Security Code</label>
                    <input
                      type="password"
                      required
                      placeholder="•••"
                      defaultValue="123"
                      maxLength={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[10.5px]">
              <div className="flex justify-between text-slate-600">
                <span>Basket Items subtotal:</span>
                <span>${cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Secure Enclave Seal fee:</span>
                <span className="text-emerald-700 font-bold">FREE (FIDO)</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900 text-xs">
                <span>Aggregate Total:</span>
                <span className="text-slate-950 font-extrabold text-sm">${cartSubtotal}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-center font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 mt-2 transition-colors shadow-sm shadow-emerald-500/10"
            >
              <Shield className="w-4 h-4 text-emerald-200" /> Authorize & Pay ${cartSubtotal}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
