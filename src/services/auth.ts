import { JWTPayload, User, UserRole } from '../types';

const TOKEN_KEY = 'reloop_jwt_token';
const USERS_KEY = 'reloop_registered_users';

// Pre-configured default test accounts matching the project requirements
export const DEFAULT_ACCOUNTS: User[] = [
  {
    id: 'usr_citizen_01',
    name: 'Priya Sharma',
    email: 'priya@citizen.reloop.eco',
    role: 'user',
    phone: '+91 98765 43210',
    rewardPoints: 120,
    address: '12th Cross, 4th Block, Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
    upiId: 'priya@okhdfcbank',
    bankAccount: {
      accountNumber: '50100489218451',
      ifscCode: 'HDFC0000128',
      bankName: 'HDFC Bank',
      accountHolderName: 'Priya Sharma',
    },
    notifications: {
      whatsapp: true,
      sms: true,
      email: true,
    },
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'usr_collector_01',
    name: 'Rajesh Kumar',
    email: 'rajesh@collector.reloop.eco',
    role: 'collector',
    phone: '+91 91234 56789',
    trustScore: 94,
    walletBalanceINR: 3000,
    createdAt: '2026-02-15T08:30:00Z',
    collectorId: 'COL-9021',
    memberId: 'RELOOP-MEM-4471',
    verificationStatus: 'verified',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-8823',
    operatingTerritory: 'Indiranagar & Koramangala, Bengaluru',
    address: '5th Main Road, Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
    upiId: 'rajesh@upi',
    bankAccount: {
      accountNumber: '30987654321098',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
      accountHolderName: 'Rajesh Kumar',
    },
    notifications: {
      whatsapp: true,
      sms: true,
      email: false,
    },
  },
  {
    id: 'usr_recycler_01',
    name: 'GreenTech Circularity Solutions',
    email: 'contact@greentech.eco',
    role: 'recycler',
    phone: '+91 98200 11223',
    organization: 'Authorized Recycler R-109 / CPCB Lic: 2026-EC-98',
    licenseNumber: 'CPCB-REC-2026-BLR-884',
    facilityAddress: 'Plot 42, Peenya Industrial Area, Phase II, Bengaluru, Karnataka - 560058',
    city: 'Bengaluru',
    pincode: '560058',
    processingCapacityTonsPerDay: 8.5,
    contactPerson: 'Vikram Mehta (Plant Operations Head)',
    accreditations: ['ISO 14001:2015', 'R2v3 Certified', 'CPCB Authorized', 'Zero-Landfill Protocol'],
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'usr_brand_01',
    name: 'EcoCorp Electronics India Pvt Ltd',
    email: 'compliance@ecocorp.com',
    role: 'brand_cpcb',
    phone: '+91 99880 77665',
    organization: 'Producer Responsibility Org (EPR-REG-2026-44)',
    cpcbRegNumber: 'CPCB-EPR-PRO-2026-4482',
    gstin: '29AAACE1234F1Z8',
    authorizedSignatory: 'Ananya Deshmukh (EPR & ESG Compliance Director)',
    address: 'EcoCorp Tower, Level 9, Cyber City, Whitefield, Bengaluru',
    city: 'Bengaluru',
    pincode: '560066',
    brandCategoryFocus: ['ITEW1 (Laptops & Desktops)', 'ITEW2 (Smartphones & Tablets)', 'CEEW1 (Televisions)'],
    createdAt: '2026-01-05T11:00:00Z',
  },
];

// Helper to encode base64url
function base64UrlEncode(str: string): string {
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper to decode base64url
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

// Generate JWT token
export function createJWT(user: User): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
    iat: now,
    exp: now + 24 * 60 * 60, // 24 hours expiry
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  // Deterministic mock cryptographic signature
  const mockSecret = 'reloop_epr_secret_key_2026';
  const rawSignature = `${encodedHeader}.${encodedPayload}.${mockSecret}`;
  const encodedSignature = base64UrlEncode(rawSignature).slice(0, 32);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// Verify and decode JWT token
export function verifyJWT(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'No token provided' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid JWT structure' };
    }

    const [headerB64, payloadB64] = parts;
    const payloadJson = base64UrlDecode(payloadB64);
    const payload: JWTPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Failed to verify token' };
  }
}

