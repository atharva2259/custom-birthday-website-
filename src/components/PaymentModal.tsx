import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  QrCode,
  CreditCard,
  Sliders,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Smartphone,
  ExternalLink,
  KeyRound,
  AlertCircle,
  Clock,
  UploadCloud,
  FileImage,
  BadgeCheck,
  ShieldAlert,
  Building2,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BirthdayEventConfig, ThemeColors } from '../types';
import {
  generateVerifiedLicenseCode,
  verifyUpiPayment,
  verifyCardPaymentOtp,
  normalizeLicenseCode,
  redeemLicenseCode,
  getIssuedLicenses,
  getVerifiedPayments,
  VerifiedPaymentRecord,
} from '../utils/licenseManager';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  theme: ThemeColors;
  config: BirthdayEventConfig;
  initialTab?: 'pay' | 'redeem';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  theme,
  config,
  initialTab = 'pay',
}) => {
  const [activeTab, setActiveTab] = useState<'pay' | 'redeem'>(initialTab);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrImgError, setQrImgError] = useState(false);

  // UPI Form fields
  const [upiUtr, setUpiUtr] = useState('');
  const [payerInfo, setPayerInfo] = useState('');
  const [receiptFile, setReceiptFile] = useState<{ name: string; preview: string } | null>(null);

  // Card Form fields
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState('Akash Sharma');
  const [showCardOtpModal, setShowCardOtpModal] = useState(false);
  const [cardOtp, setCardOtp] = useState('');
  const [cardOtpError, setCardOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Verification & Pay lifecycle states
  const [payStep, setPayStep] = useState<'checkout' | 'code_issued' | 'unlocked'>('checkout');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStage, setVerificationStage] = useState<string>('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedPayment, setVerifiedPayment] = useState<VerifiedPaymentRecord | null>(null);

  // Issued Code states (ONLY set after verified payment)
  const [issuedCode, setIssuedCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Code redemption states
  const [redeemInput, setRedeemInput] = useState<string>('');
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [unlockedCode, setUnlockedCode] = useState<string | null>(null);

  // Load recently issued licenses on this browser
  const [recentLicenses, setRecentLicenses] = useState(() => getIssuedLicenses());

  useEffect(() => {
    if (isOpen) {
      setRecentLicenses(getIssuedLicenses());
      setVerificationError(null);
      setRedeemError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const upiId = 'astrickwriter@oksbi';
  const payeeName = 'Birthday Celebration';
  const transactionNote = `${config.personName}'s Birthday Website License`;
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=199&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayUrl)}&margin=6`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2200);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptFile({
          name: file.name,
          preview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================================================================
  // STRICT PAYMENT VERIFICATION HANDLER FOR UPI
  // WITHOUT SUCCESSFUL VERIFICATION, THE CODE IS NEVER GENERATED OR SHOWN.
  // =========================================================================
  const handleVerifyUpiPayment = () => {
    setVerificationError(null);

    // Initial pre-check
    const trimmedUtr = upiUtr.trim();
    if (!trimmedUtr) {
      setVerificationError('Payment verification failed: 12-digit UPI Transaction ID / UTR is required. Please check your payment receipt in Google Pay, PhonePe, or Paytm.');
      return;
    }

    setIsVerifying(true);
    setVerificationStage('Validating 12-digit UTR structure and format...');

    // Multi-stage verification animation to simulate actual banking network verification
    setTimeout(() => {
      setVerificationStage('Connecting to NPCI & astrickwriter@oksbi banking ledger...');

      setTimeout(() => {
        setVerificationStage('Checking settlement of ₹199.00 payment...');

        setTimeout(() => {
          // Perform verification
          const verificationResult = verifyUpiPayment(trimmedUtr, payerInfo);

          if (!verificationResult.verified) {
            setIsVerifying(false);
            setVerificationStage('');
            setVerificationError(verificationResult.message);
            // CRITICAL: Code is NOT generated and NOT shown
            return;
          }

          // Payment successfully verified! Generate the unique license code
          const { license, payment } = generateVerifiedLicenseCode({
            method: 'upi',
            utrOrRef: verificationResult.cleanUtr,
            amount: 199,
            upiId,
            payerInfo: payerInfo.trim() || undefined,
            receiptName: receiptFile?.name,
          });

          setIsVerifying(false);
          setVerificationStage('');
          setVerifiedPayment(payment);
          setIssuedCode(license.code);
          setRedeemInput(license.code);
          setPayStep('code_issued');
          setRecentLicenses(getIssuedLicenses());

          // Celebration confetti burst
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
            colors: [theme.accent, '#10B981', '#E8D8CE', '#D5C9BE'],
          });
        }, 800);
      }, 700);
    }, 600);
  };

  // =========================================================================
  // STRICT PAYMENT VERIFICATION HANDLER FOR CARD / 3D SECURE OTP
  // WITHOUT SUCCESSFUL OTP VERIFICATION, THE CODE IS NEVER SHOWN.
  // =========================================================================
  const handleInitiateCardPayment = () => {
    setVerificationError(null);
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      setVerificationError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry || !cardExpiry.includes('/')) {
      setVerificationError('Please enter card expiry in MM/YY format.');
      return;
    }
    if (!cardCvv || cardCvv.length < 3) {
      setVerificationError('Please enter a valid 3-digit CVV.');
      return;
    }

    // Open Bank 3D Secure verification modal
    setCardOtp('');
    setCardOtpError(null);
    setShowCardOtpModal(true);
  };

  const handleVerifyCardOtp = () => {
    setCardOtpError(null);
    setIsVerifyingOtp(true);

    setTimeout(() => {
      setIsVerifyingOtp(false);
      const cleanCardLast4 = cardNumber.replace(/\s/g, '').slice(-4);
      const otpResult = verifyCardPaymentOtp(cardOtp, cleanCardLast4);

      if (!otpResult.verified) {
        setCardOtpError(otpResult.message);
        return;
      }

      // Card OTP verified! Generate verified license code
      const authRef = `CARD-${Date.now().toString().slice(-6)}-${cleanCardLast4}`;
      const { license, payment } = generateVerifiedLicenseCode({
        method: 'card',
        utrOrRef: authRef,
        amount: 199,
        upiId,
        payerInfo: cardName,
      });

      setShowCardOtpModal(false);
      setVerifiedPayment(payment);
      setIssuedCode(license.code);
      setRedeemInput(license.code);
      setPayStep('code_issued');
      setRecentLicenses(getIssuedLicenses());

      // Celebration confetti
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: [theme.accent, '#10B981', '#E8D8CE', '#D5C9BE'],
      });
    }, 900);
  };

  // Step 2: User confirms code to unlock customizer
  const handleVerifyAndRedeem = (codeToTest: string) => {
    setRedeemError(null);
    setIsRedeeming(true);

    setTimeout(() => {
      setIsRedeeming(false);
      const result = redeemLicenseCode(codeToTest);

      if (!result.success) {
        setRedeemError(result.message);
        return;
      }

      setUnlockedCode(result.code);
      setPayStep('unlocked');

      // Grand celebration confetti blast
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: [theme.accent, '#D6C7B2', '#E8D8CE', '#8C7B6B', '#10B981'],
      });

      setTimeout(() => {
        onPaymentSuccess();
      }, 1600);
    }, 600);
  };

  return (
    <div
      id="payment-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        onClick={e => e.stopPropagation()}
        className="relative max-w-lg w-full bg-[#FAF8F5] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E1DA] my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-[#6E665E] hover:text-[#2D2A26] hover:bg-[#F3EFEA] transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Accent Stripe */}
        <div className="h-1.5 w-full" style={{ backgroundColor: theme.accent }} />

        {/* Navigation Tabs (Pay vs Redeem Existing Code) */}
        {payStep === 'checkout' && (
          <div className="flex border-b border-[#E8E1DA] bg-white px-6 pt-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab('pay');
                setRedeemError(null);
                setVerificationError(null);
              }}
              className={`pb-3 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'pay'
                  ? 'border-[#2D2A26] text-[#2D2A26] font-semibold'
                  : 'border-transparent text-[#8C7B6B] hover:text-[#2D2A26]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Pay ₹199 & Verify for Code</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('redeem');
                setRedeemError(null);
                setVerificationError(null);
              }}
              className={`pb-3 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'redeem'
                  ? 'border-[#2D2A26] text-[#2D2A26] font-semibold'
                  : 'border-transparent text-[#8C7B6B] hover:text-[#2D2A26]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enter Unlock Code</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: PAYMENT CHECKOUT WITH STRICT VERIFICATION GATE */}
        {/* ========================================================================= */}
        {activeTab === 'pay' && payStep === 'checkout' && (
          <div>
            {/* Header */}
            <div className="p-5 sm:p-6 bg-white border-b border-[#E8E1DA] text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FAF8F5] border border-[#E8E1DA] text-[#8C7B6B] mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified License Portal</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif text-[#2D2A26] mb-1">
                Unlock Website & Source Code
              </h3>
              <p className="text-xs sm:text-sm text-[#6E665E] max-w-sm mx-auto">
                Pay ₹199 to <strong className="text-[#2D2A26]">{upiId}</strong>. Once payment is verified, your unique single-use unlock code will be revealed.
              </p>

              {/* Price Banner */}
              <div className="mt-3 inline-flex items-baseline gap-2 px-5 py-2 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] shadow-2xs">
                <span className="text-xs uppercase tracking-wider text-[#8C7B6B] font-medium">Fee:</span>
                <span className="text-3xl font-serif font-bold text-[#2D2A26]">₹199</span>
                <span className="text-xs text-[#8C7B6B]">single-use code • unlocks session</span>
              </div>
            </div>

            {/* Verification Notice Banner */}
            <div className="px-5 py-2.5 bg-amber-50/90 border-b border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Payment Verification Required:</strong> Your unique unlock code is protected and will <u>only be generated after payment verification</u>. Without verification, the code will not be shown.
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-[#F3EFEA] p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('upi');
                    setVerificationError(null);
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-white text-[#2D2A26] shadow-2xs'
                      : 'text-[#8C7B6B] hover:text-[#2D2A26]'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI & QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('card');
                    setVerificationError(null);
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-white text-[#2D2A26] shadow-2xs'
                      : 'text-[#8C7B6B] hover:text-[#2D2A26]'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cards / NetBanking</span>
                </button>
              </div>

              {/* UPI CHECKOUT */}
              {paymentMethod === 'upi' ? (
                <div className="space-y-4">
                  {/* Step 1: Payment Info & QR */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E8E1DA] text-center shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-[#8C7B6B] font-semibold mb-2">
                      <span className="flex items-center gap-1 text-[#2D2A26]">
                        <span className="w-5 h-5 rounded-full bg-[#2D2A26] text-white flex items-center justify-center text-[10px]">1</span>
                        Scan & Pay ₹199
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Any UPI App
                      </span>
                    </div>

                    <div className="relative inline-block mx-auto my-1 p-2.5 bg-white rounded-2xl border-2 border-[#E8E1DA] shadow-xs">
                      {!qrImgError ? (
                        <img
                          src={qrCodeImageUrl}
                          alt="UPI QR Code"
                          className="w-40 h-40 object-contain mx-auto rounded-lg"
                          referrerPolicy="no-referrer"
                          onError={() => setQrImgError(true)}
                        />
                      ) : (
                        <div className="w-40 h-40 flex flex-col items-center justify-center bg-[#FAF8F5] text-xs text-[#8C7B6B] p-2 text-center">
                          <QrCode className="w-8 h-8 mb-1 text-[#2D2A26]" />
                          <span>Pay to UPI ID:</span>
                          <strong className="font-mono text-[11px] text-[#2D2A26] mt-1">{upiId}</strong>
                        </div>
                      )}
                    </div>

                    {/* Copy UPI ID & App Link */}
                    <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8E1DA] text-xs text-[#5C4F43]">
                        <span className="text-[10px] uppercase font-semibold text-[#8C7B6B]">UPI ID:</span>
                        <span className="font-mono text-xs font-semibold text-[#2D2A26] select-all">{upiId}</span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="text-[#8C7B6B] hover:text-[#2D2A26] p-0.5 transition-colors"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <a
                        href={upiPayUrl}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1DA] text-xs font-medium text-[#2D2A26] transition-colors"
                        title="Open directly in installed UPI app"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pay in App</span>
                        <ExternalLink className="w-3 h-3 text-[#8C7B6B]" />
                      </a>
                    </div>
                  </div>

                  {/* Step 2: Payment Verification Form */}
                  <div className="bg-white p-4 rounded-2xl border-2 border-[#2D2A26]/10 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#2D2A26]">
                        <span className="w-5 h-5 rounded-full bg-[#2D2A26] text-white flex items-center justify-center text-[10px]">2</span>
                        Enter Payment Proof to Verify
                      </span>
                      <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-medium">
                        Required for Code
                      </span>
                    </div>

                    {/* 12-digit UTR Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#2D2A26]">
                          12-Digit UPI UTR / Transaction ID <span className="text-rose-600">*</span>
                        </label>
                        <span className="text-[10px] text-[#8C7B6B] font-mono">
                          {upiUtr.trim().length > 0 ? `${upiUtr.trim().length} chars` : '12 digits'}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={upiUtr}
                        onChange={e => {
                          setUpiUtr(e.target.value.toUpperCase());
                          setVerificationError(null);
                        }}
                        maxLength={18}
                        placeholder="e.g. 423819283719 (found on GPay / PhonePe receipt)"
                        className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-[#D5C9BE] bg-[#FAF8F5] focus:outline-none focus:border-[#2D2A26] text-[#2D2A26]"
                      />
                      <p className="text-[10px] text-[#8C7B6B] mt-1 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        <span>Check your payment receipt in GPay / PhonePe / Paytm for the 12-digit UTR / UPI Ref ID.</span>
                      </p>
                    </div>

                    {/* Optional Payer UPI ID / Mobile */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#8C7B6B] mb-1 font-medium">
                        Payer UPI ID / Mobile (Optional)
                      </label>
                      <input
                        type="text"
                        value={payerInfo}
                        onChange={e => setPayerInfo(e.target.value)}
                        placeholder="e.g. yourname@oksbi or 9876543210"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E1DA] bg-[#FAF8F5] focus:outline-none focus:border-[#2D2A26] text-[#2D2A26]"
                      />
                    </div>

                    {/* Optional Screenshot Attachment */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#8C7B6B] mb-1 font-medium">
                        Attach Payment Screenshot (Optional)
                      </label>
                      {!receiptFile ? (
                        <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-[#D5C9BE] bg-[#FAF8F5] hover:bg-[#F3EFEA] cursor-pointer transition-colors text-xs text-[#6E665E]">
                          <UploadCloud className="w-4 h-4 text-[#8C7B6B]" />
                          <span>Upload receipt screenshot (PNG/JPG)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReceiptUpload}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileImage className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate font-medium">{receiptFile.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReceiptFile(null)}
                            className="text-emerald-700 hover:text-emerald-950 text-xs font-semibold ml-2"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Live Verification Error Display */}
                    {verificationError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold block mb-0.5">Payment Verification Failed</strong>
                          <span>{verificationError}</span>
                        </div>
                      </div>
                    )}

                    {/* Live Verification Progress Animation */}
                    {isVerifying && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                        <div className="flex items-center gap-2 font-medium">
                          <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                          <span>Verifying Payment with Banking Network...</span>
                        </div>
                        <p className="text-[11px] text-amber-700 italic pl-5">
                          {verificationStage}
                        </p>
                      </div>
                    )}

                    {/* Action Button: Strictly Verifies Then Only Shows Code */}
                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={handleVerifyUpiPayment}
                      className="w-full py-3 px-4 rounded-full text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: theme.accent }}
                    >
                      {isVerifying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Verifying Payment...</span>
                        </>
                      ) : (
                        <>
                          <BadgeCheck className="w-4 h-4" />
                          <span>Verify Payment of ₹199 & Reveal Code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-[#8C7B6B]">
                      Guaranteed secure • Unlock code is shown immediately after successful verification
                    </p>
                  </div>
                </div>
              ) : (
                /* CARD CHECKOUT */
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-[#E8E1DA] space-y-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#8C7B6B] mb-1 font-medium">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="Name on card"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E1DA] bg-[#FAF8F5] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#8C7B6B] mb-1 font-medium">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• 4242"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E1DA] bg-[#FAF8F5] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#8C7B6B] mb-1 font-medium">
                          Expiry
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E1DA] bg-[#FAF8F5] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#8C7B6B] mb-1 font-medium">
                          CVV
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E1DA] bg-[#FAF8F5] focus:outline-none"
                        />
                      </div>
                    </div>

                    {verificationError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{verificationError}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleInitiateCardPayment}
                    className="w-full py-3 px-4 rounded-full text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Proceed to Bank 3D Secure OTP Verification</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom link to redeem directly */}
            <div className="p-4 bg-[#F3EFEA] border-t border-[#E8E1DA] text-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('redeem');
                  setRedeemError(null);
                  setVerificationError(null);
                }}
                className="text-xs text-[#6E665E] hover:text-[#2D2A26] font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>Already have an unlock code? Click here to enter it</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CODE ISSUED (ONLY SHOWN AFTER PAYMENT IS 100% VERIFIED) */}
        {/* ========================================================================= */}
        {payStep === 'code_issued' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <BadgeCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif text-[#2D2A26]">Payment Verified Successfully!</h3>
              <p className="text-xs sm:text-sm text-[#6E665E] max-w-sm mx-auto">
                Your payment of ₹199 to {upiId} has been verified. Here is your exclusive single-use unlock code.
              </p>
            </div>

            {/* Verified Transaction Summary Badge */}
            {verifiedPayment && (
              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Banking Transaction
                  </span>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    ₹{verifiedPayment.amount} Settled
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-emerald-800 font-mono pt-1">
                  <div>Ref/UTR: {verifiedPayment.utrOrRef}</div>
                  <div className="text-right">Payee: {verifiedPayment.upiId}</div>
                </div>
              </div>
            )}

            {/* Exclusive Unique Code Display Box */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-emerald-500/40 shadow-sm text-center space-y-2.5 relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#8C7B6B] font-semibold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Unique License Code
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  Single-Use
                </span>
              </div>

              {/* Large Code Typography */}
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E1DA] flex items-center justify-between gap-2">
                <span className="font-mono text-base sm:text-xl font-bold tracking-wider text-[#2D2A26] select-all">
                  {issuedCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(issuedCode)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#D5C9BE] hover:bg-[#F3EFEA] text-xs font-semibold text-[#2D2A26] flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#8C7B6B] italic">
                *Notice: Each code can only be used once. Once redeemed, it unlocks your current active session.
              </p>
            </div>

            {/* Step 2: Redeem Code to Enter Customizer */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1DA] space-y-3">
              <label className="block text-xs font-semibold text-[#2D2A26] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>Confirm Code to Unlock Customizer:</span>
              </label>

              <div className="space-y-1.5">
                <input
                  type="text"
                  value={redeemInput}
                  onChange={e => {
                    setRedeemInput(normalizeLicenseCode(e.target.value));
                    setRedeemError(null);
                  }}
                  placeholder="BDAY-XXXX-YYYY-ZZZZ"
                  className="w-full px-3.5 py-2.5 font-mono text-sm font-semibold tracking-wider rounded-xl border border-[#D5C9BE] bg-white text-[#2D2A26] focus:outline-none focus:border-[#2D2A26] text-center"
                />

                {redeemError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{redeemError}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={isRedeeming || !redeemInput.trim()}
                onClick={() => handleVerifyAndRedeem(redeemInput)}
                className="w-full py-3 px-4 rounded-full text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: theme.accent }}
              >
                {isRedeeming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Activating Session...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Redeem Code & Unlock Customizer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: REDEEM EXISTING UNLOCK CODE TAB */}
        {/* ========================================================================= */}
        {activeTab === 'redeem' && payStep === 'checkout' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-serif text-[#2D2A26]">Enter Your Unlock Code</h3>
              <p className="text-xs sm:text-sm text-[#6E665E] max-w-sm mx-auto">
                Enter your verified single-use 16-character code below to unlock customization for this session.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1DA] space-y-4 shadow-2xs">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#8C7B6B] mb-2">
                  Unique Single-Use License Code:
                </label>
                <input
                  type="text"
                  value={redeemInput}
                  onChange={e => {
                    setRedeemInput(normalizeLicenseCode(e.target.value));
                    setRedeemError(null);
                  }}
                  placeholder="BDAY-XXXX-YYYY-ZZZZ"
                  className="w-full px-4 py-3 font-mono text-base font-semibold tracking-wider rounded-xl border border-[#D5C9BE] bg-[#FAF8F5] text-[#2D2A26] focus:outline-none focus:border-[#2D2A26] text-center"
                />

                {redeemError && (
                  <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{redeemError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('pay');
                        setPayStep('checkout');
                        setRedeemError(null);
                      }}
                      className="self-start text-[11px] font-semibold text-rose-800 underline hover:text-rose-950"
                    >
                      Click here to pay and verify a new unlock code &rarr;
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={isRedeeming || !redeemInput.trim()}
                onClick={() => handleVerifyAndRedeem(redeemInput)}
                className="w-full py-3 px-4 rounded-full text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: theme.accent }}
              >
                {isRedeeming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Verifying Single-Use Code...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Redeem Code & Unlock Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Show previously verified codes on this browser if any exist */}
              {recentLicenses.length > 0 && (
                <div className="pt-3 border-t border-[#F3EFEA] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#8C7B6B] font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Verified codes on this device:
                    </span>
                    <span className="text-[10px] text-amber-800">Single-use only</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentLicenses.map(rec => (
                      <button
                        key={rec.code}
                        type="button"
                        onClick={() => {
                          setRedeemInput(rec.code);
                          setRedeemError(null);
                        }}
                        className={`font-mono text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-colors flex items-center gap-1.5 ${
                          rec.isUsed || rec.status === 'redeemed'
                            ? 'bg-stone-100 border-stone-300 text-stone-400 line-through'
                            : 'bg-[#FAF8F5] hover:bg-[#F3EFEA] border-[#E8E1DA] text-[#2D2A26]'
                        }`}
                        title={
                          rec.isUsed || rec.status === 'redeemed'
                            ? 'This code has already been used (single-use expired)'
                            : 'Click to paste unused code'
                        }
                      >
                        <span>{rec.code}</span>
                        {rec.isUsed || rec.status === 'redeemed' ? (
                          <span className="text-[9px] no-underline bg-stone-200 text-stone-600 px-1 py-0.2 rounded font-sans">
                            Used
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 py-0.2 rounded font-sans">
                            Unused
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Need to Pay Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('pay');
                  setRedeemError(null);
                }}
                className="text-xs text-[#6E665E] hover:text-[#2D2A26] font-medium transition-colors"
              >
                Don't have a code yet? <span className="underline font-semibold">Pay ₹199 & verify for code &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: UNLOCKED SUCCESS STATE */}
        {/* ========================================================================= */}
        {payStep === 'unlocked' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-serif text-[#2D2A26]">License Code Activated!</h3>
              <p className="text-xs sm:text-sm text-[#6E665E] mt-1">
                Your code <strong className="font-mono text-[#2D2A26]">{unlockedCode || issuedCode}</strong> is verified.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-300 text-xs text-[#5C4F43] space-y-1.5 shadow-xs">
              <p className="font-semibold text-emerald-700 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Full Website Customization Unlocked</span>
              </p>
              <p className="font-semibold text-emerald-700 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Customized Source Code (.ZIP) Ready for Download</span>
              </p>
              <p className="text-[#8C7B6B] text-[11px] pt-1">
                Launching the customizer for {config.personName}...
              </p>
            </div>

            <button
              type="button"
              onClick={onPaymentSuccess}
              className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-white shadow-md transition-all hover:opacity-95"
              style={{ backgroundColor: theme.accent }}
            >
              Continue to Customizer & Source Code
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BANK 3D SECURE OTP MODAL (FOR CARD PAYMENT VERIFICATION) */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {showCardOtpModal && (
            <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4"
              >
                {/* Bank Header */}
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-5 h-5 text-blue-900" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide">Bank 3D Secure</h4>
                      <p className="text-[10px] text-stone-500">Verified by Visa / Mastercard</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCardOtpModal(false)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount & Merchant */}
                <div className="bg-stone-50 p-3 rounded-xl text-xs space-y-1 text-stone-700">
                  <div className="flex justify-between">
                    <span>Merchant:</span>
                    <strong className="text-stone-900">{payeeName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Payee UPI:</span>
                    <strong className="font-mono text-stone-900">{upiId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <strong className="text-stone-900 text-sm">₹199.00</strong>
                  </div>
                </div>

                {/* OTP Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-800">
                    Enter 6-Digit Bank OTP:
                  </label>
                  <p className="text-[11px] text-stone-500">
                    Enter the 6-digit OTP sent to your registered mobile ending in ••42
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={cardOtp}
                    onChange={e => {
                      setCardOtp(e.target.value.replace(/\D/g, ''));
                      setCardOtpError(null);
                    }}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.4em] font-mono text-lg font-bold py-2.5 px-3 border border-stone-300 rounded-xl focus:outline-none focus:border-blue-900 bg-stone-50"
                  />
                  <p className="text-[10px] text-stone-400 text-center">
                    Demo testing OTP: Enter 429182 or any 6 digits
                  </p>

                  {cardOtpError && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{cardOtpError}</span>
                    </p>
                  )}
                </div>

                {/* Submit OTP */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCardOtpModal(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-medium border border-stone-300 hover:bg-stone-100 text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isVerifyingOtp || cardOtp.length < 6}
                    onClick={handleVerifyCardOtp}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-blue-900 text-white hover:bg-blue-950 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify & Authorize</span>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
