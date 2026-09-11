import {
  CircularityPathway,
  CollectionBatch,
  EPRObligationStats,
  EventLedgerItem,
  HazardType,
  ImpactReceipt,
  PickupRequest,
  RecyclerPartner,
  RewardCreditTransaction,
  RiskAnomaly,
} from '../types';

const STORAGE_KEYS = {
  PICKUPS: 'reloop_pickup_requests_v1',
  BATCHES: 'reloop_batches_v1',
  EVENTS: 'reloop_events_v1',
  RISKS: 'reloop_risks_v1',
  PARTNERS: 'reloop_partners_v1',
  REWARDS: 'reloop_reward_transactions_v1',
};

export const INITIAL_PICKUP_REQUESTS: PickupRequest[] = [
  {
    id: 'PR-1024',
    citizenId: 'usr_citizen_01',
    citizenName: 'Priya Sharma',
    citizenPhone: '+91 98765 43210',
    address: '4th Block, Koramangala, near BDA Complex',
    city: 'Bengaluru',
    items: [
      { id: 'i1', category: 'Mobile', count: 2, estimatedWeightKg: 0.4 },
      { id: 'i2', category: 'Laptop', count: 1, estimatedWeightKg: 2.2, notes: 'ThinkPad T480, turns on' },
      { id: 'i3', category: 'Printer', count: 1, estimatedWeightKg: 8.5 },
      { id: 'i4', category: 'Charger / Cable', count: 3, estimatedWeightKg: 1.3 },
    ],
    status: 'processing_completed',
    createdAt: '2026-03-08T09:30:00Z',
    assignedCollectorId: 'usr_collector_01',
    assignedCollectorName: 'Rajesh Kumar',
    batchId: 'CB-00071',
  },
  {
    id: 'PR-1025',
    citizenId: 'usr_citizen_02',
    citizenName: 'Aravind Menon',
    citizenPhone: '+91 98450 12345',
    address: '7th Main, Indiranagar, 100ft Road',
    city: 'Bengaluru',
    items: [
      { id: 'i5', category: 'Television / Screen', count: 1, estimatedWeightKg: 14.0 },
      { id: 'i6', category: 'Charger / Cable', count: 5, estimatedWeightKg: 1.5 },
    ],
    status: 'collected',
    createdAt: '2026-03-09T14:15:00Z',
    assignedCollectorId: 'usr_collector_01',
    assignedCollectorName: 'Rajesh Kumar',
    batchId: 'CB-00072',
  },
  {
    id: 'PR-1026',
    citizenId: 'usr_citizen_03',
    citizenName: 'Sneha Roy',
    citizenPhone: '+91 97312 99887',
    address: 'HSR Layout Sector 2, 14th Cross',
    city: 'Bengaluru',
    items: [
      { id: 'i7', category: 'Mobile', count: 3, estimatedWeightKg: 0.6 },
      { id: 'i8', category: 'Battery', count: 2, estimatedWeightKg: 1.2, notes: 'Old powerbank and drill battery' },
    ],
    status: 'pending',
    createdAt: '2026-03-10T03:45:00Z',
  },
];

export const INITIAL_BATCHES: CollectionBatch[] = [
  {
    id: 'CB-00071',
    pickupRequestId: 'PR-1024',
    collectorId: 'usr_collector_01',
    collectorName: 'Rajesh Kumar',
    items: [
      { id: 'i1', category: 'Mobile', count: 2 },
      { id: 'i2', category: 'Laptop', count: 1 },
      { id: 'i3', category: 'Printer', count: 1 },
      { id: 'i4', category: 'Charger / Cable', count: 3 },
    ],
    declaredWeightKg: 12.4,
    aggregatorWeightKg: 11.9,
    recyclerWeightKg: 11.7,
    photos: [
      'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
    ],
    gps: {
      lat: 12.9352,
      lng: 77.6245,
      locationName: 'Koramangala 4th Block, Bengaluru',
    },
    timestamp: '2026-03-08T11:15:20Z',
    hazardStatus: 'No Hazard',
    syncStatus: 'synced',
    status: 'processed',
    circularityPath: 'REFURBISH',
    riskFlagIds: [],
    notes: 'Laptop in good physical condition; printer motor functional.',
  },
  {
    id: 'CB-00072',
    pickupRequestId: 'PR-1025',
    collectorId: 'usr_collector_01',
    collectorName: 'Rajesh Kumar',
    items: [
      { id: 'i5', category: 'Television / Screen', count: 1 },
      { id: 'i6', category: 'Charger / Cable', count: 5 },
    ],
    declaredWeightKg: 15.5,
    aggregatorWeightKg: 15.2,
    photos: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80',
    ],
    gps: {
      lat: 12.9784,
      lng: 77.6408,
      locationName: 'Indiranagar 100ft Road, Bengaluru',
    },
    timestamp: '2026-03-09T16:00:00Z',
    hazardStatus: 'No Hazard',
    syncStatus: 'synced',
    status: 'aggregator_verified',
    riskFlagIds: [],
  },
];

