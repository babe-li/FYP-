import React, { useState, useEffect } from "react";
import { 
  Users, ClipboardList, PackagePlus, ShieldAlert, Key, 
  Trash2, Edit, Plus, Check, RefreshCw, LogIn, Lock, Mail, Eye, EyeOff
} from "lucide-react";
import { Product, AuditLog } from "../types.ts";

interface AdminProps {
  token: string | null;
  onAdminLogin: (token: string, adminUser: any) => void;
  onAdminLogout: () => void;
  products: Product[];
  refreshProducts: () => void;
  clientIntegrity: string;
}

export default function AdminPanel({ token, onAdminLogin, onAdminLogout, products, refreshProducts, clientIntegrity }: AdminProps) {
  // Login State
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Active Admin View State
  const [activeTab, setActiveTab] = useState<"logs" | "products" | "credentials">("logs");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);

  // Settings State
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");

  // Create Admin State
  const [createUsername, setCreateUsername] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [createError, setCreateError] = useState("");

  // Product CRUD state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    category: "Security Hardware",
    stock: 50
  });
  const [crudError, setCrudError] = useState("");
  const [crudSuccess, setCrudSuccess] = useState("");

  // Fetch security audit logs
  const fetchLogs = async () => {
    if (!token) return;
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/admin/logs", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "x-client-integrity": clientIntegrity
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Fetch admin accounts
  const fetchAdmins = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/accounts", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "x-client-integrity": clientIntegrity
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (err) {
      console.error("Failed to load admins", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLogs();
      fetchAdmins();
    }
  }, [token]);

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-client-integrity": clientIntegrity
        },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Authentication failed");
        return;
      }
      if (data.user.role !== "admin") {
        setLoginError("Access denied: Registered account is not an administrator");
        return;
      }
      onAdminLogin(data.token, data.user);
    } catch (err) {
      setLoginError("Failed to communicate with auth system");
    }
  };

  // Clear log trail history
  const handleClearLogs = async () => {
    if (!token || !window.confirm("Are you sure you want to purge all secure audit logs? This action is recorded.")) return;
    try {
      const res = await fetch("/api/admin/logs/clear", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "x-client-integrity": clientIntegrity
        }
      });
      if (res.ok) {
        fetchLogs();
      }
    } catch (err) {
      console.error("Failed to clear logs", err);
    }
  };

  // Change Admin Credentials
  const handleUpdateCredentials = async (e: React.FormEvent, targetAdminId?: string) => {
    e.preventDefault();
    setSettingsSuccess("");
    setSettingsError("");
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-client-integrity": clientIntegrity
        },
        body: JSON.stringify({
          email: newEmail || undefined,
          password: newPassword || undefined,
          targetAdminId
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setSettingsError(data.error || "Failed to update configurations");
        return;
      }
      setSettingsSuccess(data.message || "Configurations adjusted successfully!");
      setNewEmail("");
      setNewPassword("");
      fetchAdmins();
    } catch (err) {
      setSettingsError("Network error occurred");
    }
  };

  // Create another administrator
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccess("");
    setCreateError("");
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-client-integrity": clientIntegrity
        },
        body: JSON.stringify({
          username: createUsername,
          email: createEmail,
          password: createPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to provision profile");
        return;
      }
      setCreateSuccess(`Admin account '${createUsername}' created successfully!`);
      setCreateUsername("");
      setCreateEmail("");
      setCreatePassword("");
      fetchAdmins();
    } catch (err) {
      setCreateError("Network error occurred");
    }
  };

  // Product CRUD: Submit Action
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudError("");
    setCrudSuccess("");
    
    const isEdit = editingProductId !== null;
    const url = isEdit ? `/api/products/${editingProductId}` : "/api/products";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-client-integrity": clientIntegrity
        },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setCrudError(data.error || "Operation failed");
        return;
      }
      setCrudSuccess(`Product ${isEdit ? "updated" : "added"} successfully!`);
      setIsAddingProduct(false);
      setEditingProductId(null);
      setProductForm({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        category: "Security Hardware",
        stock: 50
      });
      refreshProducts();
    } catch (err) {
      setCrudError("Network error during inventory configuration");
    }
  };

  // Trigger Edit product form
  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      imageUrl: prod.imageUrl,
      category: prod.category,
      stock: prod.stock
    });
    setIsAddingProduct(true);
  };

  // Product CRUD: Delete Action
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Confirm deletion of this product from warehouse stock?")) return;
    setCrudError("");
    setCrudSuccess("");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "x-client-integrity": clientIntegrity
        }
      });
      if (res.ok) {
        setCrudSuccess("Product deleted successfully!");
        refreshProducts();
      } else {
        const data = await res.json();
        setCrudError(data.error || "Failed to delete product");
      }
    } catch (err) {
      setCrudError("Network error during inventory reduction");
    }
  };

  // Render Login page if not authenticated
  if (!token) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-100/50 text-slate-800">
        <div className="max-w-md mx-auto py-8">
          <div className="text-center mb-6">
            <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-full border border-emerald-100 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">SmartTrade Security Admin Console</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Elevated credentials required. Use default <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-rose-600 font-bold font-mono">admin</code> / <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-rose-600 font-bold font-mono">admin</code> credentials to log in.
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 mb-4">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                placeholder="Username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Secure Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-2 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Unlock Admin Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-100/50 text-slate-800">
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            SmartTrade Admin Control Hub
          </h2>
          <p className="text-xs text-slate-500 font-medium font-sans">Track and manage users, products, log files, and admin keys.</p>
        </div>
        <button
          onClick={onAdminLogout}
          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer transition-colors"
        >
          Lock Console
        </button>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-100 border border-slate-200/50 rounded-xl mb-6 max-w-md shadow-inner">
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center cursor-pointer transition-all ${
            activeTab === "logs" 
              ? "bg-white text-slate-900 shadow-sm border border-slate-200/20" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
          Audit Logs
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center cursor-pointer transition-all ${
            activeTab === "products" 
              ? "bg-white text-slate-900 shadow-sm border border-slate-200/20" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
          }`}
        >
          <PackagePlus className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
          Products Stock
        </button>
        <button
          onClick={() => setActiveTab("credentials")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center cursor-pointer transition-all ${
            activeTab === "credentials" 
              ? "bg-white text-slate-900 shadow-sm border border-slate-200/20" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
          }`}
        >
          <Key className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
          Admin Keys
        </button>
      </div>

      {/* 1. Tab: Audit Logs */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-semibold">Security Trails (Pre-filtered user movements)</span>
            <div className="flex gap-2">
              <button
                onClick={fetchLogs}
                className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer text-xs flex items-center gap-1 transition-colors"
                disabled={loadingLogs}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loadingLogs ? "animate-spin" : ""}`} /> Reload
              </button>
              <button
                onClick={handleClearLogs}
                className="p-1.5 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg text-red-600 cursor-pointer text-xs flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge Logs
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Event Details</th>
                    <th className="p-3">Source Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">Loading system records...</td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">No events logged in database.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3 font-semibold text-slate-900">{log.username}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded uppercase font-bold text-[9px] border ${
                            log.action.includes("FAILED") || log.action.includes("BLOCKED") || log.action.includes("REJECTED")
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : log.action.includes("SUCCESS") || log.action.includes("COMPLETED")
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 font-sans text-slate-600 max-w-xs sm:max-w-md break-words">{log.details}</td>
                        <td className="p-3">
                          <span className="block text-slate-400 font-mono text-[10px]">IP: {log.ipAddress}</span>
                          <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded-full border font-bold text-[9px] ${
                            log.pcrStatus === "SECURE" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-700 bg-rose-50 border-rose-100"
                          }`}>PCR: {log.pcrStatus}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tab: Products Stock CRUD */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-semibold">Inventory Warehouse Status</span>
            <button
              onClick={() => {
                setIsAddingProduct(!isAddingProduct);
                setEditingProductId(null);
                setProductForm({
                  name: "",
                  description: "",
                  price: 0,
                  imageUrl: "",
                  category: "Security Hardware",
                  stock: 50
                });
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              {isAddingProduct ? "Cancel" : <><Plus className="w-3.5 h-3.5 text-emerald-400" /> Add New Product</>}
            </button>
          </div>

          {crudError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3">
              {crudError}
            </div>
          )}

          {crudSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl p-3">
              {crudSuccess}
            </div>
          )}

          {/* Product Form */}
          {isAddingProduct && (
            <form onSubmit={handleProductSubmit} className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="col-span-1 md:col-span-2">
                <h4 className="font-bold text-slate-900 mb-1">{editingProductId ? "Edit Product Details" : "Create New Product Catalog"}</h4>
                <p className="text-slate-400 text-[11px] font-medium">Specify correct details to feed down to the customer mobile catalog.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-all"
                  placeholder="e.g. SmartSecure Phone S26"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catalog Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="Mobile Phones">Mobile Phones</option>
                  <option value="Security Hardware">Security Hardware</option>
                  <option value="Payment Security">Payment Security</option>
                  <option value="Computers">Computers</option>
                  <option value="Storage Security">Storage Security</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price (USD)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={productForm.price || ""}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-all"
                  placeholder="899"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stock stockpile stockpile stockpile quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={productForm.stock === 0 ? "0" : productForm.stock || ""}
                  onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-all"
                  placeholder="25"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Image Asset Link (URL)</label>
                <input
                  type="text"
                  required
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-all"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Description</label>
                <textarea
                  required
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-all"
                  placeholder="Summarize product hardware security enclaves..."
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm shadow-emerald-500/10"
                >
                  <Check className="w-3.5 h-3.5" /> Save Product
                </button>
              </div>
            </form>
          )}

          {/* Product Table List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="p-3">Product Info</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock stockpile</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">Inventory warehouse empty.</td>
                    </tr>
                  ) : (
                    products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/50">
                        <td className="p-3 flex items-center gap-2.5">
                          <img src={prod.imageUrl} alt={prod.name} className="w-8 h-8 rounded object-cover bg-slate-100" />
                          <div>
                            <span className="font-bold text-slate-900 block">{prod.name}</span>
                            <span className="text-slate-400 text-[10px] block line-clamp-1 max-w-[180px]">{prod.description}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-500">{prod.category}</td>
                        <td className="p-3 font-semibold text-slate-900">${prod.price}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full border font-bold text-[10px] ${
                            prod.stock <= 5 
                              ? "bg-rose-50 text-rose-700 border-rose-100 font-extrabold" 
                              : "bg-slate-100 text-slate-700 border-slate-200/50"
                          }`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleEditProduct(prod)}
                            className="p-1 border border-slate-200 hover:bg-slate-50 rounded text-slate-600 cursor-pointer inline-flex items-center transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1 border border-red-100 text-red-600 hover:bg-red-50 rounded cursor-pointer inline-flex items-center transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tab: Admin Keys & settings */}
      {activeTab === "credentials" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          {/* Modify My Credentials form */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                <Key className="w-4 h-4 text-emerald-600" /> Adjust My Credentials
              </h4>
              <p className="text-slate-400 text-[11px] font-medium">Modify current account login credentials.</p>
            </div>

            {settingsError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-lg p-2.5">
                {settingsError}
              </div>
            )}

            {settingsSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] rounded-lg p-2.5">
                {settingsSuccess}
              </div>
            )}

            <form onSubmit={(e) => handleUpdateCredentials(e)} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">New Admin Email</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400"><Mail className="w-3.5 h-3.5" /></span>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="admin@smarttradeafrica.com"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">New Admin Password</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400"><Lock className="w-3.5 h-3.5" /></span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer transition-colors"
              >
                Apply Changes
              </button>
            </form>
          </div>

          {/* Create New Admin */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                <Users className="w-4 h-4 text-emerald-600" /> Provision Another Admin
              </h4>
              <p className="text-slate-400 text-[11px] font-medium">Allow multi-signature administrative access by adding co-admins.</p>
            </div>

            {createError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-lg p-2.5">
                {createError}
              </div>
            )}

            {createSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] rounded-lg p-2.5">
                {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">New Admin Username</label>
                <input
                  type="text"
                  required
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  placeholder="e.g. admin2"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="admin2@smarttradeafrica.com"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Initialize Password</label>
                <input
                  type="password"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer transition-colors"
              >
                Provision Account
              </button>
            </form>
          </div>

          {/* Active Administrators Account Table */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1">Enrolled Security co-Administrators</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="p-3">ID</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Registered Email</th>
                    <th className="p-3">Date Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {admins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-400 font-mono text-[10px]">{adm.id}</td>
                      <td className="p-3 font-semibold text-slate-900">{adm.username}</td>
                      <td className="p-3 font-mono">{adm.email}</td>
                      <td className="p-3 text-slate-400">{new Date(adm.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