// Get saved registered users
export function getRegisteredUsers(): User[] {
  try {
    const saved = localStorage.getItem(USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return [...DEFAULT_ACCOUNTS, ...parsed];
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_ACCOUNTS;
}

// Save a newly registered user
export function registerUser(name: string, email: string, role: UserRole, phone?: string): { success: boolean; user?: User; token?: string; error?: string } {
  const users = getRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return { success: false, error: 'An account with this email already exists' };
  }

  const newUser: User = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    role,
    phone: phone || '+91 90000 00000',
    trustScore: role === 'collector' ? 85 : undefined,
    walletBalanceINR: role === 'collector' ? 0 : undefined,
    rewardPoints: role === 'user' ? 25 : undefined,
    createdAt: new Date().toISOString(),
    collectorId: role === 'collector' ? `COL-${Math.floor(1000 + Math.random() * 8999)}` : undefined,
    memberId: role === 'collector' ? `RELOOP-MEM-${Math.floor(1000 + Math.random() * 8999)}` : undefined,
    verificationStatus: role === 'collector' ? 'unverified' : undefined,
  };

  try {
    const customUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    customUsers.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(customUsers));
  } catch (e) {
    console.error(e);
  }

  const token = createJWT(newUser);
  saveSession(token, newUser);
  return { success: true, user: newUser, token };
}

// Login
export function loginUser(email: string, role?: UserRole): { success: boolean; user?: User; token?: string; error?: string } {
  const users = getRegisteredUsers();
  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user && role) {
    // If testing with arbitrary email, create on-the-fly demo account
    return registerUser(email.split('@')[0], email, role);
  }

  if (!user) {
    return { success: false, error: 'No account found with this email. Please register.' };
  }

  if (role && user.role !== role) {
    return {
      success: false,
      error: `Account role mismatch: Account is registered as "${getRoleDisplayName(user.role)}", but you selected "${getRoleDisplayName(role)}".`,
    };
  }

  const token = createJWT(user);
  saveSession(token, user);
  return { success: true, user, token };
}

// Save session
export function saveSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem('reloop_current_user', JSON.stringify(user));
  window.dispatchEvent(new Event('reloop_auth_changed'));
}

// Update current user profile details
export function updateUserProfile(updatedFields: Partial<User>): User | null {
  try {
    const { user } = getCurrentSession();
    if (!user) return null;

    const updatedUser: User = {
      ...user,
      ...updatedFields,
    };

    // Update in registered users storage if custom user
    try {
      const saved = localStorage.getItem(USERS_KEY);
      if (saved) {
        const users: User[] = JSON.parse(saved);
        const index = users.findIndex((u) => u.id === updatedUser.id);
        if (index >= 0) {
          users[index] = updatedUser;
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
      }
    } catch (err) {
      console.error('Error updating registered users cache', err);
    }

    // Generate renewed token
    const token = createJWT(updatedUser);
    saveSession(token, updatedUser);
    return updatedUser;
  } catch (e) {
    console.error('Failed to update user profile', e);
    return null;
  }
}

// Update user reward score
export function updateUserRewardPoints(newPoints: number): User | null {
  return updateUserProfile({ rewardPoints: newPoints });
}

// Clear session
export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('reloop_current_user');
  window.dispatchEvent(new Event('reloop_auth_changed'));
}

// Get current session
export function getCurrentSession(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { user: null, token: null };

    const verification = verifyJWT(token);
    if (!verification.valid || !verification.payload) {
      logoutUser();
      return { user: null, token: null };
    }

    const savedUserStr = localStorage.getItem('reloop_current_user');
    if (savedUserStr) {
      const user: User = JSON.parse(savedUserStr);
      return { user, token };
    }

    // Fallback construct user from JWT
    const user: User = {
      id: verification.payload.sub,
      name: verification.payload.name,
      email: verification.payload.email,
      role: verification.payload.role,
      organization: verification.payload.organization,
      createdAt: new Date(verification.payload.iat * 1000).toISOString(),
    };
    return { user, token };
  } catch (e) {
    return { user: null, token: null };
  }
}

// Role-Based Access Control (RBAC) verification
export function checkRoleAccess(requiredRole: UserRole | UserRole[], userRole?: UserRole): boolean {
  if (!userRole) return false;
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'user':
      return 'Citizen / User';
    case 'collector':
      return 'Informal Collector';
    case 'recycler':
      return 'Recycler / Refurbisher';
    case 'brand_cpcb':
      return 'Brand / CPCB (PRO)';
    default:
      return role;
  }
}

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case 'user':
      return '/dashboard/citizen';
    case 'collector':
      return '/dashboard/collector';
    case 'recycler':
      return '/dashboard/recycler';
    case 'brand_cpcb':
      return '/dashboard/brand-cpcb';
    default:
      return '/';
  }
}