export const INITIAL_EVENTS: EventLedgerItem[] = [
  {
    id: 'evt_001',
    eventCode: 'EVENT 001',
    title: 'Collector Collected Batch',
    actorRole: 'collector',
    actorName: 'Rajesh Kumar (ID: COL-771)',
    batchId: 'CB-00071',
    timestamp: '2026-03-08T11:15:20Z',
    details: 'Collection recorded on mobile app. 4 items logged, weight 12.4 kg.',
    metadata: { declaredWeightKg: 12.4, pickupRequestId: 'PR-1024', gps: '12.9352, 77.6245' },
  },
  {
    id: 'evt_002',
    eventCode: 'EVENT 002',
    title: 'Aggregator Received Batch',
    actorRole: 'aggregator',
    actorName: 'Bengaluru South Aggregation Hub',
    batchId: 'CB-00071',
    timestamp: '2026-03-08T15:40:10Z',
    details: 'Batch QR scanned at receiving dock. Inward check-in confirmed.',
    metadata: { hubId: 'HUB-BLR-04', bay: 'Dock-3' },
  },
  {
    id: 'evt_003',
    eventCode: 'EVENT 003',
    title: 'Aggregator Verified Weight',
    actorRole: 'aggregator',
    actorName: 'Bengaluru South Aggregation Hub',
    batchId: 'CB-00071',
    timestamp: '2026-03-08T16:10:05Z',
    details: 'Digital scale verification: 11.9 kg (within normal packaging variance).',
    metadata: { verifiedWeightKg: 11.9, variancePct: '-4.0%' },
  },
  {
    id: 'evt_004',
    eventCode: 'EVENT 004',
    title: 'Recycler Received Batch',
    actorRole: 'recycler',
    actorName: 'GreenTech Circularity Solutions',
    batchId: 'CB-00071',
    timestamp: '2026-03-09T10:05:00Z',
    details: 'Batch QR verified at facility entrance. Received weight confirmed at 11.7 kg.',
    metadata: { facilityId: 'REC-BLR-884', receivedWeightKg: 11.7 },
  },
  {
    id: 'evt_005',
    eventCode: 'EVENT 005',
    title: 'Recycler Processed Batch',
    actorRole: 'recycler',
    actorName: 'GreenTech Circularity Solutions',
    batchId: 'CB-00071',
    timestamp: '2026-03-09T17:30:00Z',
    details: 'Circularity assessment complete: Laptop designated for Refurbishment; Mobiles for Component Recovery; Printer for Materials Recycling.',
    metadata: { pathway: 'REFURBISH & COMPONENT RECOVERY', recoveryRatePct: '92.4%' },
  },
  {
    id: 'evt_006',
    eventCode: 'EVENT 006',
    title: 'EPR Eligibility Created',
    actorRole: 'brand_cpcb',
    actorName: 'CPCB Automated Verification Engine',
    batchId: 'CB-00071',
    timestamp: '2026-03-09T18:00:00Z',
    details: '11.7 kg verified informal first-mile e-waste credit unlocked for EcoCorp (EPR-REG-2026-44). Digital audit trail sealed.',
    metadata: { eprCreditKg: 11.7, brandId: 'EcoCorp Electronics', auditStatus: 'SEALED' },
  },
];

