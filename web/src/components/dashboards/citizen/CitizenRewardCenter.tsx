import React, { useState, useEffect } from 'react';
import {
  Award,
  Wallet,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Package,
  QrCode,
  Tag,
  Laptop,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { User, RewardCreditTransaction } from '../../../types';
import {
  getStoredRewardTransactions,
  saveRewardTransaction,
} from '../../../services/mockData';
import { updateUserRewardPoints } from '../../../services/auth';

interface CitizenRewardCenterProps {
  currentUser: User;
  onPointsUpdated?: (newPoints: number) => void;
  onNavigateTab?: (tab: string) => void;
}

export const CitizenRewardCenter: React.FC<CitizenRewardCenterProps> = ({
  currentUser,
  onPointsUpdated,
  onNavigateTab,
}) => {
  const [transactions, setTransactions] = useState<RewardCreditTransaction[]>(() =>
    getStoredRewardTransactions()
  );

  const currentBalance = currentUser.rewardPoints ?? 120;

  // Listen to external reward transactions
  useEffect(() => {
    const handleRewardsChange = () => {
      setTransactions(getStoredRewardTransactions());
    };
    window.addEventListener('reloop_rewards_changed', handleRewardsChange);
    return () => {
      window.removeEventListener('reloop_rewards_changed', handleRewardsChange);
    };
  }, []);

  // Conversion / Redemption form states
  const [convertAmount, setConvertAmount] = useState<number>(Math.min(50, currentBalance));
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank' | 'voucher'>('upi');
  
  // Method details
  const [payoutUpiId, setPayoutUpiId] = useState(
    currentUser.upiId || `${currentUser.email.split('@')[0]}@okhdfcbank`
  );
  const [payoutBankName, setPayoutBankName] = useState(
    currentUser.bankAccount?.bankName || 'HDFC Bank'
  );
  const [payoutAccountNo, setPayoutAccountNo] = useState(
    currentUser.bankAccount?.accountNumber || '50100489218451'
  );
  const [payoutIfsc, setPayoutIfsc] = useState(
    currentUser.bankAccount?.ifscCode || 'HDFC0000128'
  );
  const [payoutHolder, setPayoutHolder] = useState(
    currentUser.bankAccount?.accountHolderName || currentUser.name || 'Priya Sharma'
  );
  const [voucherBrand, setVoucherBrand] = useState<'Amazon Pay' | 'Flipkart' | 'Croma Green'>(
    'Amazon Pay'
  );

  // Redemption process state
  const [isProcessing, setIsProcessing] = useState(false);
  const [payoutReceipt, setPayoutReceipt] = useState<RewardCreditTransaction | null>(null);
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [redemptionError, setRedemptionError] = useState('');

  // History filtering & searching
  const [historyFilter, setHistoryFilter] = useState<'all' | 'earned' | 'redeemed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Compute summary stats
  const totalEarned = transactions
    .filter((t) => t.type === 'earned')
    .reduce((sum, t) => sum + t.points, 0);

  const totalRedeemed = transactions
    .filter((t) => t.type === 'redeemed')
    .reduce((sum, t) => sum + t.points, 0);

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (historyFilter === 'earned' && tx.type !== 'earned') return false;
    if (historyFilter === 'redeemed' && tx.type !== 'redeemed') return false;
    if (categoryFilter !== 'all' && tx.productCategory !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tx.productName.toLowerCase().includes(q);
      const matchCat = tx.productCategory.toLowerCase().includes(q);
      const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
      const matchId = tx.id.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchNotes && !matchId) return false;
    }
    return true;
  });

  const handleConvertPoints = (e: React.FormEvent) => {
    e.preventDefault();
    setRedemptionError('');

    if (convertAmount <= 0) {
      setRedemptionError('Please enter a valid points amount greater than 0');
      return;
    }

    if (convertAmount > currentBalance) {
      setRedemptionError(`You only have ${currentBalance} points available to redeem.`);
      return;
    }

    if (paymentMethod === 'upi' && !payoutUpiId.trim()) {
      setRedemptionError('Please enter a valid UPI VPA ID (e.g. mobile@upi or name@okhdfcbank)');
      return;
    }

    if (paymentMethod === 'bank' && (!payoutAccountNo.trim() || !payoutIfsc.trim())) {
      setRedemptionError('Please enter complete Bank Account Number and IFSC Code');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const newPointsBalance = currentBalance - convertAmount;
      const refNumber = `UTR-IMPS-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const txId = `RC-${Math.floor(800 + Math.random() * 200)}`;

      let destinationLabel = '';
      if (paymentMethod === 'upi') destinationLabel = `UPI: ${payoutUpiId.trim()}`;
      else if (paymentMethod === 'bank') destinationLabel = `Bank: ${payoutBankName} (A/C: ${payoutAccountNo.slice(-4)})`;
      else destinationLabel = `${voucherBrand} Eco-Voucher Code`;

      const newTx: RewardCreditTransaction = {
        id: txId,
        type: 'redeemed',
        points: convertAmount,
        amountINR: convertAmount,
        productName: `Cashback Payout (${convertAmount} Green Points)`,
        productCategory: 'Cashback Payout',
        date: new Date().toISOString(),
        status: 'redeemed',
        paymentMethod: destinationLabel,
        referenceNumber: refNumber,
        notes: `Instant payout transferred to ${destinationLabel}`,
      };

      // Save transaction & update user
      saveRewardTransaction(newTx);
      updateUserRewardPoints(newPointsBalance);
      if (onPointsUpdated) onPointsUpdated(newPointsBalance);

      setIsProcessing(false);
      setPayoutReceipt(newTx);
      setConvertAmount(Math.min(50, newPointsBalance));
    }, 1000);
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Laptop':
        return <Laptop className="w-4 h-4 text-blue-600" />;
      case 'Mobile':
        return <Smartphone className="w-4 h-4 text-emerald-600" />;
      case 'Printer':
        return <Package className="w-4 h-4 text-purple-600" />;
      case 'Charger / Cable':
        return <Tag className="w-4 h-4 text-amber-600" />;
      case 'Battery':
        return <Sparkles className="w-4 h-4 text-rose-600" />;
      case 'Cashback Payout':
        return <ArrowDownLeft className="w-4 h-4 text-amber-600" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. SCORE HERO BANNER & TOTAL CREDIT SCORE OVERVIEW */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
              <Award className="w-3.5 h-3.5" />
              <span>CPCB Verified Circular Reward Program</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Green Credit & Reward Score
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
              Turn your recycled electronics into direct financial rewards. Every discarded device verified by our informal collectors earns standardized CPCB green points convertible directly to real INR cashback.
            </p>
          </div>

          {/* Big Total Score Display */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center sm:text-right shrink-0 min-w-[200px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Total Available Score
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white font-display mt-1">
              {currentBalance}
              <span className="text-xl font-bold text-emerald-400 ml-1.5">pts</span>
            </div>
            <div className="mt-2 text-xs font-semibold text-emerald-200 bg-emerald-500/20 px-3 py-1 rounded-full inline-block">
              Guaranteed Value: ₹{currentBalance}.00 INR
            </div>
          </div>
        </div>

        {/* 3 Metric Cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <div className="text-emerald-300 font-semibold flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Lifetime Points Earned</span>
            </div>
            <div className="text-2xl font-black text-white mt-1 font-display">
              +{totalEarned} <span className="text-xs font-normal text-emerald-200">pts (₹{totalEarned})</span>
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">Across all completed device pickups</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <div className="text-amber-300 font-semibold flex items-center gap-1.5">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Total Cashback Redeemed</span>
            </div>
            <div className="text-2xl font-black text-white mt-1 font-display">
              ₹{totalRedeemed}.00
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">Dispatched to verified UPI & bank accounts</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <div className="text-teal-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conversion Exchange Rate</span>
            </div>
            <div className="text-2xl font-black text-white mt-1 font-display">
              1 Pt = ₹1.00
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">100% Brand Subsidized (No deductions)</div>
          </div>
        </div>
      </div>

      {/* 2. CASHBACK CONVERSION PORTAL & PAYMENT METHOD SELECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Instant Monetization
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
              Convert Points into Direct Cashback
            </h2>
            <p className="text-xs text-slate-500">
              Select how many points to cash out and choose your preferred settlement channel.
            </p>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('profile')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Manage Saved UPI & Bank</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {redemptionError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{redemptionError}</span>
          </div>
        )}

        <form onSubmit={handleConvertPoints} className="space-y-6">
          {/* Step A: Choose Points Amount */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 1: Choose Points to Convert
            </label>
            <div className="flex flex-wrap gap-2.5 items-center">
              {[25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setConvertAmount(Math.min(amt, currentBalance))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    convertAmount === amt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {amt} pts (₹{amt})
                </button>
              ))}

              <button
                type="button"
                onClick={() => setConvertAmount(currentBalance)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  convertAmount === currentBalance && currentBalance > 0
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                All Balance ({currentBalance} pts)
              </button>

              <div className="flex items-center gap-1.5 ml-auto w-full sm:w-auto mt-2 sm:mt-0">
                <span className="text-xs text-slate-500 font-semibold">Custom:</span>
                <input
                  type="number"
                  min="1"
                  max={currentBalance}
                  value={convertAmount || ''}
                  onChange={(e) => setConvertAmount(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-500 font-semibold">pts</span>
              </div>
            </div>
          </div>

          {/* Step B: Choose Payment Method */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 2: Select Payout Channel
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* UPI Option */}
              <div
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Instant Fast Payout
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 mt-2.5">UPI Transfer (VPA)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm, BHIM</div>
              </div>

              {/* Direct Bank Option */}
              <div
                onClick={() => setPaymentMethod('bank')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'bank'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    IMPS Direct
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 mt-2.5">Bank Account Transfer</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Direct to Account Number & IFSC</div>
              </div>

              {/* Gift Voucher Option */}
              <div
                onClick={() => setPaymentMethod('voucher')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'voucher'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                    <Gift className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    Instant Voucher
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 mt-2.5">Eco-Shopping Voucher</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Amazon Pay, Flipkart, or Croma</div>
              </div>
            </div>
          </div>

          {/* Step C: Method Configuration Fields */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            {paymentMethod === 'upi' && (
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">
                  Destination UPI Virtual Payment Address (VPA)
                </label>
                <div className="relative max-w-md">
                  <input
                    type="text"
                    value={payoutUpiId}
                    onChange={(e) => setPayoutUpiId(e.target.value)}
                    placeholder="e.g. priya@okhdfcbank or 9876543210@upi"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Funds will be credited to this UPI VPA via NPCI instant settlement rail.
                </span>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={payoutBankName}
                    onChange={(e) => setPayoutBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Holder</label>
                  <input
                    type="text"
                    value={payoutHolder}
                    onChange={(e) => setPayoutHolder(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Number</label>
                  <input
                    type="text"
                    value={payoutAccountNo}
                    onChange={(e) => setPayoutAccountNo(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={payoutIfsc}
                    onChange={(e) => setPayoutIfsc(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono uppercase"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'voucher' && (
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">
                  Select Partner Eco-Voucher Provider
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Amazon Pay', 'Flipkart', 'Croma Green'] as const).map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setVoucherBrand(brand)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                        voucherBrand === brand
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Gift voucher code will be issued instantly and sent to your registered email/WhatsApp.
                </span>
              </div>
            )}
          </div>

          {/* Conversion Calculation & Action */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <span>Points to Redeem: <strong className="text-slate-900">{convertAmount} pts</strong></span>
                <span>•</span>
                <span>Payout Amount: <strong className="text-emerald-700 text-sm">₹{convertAmount}.00 INR</strong></span>
                <span>•</span>
                <span className="text-slate-500">Processing Fee: ₹0.00</span>
              </div>
              <div className="text-[11px] text-emerald-800">
                New remaining balance will be: <strong>{Math.max(0, currentBalance - convertAmount)} pts</strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || convertAmount <= 0 || convertAmount > currentBalance}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payout...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Convert Points & Transfer ₹{convertAmount} Cashback</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. INDIVIDUAL PRODUCT-BY-PRODUCT SCORE HISTORY */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Audit Transparency
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
              Individual Product Score History
            </h2>
            <p className="text-xs text-slate-500">
              Granular breakdown showing which score point came from which specific discarded electronic product, along with redemptions.
            </p>
          </div>

          {/* Filters and search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setHistoryFilter('earned')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'earned'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Points Earned (+)
              </button>
              <button
                onClick={() => setHistoryFilter('redeemed')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'redeemed'
                    ? 'bg-white text-amber-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cashback (-)
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search product..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-36 sm:w-44"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No score history entries found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const isEarned = tx.type === 'earned';
              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isEarned
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {getCategoryIcon(tx.productCategory)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{tx.productName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {tx.productCategory}
                        </span>
                        {tx.weightKg && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold">
                            {tx.weightKg} kg
                          </span>
                        )}
                        {tx.pickupRequestId && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-mono">
                            Ref: {tx.pickupRequestId}
                          </span>
                        )}
                      </div>

                      {tx.notes && (
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          {tx.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>{new Date(tx.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                        {tx.paymentMethod && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600 font-medium">To: {tx.paymentMethod}</span>
                          </>
                        )}
                        {tx.referenceNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-500">Ref: {tx.referenceNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Points / Amount Badge */}
                  <div className="text-right shrink-0 sm:self-center">
                    <div
                      className={`text-base font-black font-display ${
                        isEarned ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {isEarned ? `+${tx.points} pts` : `-${tx.points} pts`}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {isEarned ? `₹${tx.amountINR} Value` : `₹${tx.amountINR} Cashback`}
                    </div>
                    <span
                      className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isEarned
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isEarned ? 'Product Credited' : 'Cashback Paid'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. INSTANT PAYOUT RECEIPT MODAL */}
      {payoutReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Receipt Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Instant Settlement Dispatched
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Cashback Successfully Transferred!
              </h3>
              <div className="text-3xl font-black text-emerald-600 font-display">
                ₹{payoutReceipt.amountINR}.00 INR
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{payoutReceipt.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Points Redeemed:</span>
                <span className="font-bold text-slate-900">{payoutReceipt.points} Green Points</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Destination Account:</span>
                <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">
                  {payoutReceipt.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Bank UTR / Ref No:</span>
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-800">
                  <span>{payoutReceipt.referenceNumber}</span>
                  <button
                    onClick={() => payoutReceipt.referenceNumber && handleCopyUtr(payoutReceipt.referenceNumber)}
                    className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    title="Copy UTR"
                  >
                    {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Transfer Time:</span>
                <span className="font-medium text-slate-700">
                  {new Date(payoutReceipt.date).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center">
              A copy of this digital settlement slip has been logged in your CPCB verified chain-of-custody ledger.
            </div>

            <button
              onClick={() => setPayoutReceipt(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Done & Return to Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
