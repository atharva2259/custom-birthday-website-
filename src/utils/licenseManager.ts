export interface LicenseRecord {
  code: string;
  issuedAt: string;
  redeemedAt?: string;
  amount: number;
  upiId: string;
  txnRef?: string;
  status: 'issued' | 'redeemed';
  isUsed?: boolean;
}

const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const STORAGE_KEY_ISSUED = 'birthday_issued_licenses';
const STORAGE_KEY_CONSUMED = 'birthday_consumed_codes';

// Session-only in-memory storage (cleared on page reload)
let sessionActiveCode: string | null = null;

/**
 * Calculates a deterministic 4-character check segment for algorithmic validation.
 */
function calculateCheckSegment(seg1: string, seg2: string): string {
  const combined = `BDAY_${seg1}_${seg2}_199_OKSBI`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash >>>= 0;

  let result = '';
  for (let i = 0; i < 4; i++) {
    const idx = Math.abs((hash >> (i * 7)) % CHARS.length);
    result += CHARS[idx];
  }
  return result;
}

/**
 * Generates random characters from the unambiguous alphanumeric character set.
 */
function getRandomChars(count: number): string {
  let res = '';
  const cryptoObj = typeof window !== 'undefined' && window.crypto ? window.crypto : null;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const values = new Uint32Array(count);
    cryptoObj.getRandomValues(values);
    for (let i = 0; i < count; i++) {
      res += CHARS[values[i] % CHARS.length];
    }
  } else {
    for (let i = 0; i < count; i++) {
      res += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
  }
  return res;
}

/**
 * Retrieves all codes that have already been redeemed/consumed.
 * Each code can ONLY be used once. Once consumed, it cannot be reused even after page reload.
 */
export function getConsumedCodes(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CONSUMED);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Checks whether a specific code has already been consumed/used.
 */
export function isCodeConsumed(code: string): boolean {
  const normalized = normalizeLicenseCode(code);
  if (!normalized) return false;
  const consumed = getConsumedCodes();
  return consumed.includes(normalized);
}

/**
 * Retrieves all locally issued license records.
 */
export function getIssuedLicenses(): LicenseRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ISSUED);
    if (!data) return [];
    const list: LicenseRecord[] = JSON.parse(data);
    const consumed = getConsumedCodes();
    // Synchronize isUsed flag with consumed records
    return list.map(item => ({
      ...item,
      isUsed: item.status === 'redeemed' || consumed.includes(item.code),
    }));
  } catch {
    return [];
  }
}

/**
 * Saves an issued license record.
 */
function saveIssuedLicense(record: LicenseRecord) {
  try {
    const existing = getIssuedLicenses();
    const filtered = existing.filter(r => r.code !== record.code);
    filtered.unshift(record);
    localStorage.setItem(STORAGE_KEY_ISSUED, JSON.stringify(filtered));
  } catch {
    // Local storage failure fallback
  }
}

/**
 * Generates a completely unique, verifiable single-use license code upon payment.
 * Format: BDAY-XXXX-YYYY-ZZZZ
 */
export function generateUniqueLicenseCode(txnRef = 'UPI-PAYMENT-199', upiId = 'astrickwriter@oksbi'): LicenseRecord {
  const seg1 = getRandomChars(4);
  const seg2 = getRandomChars(4);
  const checkSeg = calculateCheckSegment(seg1, seg2);
  const code = `BDAY-${seg1}-${seg2}-${checkSeg}`;

  const record: LicenseRecord = {
    code,
    issuedAt: new Date().toISOString(),
    amount: 199,
    upiId,
    txnRef,
    status: 'issued',
    isUsed: false,
  };

  saveIssuedLicense(record);
  return record;
}

/**
 * Normalizes input code string (handles spaces, missing dashes, lowercase).
 */
export function normalizeLicenseCode(rawInput: string): string {
  if (!rawInput) return '';
  let clean = rawInput.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');

  if (clean.startsWith('BDAY')) {
    clean = clean.substring(4);
  }

  const p1 = clean.substring(0, 4);
  const p2 = clean.substring(4, 8);
  const p3 = clean.substring(8, 12);

  if (!p1) return '';
  if (!p2) return `BDAY-${p1}`;
  if (!p3) return `BDAY-${p1}-${p2}`;
  return `BDAY-${p1}-${p2}-${p3}`;
}

