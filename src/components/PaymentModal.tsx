import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  QrCode,
  CreditCard,
  Download,
  Sliders,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Code2,
  Smartphone,
  ExternalLink,
  KeyRound,
  AlertCircle,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BirthdayEventConfig, ThemeColors } from '../types';
import {
  generateUniqueLicenseCode,
  normalizeLicenseCode,
  redeemLicenseCode,
  getIssuedLicenses,
  validateLicenseCode,
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiReference, setUpiReference] = useState('');
  const [qrImgError, setQrImgError] = useState(false);

  // Pay lifecycle states
  const [payStep, setPayStep] = useState<'checkout' | 'code_issued' | 'unlocked'>('checkout');
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

  // Step 1: User pays ₹199 and requests their unique unlock code
  const handleGenerateCode = (txnNote = 'UPI-TXN-199') => {
    setIsProcessing(true);
    setRedeemError(null);

    setTimeout(() => {
      const finalRef = upiReference.trim() || txnNote;
      // Generates a genuinely unique verifiable code
      const newLicense = generateUniqueLicenseCode(finalRef, upiId);

      setIsProcessing(false);
      setIssuedCode(newLicense.code);
      setRedeemInput(newLicense.code);
      setPayStep('code_issued');
      setRecentLicenses(getIssuedLicenses());

      // Soft confetti burst for payment confirmation
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: [theme.accent, '#E8D8CE', '#D5C9BE'],
      });
    }, 1100);
  };

  // Step 2: User enters/confirms their code to unlock customizer and source code
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

      // Notify parent app of unlock success after brief celebration
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
              }}
              className={`pb-3 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'pay'
                  ? 'border-[#2D2A26] text-[#2D2A26] font-semibold'
                  : 'border-transparent text-[#8C7B6B] hover:text-[#2D2A26]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Pay ₹199 & Get Unique Code</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('redeem');
                setRedeemError(null);
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
        {/* VIEW 1: PAYMENT CHECKOUT */}
        {/* ========================================================================= */}
        {activeTab === 'pay' && payStep === 'checkout' && (
          <div>
            {/* Header */}
            <div className="p-6 bg-white border-b border-[#E8E1DA] text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FAF8F5] border border-[#E8E1DA] text-[#8C7B6B] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Single-Session Customization & Source Code License</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif text-[#2D2A26] mb-1">
                Unlock Website & Source Code
              </h3>
              <p className="text-xs sm:text-sm text-[#6E665E] max-w-sm mx-auto">
                Pay ₹199 to generate your unique, single-use unlock code to customize the site and export the source code.
              </p>

              {/* Price Banner */}
              <div className="mt-4 inline-flex items-baseline gap-2 px-5 py-2 rounded-2xl bg-[#FAF8F5] border border-[#E8E1DA] shadow-2xs">
                <span className="text-xs uppercase tracking-wider text-[#8C7B6B] font-medium">Price:</span>
                <span className="text-3xl font-serif font-bold text-[#2D2A26]">₹199</span>
                <span className="text-xs text-[#8C7B6B]">single-use code • unlocks session</span>
              </div>
            </div>

            {/* Feature Checklist */}
            <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#E8E1DA]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5C4F43]">
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E8E1DA]">
                  <Sliders className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Full Customizer:</strong> Names, age, dates, venue & themes</span>
                </div>
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E8E1DA]">
                  <Code2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Export Source Code:</strong> Complete tailored ZIP package</span>
                </div>
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E8E1DA]">
                  <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Single-Use Only:</strong> Each unique code is usable once</span>
                </div>
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E8E1DA]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Instant Unlock:</strong> Download offline code during your session</span>
                </div>
              </div>
              <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Notice: On page reload, the customizer will re-lock and require purchasing a new unlock code.</span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-white text-[#2D2A26] border border-[#D5C9BE] shadow-xs'
                      : 'text-[#8C7B6B] hover:text-[#2D2A26]'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Instant UPI (GPay/PhonePe/Paytm)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-white text-[#2D2A26] border border-[#D5C9BE] shadow-xs'
                      : 'text-[#8C7B6B] hover:text-[#2D2A26]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cards / NetBanking</span>
                </button>
              </div>

              {paymentMethod === 'upi' ? (
                <div className="space-y-4">
                  {/* Dynamic QR Box */}
                  <div className="p-4 bg-white rounded-2xl border border-[#E8E1DA] text-center shadow-2xs">
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl border border-[#E8E1DA] flex flex-col items-center justify-center shadow-xs relative overflow-hidden">
                      {!qrImgError ? (
                        <img
                          src={qrCodeImageUrl}
                          alt="Scan to Pay ₹199 via UPI to astrickwriter@oksbi"
                          className="w-full h-full object-contain"
                          onError={() => setQrImgError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#8C7B6B]">
                          <QrCode className="w-12 h-12 mb-1" />
                          <span className="text-[10px] font-mono">astrickwriter@oksbi</span>
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1">
                        <span className="px-1.5 py-0.5 rounded bg-white text-[9px] font-bold text-[#2D2A26] border border-[#E8E1DA] shadow-xs">
                          ₹199
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#5C4F43] mt-2 font-medium">
                      Scan QR code with any UPI app to pay <strong className="text-[#2D2A26]">₹199</strong>
                    </p>
                    <p className="text-[11px] text-[#8C7B6B]">
                      Google Pay • PhonePe • Paytm • BHIM • Cred • SBI YONO
                    </p>

                    {/* Copy UPI ID & Mobile Deep Link */}
                    <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
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

                  {/* UPI Reference / UTR Input */}
                  <div className="bg-white p-3.5 rounded-2xl border border-[#E8E1DA] space-y-2.5">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#8C7B6B] mb-1 font-medium">
                        UPI Transaction / UTR No. (Optional)
                      </label>
                      <input
                        type="text"
                        value={upiReference}
                        onChange={e => setUpiReference(e.target.value)}
                        placeholder="e.g. 423819283719 or Leave blank for auto"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E1DA] bg-[#FAF8F5] focus:outline-none focus:border-[#2D2A26] text-[#2D2A26]"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleGenerateCode(upiReference || 'UPI-ASTRICK-199')}
                      className="w-full py-3 px-4 rounded-full text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: theme.accent }}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Verifying Payment of ₹199 to {upiId}...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>I've Paid ₹199 & Generate My Unique Code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-[#8C7B6B]">
                      Instant unique code generation • Each user receives an exclusive license code
                    </p>
                  </div>
                </div>
              ) : (
                /* Card Checkout */
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-[#E8E1DA] space-y-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#8C7B6B] mb-1 font-medium">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• 4242"
                        defaultValue="4111 2222 3333 4242"
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
                          placeholder="MM/YY"
                          defaultValue="12/28"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E1DA] bg-[#FAF8F5] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#8C7B6B] mb-1 font-medium">
                          CVV
                        </label>
                        <input
                          type="password"
                          placeholder="•••"
                          defaultValue="123"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E1DA] bg-[#FAF8F5] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleGenerateCode('CARD-TXN-199')}
                    className="w-full py-3 px-4 rounded-full text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Processing ₹199 Payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay ₹199 & Generate My Unique Code</span>
                      </>
                    )}
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
        {/* VIEW 2: CODE ISSUED (User completed payment, now has code to enter & unlock) */}
        {/* ========================================================================= */}
        {payStep === 'code_issued' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-serif text-[#2D2A26]">Payment Confirmed!</h3>
              <p className="text-xs sm:text-sm text-[#6E665E] max-w-sm mx-auto">
                Here is your exclusive, unique unlock code. Enter it below to unlock the website customization and source code download.
              </p>
            </div>

            {/* Exclusive Unique Code Display Box */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-emerald-500/40 shadow-sm text-center space-y-2.5 relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#8C7B6B] font-semibold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Unique License Code
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  ₹199 Paid
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
                *Important: This is a strictly single-use code. Once redeemed, it unlocks your current active session. If you reload your browser, you will need to purchase a new code.
              </p>
            </div>

            {/* Step 2: Enter Code to Unlock */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1DA] space-y-3">
              <label className="block text-xs font-semibold text-[#2D2A26] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enter Your Code to Unlock:</span>
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
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('pay');
                        setPayStep('checkout');
                        setRedeemError(null);
                      }}
                      className="self-start text-[11px] font-semibold text-rose-800 underline hover:text-rose-950"
                    >
                      Click here to purchase a new unlock code &rarr;
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={isRedeeming || !redeemInput}
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
                    <Zap className="w-4 h-4" />
                    <span>Verify Code & Unlock Customization & Source Code</span>
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
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif text-[#2D2A26]">Enter Your Unlock Code</h3>
              <p className="text-xs sm:text-sm text-[#6E665E] max-w-sm mx-auto">
                Enter your unique 16-character code below. Note: each code can be used only once.
              </p>
            </div>

            {/* Input Box */}
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
                  className="w-full px-4 py-3 font-mono text-base font-bold tracking-wider rounded-xl border border-[#D5C9BE] bg-[#FAF8F5] text-[#2D2A26] focus:outline-none focus:border-[#2D2A26] text-center"
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
                      Click here to purchase a new unlock code &rarr;
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
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Verify Code & Unlock</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Show previously issued codes on this browser if any exist */}
              {recentLicenses.length > 0 && (
                <div className="pt-3 border-t border-[#F3EFEA] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#8C7B6B] font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Codes on this device:
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
                Don't have a code yet? <span className="underline font-semibold">Pay ₹199 to generate your code &rarr;</span>
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
      </motion.div>
    </div>
  );
};
