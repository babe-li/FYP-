import fs from "fs";
import path from "path";

// Define TypeScript interfaces for our database records
export interface DbUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // Plaintext or simple base64 hash for demonstration
  isBiometricEnabled: boolean;
  biometricCredentialId?: string;
  role: "customer" | "admin";
  createdAt: string;
}

export interface DbProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

export interface DbOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface DbOrder {
  id: string;
  userId: string;
  username: string;
  items: DbOrderItem[];
  totalAmount: number;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  paymentToken?: string;
  deviceTrustScore: number;
  transactionId?: string;
  createdAt: string;
}

export interface DbAuditLog {
  id: string;
  userId?: string;
  username: string;
  action: string;
  details: string;
  ipAddress: string;
  deviceFingerprint: string;
  pcrStatus: "SECURE" | "COMPROMISED" | "UNVERIFIED";
  timestamp: string;
}

export interface DatabaseSchema {
  users: DbUser[];
  products: DbProduct[];
  orders: DbOrder[];
  auditLogs: DbAuditLog[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

// Default initial seed data
const DEFAULT_PRODUCTS: DbProduct[] = [
  {
    id: "prod-1",
    name: "SmartSecure Phone S26",
    description: "Sleek biometric smartphone with built-in hardware enclave, secure bootloader, and multi-layered data encryption.",
    price: 899,
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80",
    category: "Mobile Phones",
    stock: 25
  },
  {
    id: "prod-2",
    name: "Titan Cryptokey Pro",
    description: "USB-C Hardware Token with FIDO2 / WebAuthn standard support. Safeguards your digital identity against phishing.",
    price: 79,
    imageUrl: "https://images.unsplash.com/photo-1563198804-b6d3025db313?w=400&auto=format&fit=crop&q=80",
    category: "Security Hardware",
    stock: 120
  },
  {
    id: "prod-3",
    name: "SafePay Biometric Card",
    description: "Cold-storage payment card featuring a built-in fingerprint sensor to authorize transactions over contactless NFC terminal protocols.",
    price: 49,
    imageUrl: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=400&auto=format&fit=crop&q=80",
    category: "Payment Security",
    stock: 80
  },
  {
    id: "prod-4",
    name: "TrustBook Air Laptop",
    description: "13-inch carbon neutral workstation running on a Trusted Computing Platform (TCP) with hardware TPM 2.0 and secure boot validation.",
    price: 1299,
    imageUrl: "https://images.unsplash.com/photo-1496181130204-755241524eab?w=400&auto=format&fit=crop&q=80",
    category: "Computers",
    stock: 15
  },
  {
    id: "prod-5",
    name: "Aegis Encrypted Solid Drive",
    description: "2TB SSD featuring hardware-level AES-XTS 256-bit encryption. Self-destruct PIN pad prevents unauthorized physical recovery.",
    price: 199,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&auto=format&fit=crop&q=80",
    category: "Storage Security",
    stock: 45
  }
];

class Database {
  private memoryData: DatabaseSchema | null = null;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (this.memoryData) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
      const initialDb: DatabaseSchema = {
        users: [
          {
            id: "user-admin",
            username: "admin",
            email: "admin@smarttradeafrica.com",
            passwordHash: "admin", // Plaintext check for initial access
            isBiometricEnabled: false,
            role: "admin",
            createdAt: new Date().toISOString()
          },
          {
            id: "user-1",
            username: "customer1",
            email: "customer1@smarttradeafrica.com",
            passwordHash: "customer123",
            isBiometricEnabled: true,
            biometricCredentialId: "biom-cred-id-123",
            role: "customer",
            createdAt: new Date().toISOString()
          }
        ],
        products: DEFAULT_PRODUCTS,
        orders: [],
        auditLogs: [
          {
            id: "log-init",
            username: "system",
            action: "SYSTEM_INITIALIZATION",
            details: "SmartTrade Africa secure platform initialized. Seed data injected successfully.",
            ipAddress: "127.0.0.1",
            deviceFingerprint: "SYS_INIT_FINGERPRINT",
            pcrStatus: "SECURE",
            timestamp: new Date().toISOString()
          }
        ]
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialDb, null, 2), "utf8");
      this.memoryData = initialDb;
    } else {
      try {
        const raw = fs.readFileSync(DATA_FILE, "utf8");
        this.memoryData = JSON.parse(raw);
        
        // Ensure default admin exists if deleted by mistake
        const hasAdmin = this.memoryData?.users.some(u => u.username === "admin");
        if (!hasAdmin && this.memoryData) {
          this.memoryData.users.push({
            id: "user-admin",
            username: "admin",
            email: "admin@smarttradeafrica.com",
            passwordHash: "admin",
            isBiometricEnabled: false,
            role: "admin",
            createdAt: new Date().toISOString()
          });
          this.saveToDisk();
        }
      } catch (err) {
        console.error("Failed to read database file, resetting to defaults", err);
        this.memoryData = null;
        fs.unlinkSync(DATA_FILE);
        this.ensureInitialized();
      }
    }
  }

  private saveToDisk() {
    if (!this.memoryData) return;
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.memoryData, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to write to database file", err);
    }
  }

  // Getters
  public getUsers(): DbUser[] {
    this.ensureInitialized();
    return this.memoryData?.users || [];
  }

  public getProducts(): DbProduct[] {
    this.ensureInitialized();
    return this.memoryData?.products || [];
  }

  public getOrders(): DbOrder[] {
    this.ensureInitialized();
    return this.memoryData?.orders || [];
  }

  public getLogs(): DbAuditLog[] {
    this.ensureInitialized();
    return this.memoryData?.auditLogs || [];
  }

  // Setters / Actions
  public saveUser(user: DbUser): DbUser {
    this.ensureInitialized();
    if (!this.memoryData) throw new Error("Database not loaded");

    const index = this.memoryData.users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      this.memoryData.users[index] = { ...user };
    } else {
      this.memoryData.users.push({ ...user });
    }
    this.saveToDisk();
    return user;
  }

  public saveProduct(product: DbProduct): DbProduct {
    this.ensureInitialized();
    if (!this.memoryData) throw new Error("Database not loaded");

    const index = this.memoryData.products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      this.memoryData.products[index] = { ...product };
    } else {
      this.memoryData.products.push({ ...product });
    }
    this.saveToDisk();
    return product;
  }

  public deleteProduct(id: string): boolean {
    this.ensureInitialized();
    if (!this.memoryData) return false;

    const initialLength = this.memoryData.products.length;
    this.memoryData.products = this.memoryData.products.filter((p) => p.id !== id);
    if (this.memoryData.products.length !== initialLength) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  public saveOrder(order: DbOrder): DbOrder {
    this.ensureInitialized();
    if (!this.memoryData) throw new Error("Database not loaded");

    const index = this.memoryData.orders.findIndex((o) => o.id === order.id);
    if (index >= 0) {
      this.memoryData.orders[index] = { ...order };
    } else {
      this.memoryData.orders.push({ ...order });
    }
    this.saveToDisk();
    return order;
  }

  public addLog(log: Omit<DbAuditLog, "id" | "timestamp">): DbAuditLog {
    this.ensureInitialized();
    if (!this.memoryData) throw new Error("Database not loaded");

    const newLog: DbAuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    this.memoryData.auditLogs.unshift(newLog); // Prepend so new ones are on top
    
    // Limit logs to 500 records to prevent file size bloat
    if (this.memoryData.auditLogs.length > 500) {
      this.memoryData.auditLogs = this.memoryData.auditLogs.slice(0, 500);
    }
    
    this.saveToDisk();
    return newLog;
  }
}

export const db = new Database();