export const INITIAL_RECYCLER_PARTNERS: RecyclerPartner[] = [
  {
    id: 'rec_a',
    name: 'Recycler A (GreenTech Eco-Park)',
    distanceKm: 8,
    indicativePriceINR: 4200,
    trustScore: 96,
    capacity: '85% (High capacity)',
    status: 'Accepting',
    isRecommended: true,
    address: 'Plot 42, Electronic City Phase 1',
    specialties: ['Laptops & Computers', 'Smartphones', 'Lithium Batteries'],
  },
  {
    id: 'rec_b',
    name: 'Recycler B (CleanEarth Solutions)',
    distanceKm: 5,
    indicativePriceINR: 3700,
    trustScore: 91,
    capacity: '94% (Near peak)',
    status: 'Accepting',
    isRecommended: false,
    address: 'Peenya Industrial Estate, 3rd Stage',
    specialties: ['Printers & Copiers', 'Consumer Electronics'],
  },
  {
    id: 'rec_c',
    name: 'Recycler C (Apex Metals & Shredding)',
    distanceKm: 12,
    indicativePriceINR: 4500,
    trustScore: 82,
    capacity: '40% (Medium capacity)',
    status: 'Limited',
    isRecommended: false,
    address: 'Bommasandra Industrial Area',
    specialties: ['Heavy Metals', 'Bulk Scrap', 'Screen Dismantling'],
  },
];

export const INITIAL_RISK_FLAGS: RiskAnomaly[] = [
  {
    id: 'risk_01',
    batchId: 'CB-00069',
    type: 'weight_anomaly',
    severity: 'high',
    description: 'Suspicious declared weight for single consumer laptop.',
    recordedValue: '28.0 kg',
    expectedValue: '2.0 - 5.0 kg',
    status: 'flagged',
    detectedAt: '2026-03-07T12:20:00Z',
  },
  {
    id: 'risk_02',
    batchId: 'CB-00065',
    type: 'duplicate_photo',
    severity: 'medium',
    description: 'Perceptual photo hash matches batch CB-00041 collected 5 days prior.',
    recordedValue: 'Hash: 9a3f-b88c',
    expectedValue: 'Unique hash required',
    status: 'cleared',
    detectedAt: '2026-03-05T09:15:00Z',
    resolvedAt: '2026-03-05T14:00:00Z',
    notes: 'Secondary photo confirmed collector accidentally uploaded catalog image; genuine photo verified.',
  },
];

export const INITIAL_EPR_STATS: EPRObligationStats = {
  targetKg: 10000,
  verifiedFulfillmentKg: 7420,
  informalChannelKg: 2850,
  percentageFulfillment: 74.2,
  categoryBreakdown: [
    { name: 'IT & Telecommunications', kg: 4100, color: '#10b981' },
    { name: 'Consumer Electronics & Displays', kg: 2200, color: '#3b82f6' },
    { name: 'Batteries & Accumulators', kg: 1120, color: '#f59e0b' },
  ],
};

// Data Store Accessors
export function getStoredPickups(): PickupRequest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PICKUPS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_PICKUP_REQUESTS;
}

export function savePickup(pickup: PickupRequest) {
  const all = getStoredPickups();
  const existingIdx = all.findIndex((p) => p.id === pickup.id);
  if (existingIdx >= 0) {
    all[existingIdx] = pickup;
  } else {
    all.unshift(pickup);
  }
  localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(all));
  window.dispatchEvent(new Event('reloop_data_changed'));
}

export function getStoredBatches(): CollectionBatch[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_BATCHES;
}

export function saveBatch(batch: CollectionBatch) {
  const all = getStoredBatches();
  const existingIdx = all.findIndex((b) => b.id === batch.id);
  if (existingIdx >= 0) {
    all[existingIdx] = batch;
  } else {
    all.unshift(batch);
  }
  localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(all));
  window.dispatchEvent(new Event('reloop_data_changed'));
}

let eventCounter = 0;

