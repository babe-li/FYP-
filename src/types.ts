export interface User {
  id: string;
  username: string;
  email: string;
  isBiometricEnabled: boolean;
  role: "customer" | "admin";
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuditLog {
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

export interface TpmStatus {
  chipVersion: string;
  endorsementKeyHash: string;
  storageRootKeyHash: string;
  pcrRegisters: {
    PCR00_SYSTEM_FIRMWARE: string;
    PCR01_SYSTEM_CONFIG: string;
    PCR04_BOOT_LOADER: string;
    PCR08_KERNEL_INTEGRITY: string;
  };
}

export interface TelemetryData {
  tpmStatus: TpmStatus;
  stats: {
    totalUsers: number;
    biometricEnrolled: number;
    attestationPercent: number;
    totalOrders: number;
    failedSecurityEvents: number;
  };
  securityAlertFeed: Array<{
    timestamp: string;
    action: string;
    details: string;
    ip: string;
    fingerprint: string;
    status: string;
  }>;
}

// TAM Model Interactive State
export interface TamState {
  perceivedUsefulness: number; // Slider 0 - 100
  perceivedEaseOfUse: number; // Slider 0 - 100
  socialInfluence: number; // Slider 0 - 100
  facilitatingConditions: number; // Slider 0 - 100
}
