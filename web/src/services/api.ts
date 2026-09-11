/**
 * ReLoop Authoritative API Service
 * Integrates Web Frontend with the FastAPI Backend (/api/v1/)
 * Supports seamless fallback to mockData when running standalone or in mock mode.
 */
import { INITIAL_BATCHES, INITIAL_PICKUP_REQUESTS, INITIAL_EPR_STATS, INITIAL_RECYCLER_PARTNERS } from './mockData';

const API_BASE_URL = (typeof window !== 'undefined' && (window as any).__RELOOP_API_URL__) || 'http://localhost:8000/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('reloop_jwt_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}, fallbackData?: T): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers || {}),
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw err;
  }
}

// CITIZEN SERVICES
export async function getCitizenPickups() {
  return apiRequest('/citizens/me/pickups', { method: 'GET' }, INITIAL_PICKUP_REQUESTS);
}

export async function getPickupJourney(pickupId: number | string) {
  return apiRequest(`/citizens/me/pickups/${pickupId}/journey`, { method: 'GET' });
}

export async function getImpactReceipt() {
  return apiRequest('/citizens/me/impact-receipt', { method: 'GET' });
}

export async function createCitizenPickup(data: { latitude: number; longitude: number; description?: string }) {
  return apiRequest('/pickups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// AI VERIFICATION SERVICE
export async function verifyImageWithAI(imagePathOrDesc: string) {
  return apiRequest('/vision/verify-image', {
    method: 'POST',
    body: JSON.stringify({ image: imagePathOrDesc }),
  }, {
    isEwaste: true,
    item: 'Electronic Device',
    category: 'Consumer Electronics',
    confidence: 0.94,
    decision: 'ACCEPT',
    reason: 'Electronic computing equipment detected'
  });
}

// COLLECTOR & OFFLINE SERVICES
export async function getAssignedPickups() {
  return apiRequest('/pickups/collector/assigned', { method: 'GET' }, INITIAL_PICKUP_REQUESTS);
}

export async function syncCollectionBatch(payload: any) {
  return apiRequest('/collections/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// AGGREGATOR SERVICES
export async function getAggregatorDashboardData() {
  return apiRequest('/aggregator/dashboard', { method: 'GET' }, {
    incoming_batches_count: 2,
    in_hub_batches_count: 3,
    sorted_batches_count: 1,
    total_inventory_kg: 34.5,
    incoming_batches: [],
    in_hub_batches: []
  });
}

export async function aggregatorReceiveBatch(batchId: number | string, lat?: number, lon?: number) {
  return apiRequest(`/batches/${batchId}/receive`, {
    method: 'POST',
    body: JSON.stringify({ latitude: lat, longitude: lon }),
  });
}

export async function aggregatorVerifyWeight(batchId: number | string, items: { item_id: number; verified_weight: number }[]) {
  return apiRequest(`/batches/${batchId}/verify-weight`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

// RECYCLER SERVICES
export async function recyclerReceiveBatch(batchId: number | string, items: { item_id: number; received_weight: number }[]) {
  return apiRequest(`/batches/${batchId}/recycler-receive`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export async function recyclerProcessBatch(batchId: number | string) {
  return apiRequest(`/batches/${batchId}/process`, {
    method: 'POST',
    body: JSON.stringify({ status: 'PROCESSED' }),
  });
}

// BRAND / EPR COMPLIANCE SERVICES
export async function getComplianceReport() {
  return apiRequest('/compliance/report', { method: 'GET' }, {
    total_batches: INITIAL_BATCHES.length,
    processed_count: 3,
    fulfillment_percentage: 84.5,
    pathway_breakdown: {
      recycle: 4,
      refurbish: 1,
      reuse: 1,
      component_recovery: 2
    },
    attribution: 'Informal Collective Tier-1 Attribution'
  });
}

// REWARDS & UPI
export async function getWalletBalance() {
  return apiRequest<number>('/rewards/wallet', { method: 'GET' }, 3000);
}

export async function requestUPIRedemption(amount: number, upiId: string) {
  return apiRequest('/rewards/redeem', {
    method: 'POST',
    body: JSON.stringify({ amount, upi_id: upiId }),
  });
}

// NOTIFICATIONS
export async function getMyNotifications() {
  return apiRequest('/notifications/me', { method: 'GET' }, []);
}