/**
 * Validates a license code:
 * 1. Checks format BDAY-XXXX-YYYY-ZZZZ
 * 2. Checks if the code has ALREADY been used (strictly single-use rejection)
 * 3. Verifies authenticity against issued records and/or algorithmic checksum
 */
export function validateLicenseCode(rawInput: string): {
  isValid: boolean;
  isAlreadyUsed?: boolean;
  message: string;
  normalizedCode: string;
  record?: LicenseRecord;
} {
  const normalized = normalizeLicenseCode(rawInput);
  if (!normalized) {
    return {
      isValid: false,
      message: 'Please enter your unique unlock code.',
      normalizedCode: '',
    };
  }

  // Must match format BDAY-XXXX-YYYY-ZZZZ
  const regex = /^BDAY-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/;
  const match = normalized.match(regex);

  if (!match) {
    return {
      isValid: false,
      message: 'Code format should be BDAY-XXXX-YYYY-ZZZZ (16 characters).',
      normalizedCode: normalized,
    };
  }

  // CRITICAL SINGLE-USE RULE: Check if code has already been used/redeemed
  if (isCodeConsumed(normalized)) {
    return {
      isValid: false,
      isAlreadyUsed: true,
      message: 'This unlock code has already been used and cannot be reused. Each code is strictly single-use. Please buy a new code to customize.',
      normalizedCode: normalized,
    };
  }

  const [, seg1, seg2, seg3] = match;

  // 1. Check if it is in the issued records and not used
  const issued = getIssuedLicenses();
  const found = issued.find(r => r.code === normalized);
  if (found) {
    if (found.status === 'redeemed' || found.isUsed) {
      return {
        isValid: false,
        isAlreadyUsed: true,
        message: 'This unlock code has already been used and cannot be reused. Each code is strictly single-use. Please buy a new code to customize.',
        normalizedCode: normalized,
        record: found,
      };
    }
    return {
      isValid: true,
      message: 'Valid unique single-use license code.',
      normalizedCode: normalized,
      record: found,
    };
  }

  // 2. Algorithmic check digit verification
  const expectedCheck = calculateCheckSegment(seg1, seg2);
  if (seg3 === expectedCheck) {
    return {
      isValid: true,
      message: 'Valid authentic single-use license code.',
      normalizedCode: normalized,
    };
  }

  return {
    isValid: false,
    message: 'Invalid or unrecognized license code. Please check your code and try again.',
    normalizedCode: normalized,
  };
}

/**
 * Redeems and activates a license code for the current session.
 * SINGLE-USE GUARANTEE:
 * 1. The code is permanently added to consumed codes list.
 * 2. It can NEVER be used again.
 * 3. On page reload, the session resets and the user must buy a new code to customize again.
 */
export function redeemLicenseCode(rawInput: string): {
  success: boolean;
  message: string;
  code: string;
  isAlreadyUsed?: boolean;
} {
  const validation = validateLicenseCode(rawInput);

  if (!validation.isValid) {
    return {
      success: false,
      message: validation.message,
      code: validation.normalizedCode,
      isAlreadyUsed: validation.isAlreadyUsed,
    };
  }

  const code = validation.normalizedCode;

  try {
    // 1. Permanently record code as CONSUMED so it can never be used again
    const consumed = getConsumedCodes();
    if (!consumed.includes(code)) {
      consumed.push(code);
      localStorage.setItem(STORAGE_KEY_CONSUMED, JSON.stringify(consumed));
    }

    // 2. Update status in issued licenses list
    const issued = getIssuedLicenses();
    const updated = issued.map(item => {
      if (item.code === code) {
        return {
          ...item,
          status: 'redeemed' as const,
          isUsed: true,
          redeemedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY_ISSUED, JSON.stringify(updated));

    // 3. Keep in-memory session reference (wiped when page reloads)
    sessionActiveCode = code;

    // 4. Ensure no persistent unlock flag is stored across reloads
    localStorage.removeItem('birthday_license_unlocked');
  } catch {
    // Storage fallback
  }

  return {
    success: true,
    message: 'Code successfully activated for this session! Customization & source code unlocked.',
    code,
  };
}

/**
 * Returns the currently active license code for this session, or null if unlicensed/reloaded.
 */
export function getActiveLicenseCode(): string | null {
  return sessionActiveCode;
}

/**
 * Explicitly sets the session active license code (e.g. after successful payment and redemption in the current session).
 */
export function setSessionActiveCode(code: string | null) {
  sessionActiveCode = code;
}