export function getStoredEvents(): EventLedgerItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (data) {
      const parsed: EventLedgerItem[] = JSON.parse(data);
      const seenIds = new Set<string>();
      let hasDuplicates = false;
      const sanitized = parsed.map((item, index) => {
        if (!item.id || seenIds.has(item.id)) {
          hasDuplicates = true;
          const uniqueId = item.id ? `${item.id}_${index}_${Math.random().toString(36).substring(2, 6)}` : `evt_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
          seenIds.add(uniqueId);
          return { ...item, id: uniqueId };
        }
        seenIds.add(item.id);
        return item;
      });

      if (hasDuplicates) {
        try {
          localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(sanitized));
        } catch {
          // ignore storage quota errors
        }
      }
      return sanitized;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_EVENTS;
}

export function addEvent(event: Omit<EventLedgerItem, 'id'>): EventLedgerItem {
  const all = getStoredEvents();
  eventCounter += 1;
  const uniqueId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${eventCounter}`;
  const newEvent: EventLedgerItem = {
    ...event,
    id: uniqueId,
  };
  all.unshift(newEvent);
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(all));
  window.dispatchEvent(new Event('reloop_data_changed'));
  return newEvent;
}

export function getStoredRisks(): RiskAnomaly[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RISKS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_RISK_FLAGS;
}

export function updateRiskStatus(riskId: string, status: 'cleared' | 'rejected', notes?: string) {
  const all = getStoredRisks();
  const item = all.find((r) => r.id === riskId);
  if (item) {
    item.status = status;
    item.resolvedAt = new Date().toISOString();
    if (notes) item.notes = notes;
    localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(all));
    window.dispatchEvent(new Event('reloop_data_changed'));
  }
}

export function getStoredPartners(): RecyclerPartner[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PARTNERS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_RECYCLER_PARTNERS;
}

export const INITIAL_REWARD_TRANSACTIONS: RewardCreditTransaction[] = [
  {
    id: 'RC-801',
    type: 'earned',
    points: 55,
    amountINR: 55,
    productName: 'Lenovo ThinkPad T480 (Laptop)',
    productCategory: 'Laptop',
    weightKg: 2.2,
    pickupRequestId: 'PR-1024',
    date: '2026-03-08T11:20:00Z',
    status: 'credited',
    notes: 'Circularity Pathway: Refurbishment for Digital Literacy Program',
  },
  {
    id: 'RC-802',
    type: 'earned',
    points: 30,
    amountINR: 30,
    productName: 'Samsung Galaxy Android (2x Mobiles)',
    productCategory: 'Mobile',
    weightKg: 0.4,
    pickupRequestId: 'PR-1024',
    date: '2026-03-08T11:20:00Z',
    status: 'credited',
    notes: 'Rare earth minerals & IC components safely recovered',
  },
  {
    id: 'RC-803',
    type: 'earned',
    points: 35,
    amountINR: 35,
    productName: 'HP LaserJet M1136 Multi-Function Printer',
    productCategory: 'Printer',
    weightKg: 8.5,
    pickupRequestId: 'PR-1024',
    date: '2026-03-08T11:20:00Z',
    status: 'credited',
    notes: 'Plastic chassis & electric stepper motor recovered',
  },
  {
    id: 'RC-804',
    type: 'earned',
    points: 15,
    amountINR: 15,
    productName: '3x Copper Fast Chargers & Braided Cables',
    productCategory: 'Charger / Cable',
    weightKg: 1.3,
    pickupRequestId: 'PR-1024',
    date: '2026-03-08T11:20:00Z',
    status: 'credited',
    notes: 'High-purity 99.8% electrolytic copper wire recovered',
  },
  {
    id: 'RC-805',
    type: 'earned',
    points: 45,
    amountINR: 45,
    productName: 'Dell Vostro 1500 Legacy Laptop',
    productCategory: 'Laptop',
    weightKg: 2.8,
    pickupRequestId: 'PR-1011',
    date: '2026-02-22T14:10:00Z',
    status: 'credited',
    notes: 'Motherboard ICs & aluminum heat pipes diverted',
  },
  {
    id: 'RC-806',
    type: 'redeemed',
    points: 60,
    amountINR: 60,
    productName: 'Cashback Payout (60 Green Points)',
    productCategory: 'Cashback Payout',
    date: '2026-03-01T16:45:00Z',
    status: 'redeemed',
    paymentMethod: 'UPI - priya@okhdfcbank',
    referenceNumber: 'UPI-IMPS-8921873910',
    notes: 'Instant cashback transferred to HDFC Bank VPA',
  },
];

export function getStoredRewardTransactions(): RewardCreditTransaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REWARDS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_REWARD_TRANSACTIONS;
}

export function saveRewardTransaction(tx: RewardCreditTransaction) {
  const current = getStoredRewardTransactions();
  current.unshift(tx);
  localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(current));
  window.dispatchEvent(new Event('reloop_rewards_changed'));
}

export function resetDemoData() {
  localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(INITIAL_PICKUP_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(INITIAL_BATCHES));
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
  localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(INITIAL_RISK_FLAGS));
  localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(INITIAL_RECYCLER_PARTNERS));
  localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(INITIAL_REWARD_TRANSACTIONS));
  window.dispatchEvent(new Event('reloop_data_changed'));
  window.dispatchEvent(new Event('reloop_rewards_changed'));
}
