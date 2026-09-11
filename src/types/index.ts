export type UserRole = 'user' | 'collector' | 'recycler' | 'brand_cpcb';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  trustScore?: number;
  walletBalanceINR?: number;
  rewardPoints?: number;
  createdAt: string;
  address?: string;
  city?: string;
  pincode?: string;
  upiId?: string;
  collectorId?: string;
  memberId?: string;
  verificationStatus?: 'verified' | 'pending' | 'unverified';
  idProofType?: string;
  idProofNumber?: string;
  operatingTerritory?: string;
  bankAccount?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    bankName?: string;
  };
  notifications?: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
  };
  // Recycler / Refurbisher profile fields
  licenseNumber?: string;
  facilityAddress?: string;
  processingCapacityTonsPerDay?: number;
  contactPerson?: string;
  accreditations?: string[];
  // Brand / CPCB Producer Responsibility Organization fields
  cpcbRegNumber?: string;
  gstin?: string;
  authorizedSignatory?: string;
  brandCategoryFocus?: string[];
}

export interface RewardCreditTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  amountINR: number;
  productName: string;
  productCategory: 'Laptop' | 'Mobile' | 'Printer' | 'Charger / Cable' | 'Battery' | 'Television / Screen' | 'Other E-Waste' | 'Bonus' | 'Cashback Payout';
  weightKg?: number;
  pickupRequestId?: string;
  date: string;
  status: 'credited' | 'processing' | 'redeemed';
  paymentMethod?: string;
  referenceNumber?: string;
  notes?: string;
  actorId?: string;
}

export interface JWTPayload {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  organization?: string;
}

export interface PickupItem {
  id: string;
  category: 'Mobile' | 'Laptop' | 'Printer' | 'Charger / Cable' | 'Battery' | 'Television / Screen' | 'PCB / Motherboard' | 'Other E-Waste';
  count: number;
  estimatedWeightKg?: number;
  notes?: string;
}

export interface PickupRequest {
  id: string; // e.g. PR-1024
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  address: string;
  city: string;
  items: PickupItem[];
  status: 'pending' | 'accepted' | 'collected' | 'aggregator_verified' | 'recycler_received' | 'processing_completed';
  createdAt: string;
  assignedCollectorId?: string;
  assignedCollectorName?: string;
  batchId?: string;
}

export type HazardType = 'Swollen Battery' | 'Leakage' | 'Damaged Battery' | 'Unknown Hazard' | 'No Hazard';

export type CircularityPathway = 'REUSE' | 'REFURBISH' | 'COMPONENT RECOVERY' | 'RECYCLE';

export interface CollectionBatch {
  id: string; // e.g. CB-00071
  pickupRequestId: string;
  collectorId: string;
  collectorName: string;
  items: PickupItem[];
  declaredWeightKg: number;
  aggregatorWeightKg?: number;
  recyclerWeightKg?: number;
  photos: string[];
  gps: {
    lat: number;
    lng: number;
    locationName: string;
  };
  timestamp: string;
  hazardStatus: HazardType;
  syncStatus: 'pending' | 'syncing' | 'synced';
  status: 'collected' | 'aggregator_verified' | 'recycler_received' | 'processed';
  circularityPath?: CircularityPathway;
  riskFlagIds: string[];
  notes?: string;
}

export interface EventLedgerItem {
  id: string;
  eventCode: string; // e.g. EVENT 001
  title: string;
  actorRole: UserRole | 'aggregator' | 'system';
  actorName: string;
  batchId: string;
  timestamp: string;
  details: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface RecyclerPartner {
  id: string;
  name: string;
  distanceKm: number;
  indicativePriceINR: number;
  trustScore: number;
  capacity: string;
  status: 'Accepting' | 'Limited' | 'Full';
  isRecommended?: boolean;
  address: string;
  specialties: string[];
}

export interface RiskAnomaly {
  id: string;
  batchId: string;
  type: 'duplicate_photo' | 'weight_anomaly' | 'gps_anomaly' | 'duplicate_tx';
  severity: 'low' | 'medium' | 'high';
  description: string;
  recordedValue: string;
  expectedValue: string;
  status: 'flagged' | 'cleared' | 'rejected';
  detectedAt: string;
  resolvedAt?: string;
  notes?: string;
}

export interface ImpactReceipt {
  id: string;
  pickupRequestId: string;
  batchId: string;
  citizenName: string;
  itemsSummary: string;
  declaredWeightKg: number;
  verifiedWeightKg: number;
  finalPath: CircularityPathway;
  rewardPoints: number;
  verifiedDate: string;
  status: 'VERIFIED' | 'PENDING';
}

export interface EPRObligationStats {
  targetKg: number;
  verifiedFulfillmentKg: number;
  informalChannelKg: number;
  percentageFulfillment: number;
  categoryBreakdown: {
    name: string;
    kg: number;
    color: string;
  }[];
}
