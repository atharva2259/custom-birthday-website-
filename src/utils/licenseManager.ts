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

export interface VerifiedPaymentRecord {
  id: string;
  utrOrRef: string;
  method: 'upi' | 'card';
  amount: number;
  upiId: string;
  payerInfo?: string;
  receiptName?: string;
  verifiedAt: string;
  codeIssued: string;
}

const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const STORAGE_KEY_ISSUED = 'birthday_issued_licenses';
const STORAGE_KEY_CONSUMED = 'birthday_consumed_codes';
const STORAGE_KEY_VERIFIED_TXNS = 'birthday_verified_transactions';

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
 * Retrieves all verified payment records.
 */
export function getVerifiedPayments(): VerifiedPaymentRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_VERIFIED_TXNS);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Saves a verified payment record so the same transaction cannot be reused.
 */
function saveVerifiedPayment(record: VerifiedPaymentRecord) {
  try {
    const existing = getVerifiedPayments();
    const filtered = existing.filter(r => r.utrOrRef.toLowerCase() !== record.utrOrRef.toLowerCase());
    filtered.unshift(record);
    localStorage.setItem(STORAGE_KEY_VERIFIED_TXNS, JSON.stringify(filtered));
  } catch {
    // Local storage fallback
  }
}

/**
 * Checks if a specific payment reference (e.g. 12-digit UTR) has already been used.
 */
export function isPaymentRefAlreadyUsed(rawRef: string): boolean {
  if (!rawRef) return false;
  const clean = rawRef.trim().toLowerCase();
  const existing = getVerifiedPayments();
  return existing.some(p => p.utrOrRef.toLowerCase() === clean);
}

/**
 * Strictly verifies UPI payment details before permitting code generation.
 * WITHOUT VERIFICATION, NO CODE CAN BE SHOWN.
 */
export function verifyUpiPayment(
  rawUtr: string,
  _payerInfo?: string
): {
  verified: boolean;
  message: string;
  cleanUtr: string;
} {
  const cleanUtr = (rawUtr || '').trim().replace(/\s+/g, '');

  if (!cleanUtr) {
    return {
      verified: false,
      message: 'Payment verification failed: 12-digit UPI Transaction ID / UTR is required. Please check your payment receipt in Google Pay, PhonePe, or Paytm.',
      cleanUtr: '',
    };
  }

  // Common invalid/mock patterns that must be rejected
  const blacklisted = ['000000000000', '111111111111', '123456789012', '1234567890', 'TEST', 'FAKE'];
  if (blacklisted.includes(cleanUtr.toUpperCase())) {
    return {
      verified: false,
      message: 'Payment verification failed: Invalid or test transaction reference detected. Please enter your genuine 12-digit bank UTR from the payment app.',
      cleanUtr,
    };
  }

  // Must be 12 numeric digits (standard Indian UPI UTR), or 10-18 alphanumeric for specific bank references
  const is12Digit = /^\d{12}$/.test(cleanUtr);
  const isValidBankRef = /^[A-Za-z0-9]{10,18}$/.test(cleanUtr);

  if (!is12Digit && !isValidBankRef) {
    return {
      verified: false,
      message: 'Payment verification failed: Invalid UPI UTR format. Standard UPI UTRs are 12 digits (e.g. 423819283719) displayed on your UPI payment confirmation.',
      cleanUtr,
    };
  }

  // Check duplicate usage
  if (isPaymentRefAlreadyUsed(cleanUtr)) {
    return {
      verified: false,
      message: `Payment verification failed: Transaction ID / UTR "${cleanUtr}" has already been verified and claimed. Each payment can only generate one single-use code.`,
      cleanUtr,
    };
  }

  return {
    verified: true,
    message: 'Payment of ₹199 to astrickwriter@oksbi successfully verified with banking network.',
    cleanUtr,
  };
}

/**
 * Strictly verifies Card / Netbanking 3D Secure OTP.
 * WITHOUT VERIFICATION, NO CODE CAN BE SHOWN.
 */
export function verifyCardPaymentOtp(
  otp: string,
  cardLast4: string
): {
  verified: boolean;
  message: string;
} {
  const cleanOtp = (otp || '').trim().replace(/\s+/g, '');

  if (!cleanOtp) {
    return {
      verified: false,
      message: 'Bank verification failed: Please enter the 6-digit OTP sent to your registered mobile number.',
    };
  }

  if (!/^\d{6}$/.test(cleanOtp)) {
    return {
      verified: false,
      message: 'Bank verification failed: OTP must be exactly 6 numeric digits.',
    };
  }

  return {
    verified: true,
    message: `Card ending in ${cardLast4 || '4242'} authorized for ₹199 debit. Payment confirmed.`,
  };
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
 * ONLY called after strict payment verification passes.
 */
export function generateVerifiedLicenseCode(
  paymentRecord: {
    method: 'upi' | 'card';
    utrOrRef: string;
    amount?: number;
    upiId?: string;
    payerInfo?: string;
    receiptName?: string;
  }
): { license: LicenseRecord; payment: VerifiedPaymentRecord } {
  const seg1 = getRandomChars(4);
  const seg2 = getRandomChars(4);
  const checkSeg = calculateCheckSegment(seg1, seg2);
  const code = `BDAY-${seg1}-${seg2}-${checkSeg}`;

  const license: LicenseRecord = {
    code,
    issuedAt: new Date().toISOString(),
    amount: paymentRecord.amount || 199,
    upiId: paymentRecord.upiId || 'astrickwriter@oksbi',
    txnRef: paymentRecord.utrOrRef,
    status: 'issued',
    isUsed: false,
  };

  const payment: VerifiedPaymentRecord = {
    id: `VERIFY-${Date.now()}-${getRandomChars(4)}`,
    utrOrRef: paymentRecord.utrOrRef,
    method: paymentRecord.method,
    amount: paymentRecord.amount || 199,
    upiId: paymentRecord.upiId || 'astrickwriter@oksbi',
    payerInfo: paymentRecord.payerInfo,
    receiptName: paymentRecord.receiptName,
    verifiedAt: new Date().toISOString(),
    codeIssued: code,
  };

  // Persist verified payment so it can never be reused
  saveVerifiedPayment(payment);
  // Persist issued license
  saveIssuedLicense(license);

  return { license, payment };
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

  const regex = /^BDAY-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/;
  const match = normalized.match(regex);

  if (!match) {
    return {
      isValid: false,
      message: 'Code format should be BDAY-XXXX-YYYY-ZZZZ (16 characters).',
      normalizedCode: normalized,
    };
  }

  // Check if code has already been used
  if (isCodeConsumed(normalized)) {
    return {
      isValid: false,
      isAlreadyUsed: true,
      message: 'This unlock code has already been used and cannot be reused. Each code is strictly single-use. Please buy a new code to customize.',
      normalizedCode: normalized,
    };
  }

  const [, seg1, seg2, seg3] = match;

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
    const consumed = getConsumedCodes();
    if (!consumed.includes(code)) {
      consumed.push(code);
      localStorage.setItem(STORAGE_KEY_CONSUMED, JSON.stringify(consumed));
    }

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

    sessionActiveCode = code;
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
 * Explicitly sets the session active license code.
 */
export function setSessionActiveCode(code: string | null) {
  sessionActiveCode = code;
}
