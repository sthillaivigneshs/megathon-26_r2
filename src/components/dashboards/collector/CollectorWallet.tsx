import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Building2,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Search,
  Scale,
  Award,
  ChevronRight,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { User, RewardCreditTransaction } from '../../../types';
import { getStoredRewardTransactions, saveRewardTransaction } from '../../../services/mockData';
import { updateUserProfile } from '../../../services/auth';

interface CollectorWalletProps {
  currentUser: User;
  onProfileUpdated?: (updatedUser: User) => void;
  onNavigateTab?: (tab: string) => void;
}

export const CollectorWallet: React.FC<CollectorWalletProps> = ({
  currentUser,
  onProfileUpdated,
  onNavigateTab,
}) => {
  const [transactions, setTransactions] = useState<RewardCreditTransaction[]>(() =>
    getStoredRewardTransactions()
  );

  const balanceINR = currentUser.walletBalanceINR ?? 3000;

  useEffect(() => {
    const handleRewardsChanged = () => {
      setTransactions(getStoredRewardTransactions());
    };
    window.addEventListener('reloop_rewards_changed', handleRewardsChanged);
    return () => {
      window.removeEventListener('reloop_rewards_changed', handleRewardsChanged);
    };
  }, []);

  // Filter for this collector or generic collector rewards
  const collectorTxs = transactions.filter(
    (tx) => tx.actorId === currentUser.id || tx.actorId === 'usr_collector_01' || tx.productCategory === 'Bonus' || tx.productName.includes('Collector')
  );

  // Transfer state
  const [withdrawAmount, setWithdrawAmount] = useState<number>(Math.min(1500, balanceINR));
  const [paymentChannel, setPaymentChannel] = useState<'upi' | 'bank'>('upi');
  const [payoutUpiId, setPayoutUpiId] = useState(currentUser.upiId || 'rajesh@upi');
  const [payoutBankName, setPayoutBankName] = useState(
    currentUser.bankAccount?.bankName || 'State Bank of India'
  );
  const [payoutAccountNo, setPayoutAccountNo] = useState(
    currentUser.bankAccount?.accountNumber || '30987654321098'
  );
  const [payoutIfsc, setPayoutIfsc] = useState(
    currentUser.bankAccount?.ifscCode || 'SBIN0001234'
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [payoutReceipt, setPayoutReceipt] = useState<RewardCreditTransaction | null>(null);
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'earned' | 'payout'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (withdrawAmount <= 0) {
      setErrorMessage('Please enter an amount greater than 0');
      return;
    }

    if (withdrawAmount > balanceINR) {
      setErrorMessage(`Insufficient wallet balance. Available: ₹${balanceINR.toLocaleString('en-IN')}`);
      return;
    }

    if (paymentChannel === 'upi' && !payoutUpiId.trim()) {
      setErrorMessage('Please provide a valid UPI VPA ID');
      return;
    }

    if (paymentChannel === 'bank' && (!payoutAccountNo.trim() || !payoutIfsc.trim())) {
      setErrorMessage('Please provide valid Account Number and IFSC Code');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const newBalance = balanceINR - withdrawAmount;
      const refNumber = `UTR-NPCI-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const destination =
        paymentChannel === 'upi'
          ? `UPI: ${payoutUpiId.trim()}`
          : `Bank: ${payoutBankName} (A/C: ...${payoutAccountNo.slice(-4)})`;

      const newTx: RewardCreditTransaction = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'redeemed',
        points: withdrawAmount,
        amountINR: withdrawAmount,
        productName: `Instant Cash Payout to ${paymentChannel.toUpperCase()}`,
        productCategory: 'Cashback Payout',
        date: new Date().toISOString(),
        status: 'redeemed',
        paymentMethod: destination,
        referenceNumber: refNumber,
        notes: `IMPS instant settlement disbursed to ${destination}`,
        actorId: currentUser.id,
      };

      saveRewardTransaction(newTx);
      const updated = updateUserProfile({ walletBalanceINR: newBalance });
      if (updated && onProfileUpdated) {
        onProfileUpdated(updated);
      }

      setIsProcessing(false);
      setPayoutReceipt(newTx);
      setWithdrawAmount(Math.min(1000, newBalance));
    }, 900);
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const filteredTxs = collectorTxs.filter((t) => {
    if (filterType === 'earned' && t.type !== 'earned') return false;
    if (filterType === 'payout' && t.type !== 'redeemed') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.productName.toLowerCase().includes(q);
      const matchNotes = t.notes ? t.notes.toLowerCase().includes(q) : false;
      const matchRef = t.referenceNumber ? t.referenceNumber.toLowerCase().includes(q) : false;
      return matchName || matchNotes || matchRef;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. WALLET HERO HEADER */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
              <Wallet className="w-3.5 h-3.5" />
              <span>Collector Direct Payout System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Collector Earnings &amp; Wallet
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
              Real-time earnings from verified doorstep e-waste collections, digital scale accuracy bonuses, and recycler material sales settlements.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center sm:text-right shrink-0 min-w-[220px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Available Balance
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white font-display mt-1">
              ₹{balanceINR.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-xs font-semibold text-emerald-200 bg-emerald-500/20 px-3 py-1 rounded-full inline-block">
              Ready for Instant UPI / IMPS Payout
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <div className="text-emerald-300 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Material Sales</span>
            </div>
            <div className="text-xl font-bold text-white mt-1 font-display">₹2,450</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Recycler verified weight</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <div className="text-teal-300 font-semibold flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3" />
              <span>Handover Rewards</span>
            </div>
            <div className="text-xl font-bold text-white mt-1 font-display">+ ₹320</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Doorstep pickup incentive</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <div className="text-amber-300 font-semibold flex items-center gap-1">
              <Scale className="w-3 h-3" />
              <span>Accuracy Bonus</span>
            </div>
            <div className="text-xl font-bold text-white mt-1 font-display">+ ₹80</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Scale match within 4%</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <div className="text-blue-300 font-semibold flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>Hub Route Bonus</span>
            </div>
            <div className="text-xl font-bold text-white mt-1 font-display">+ ₹150</div>
            <div className="text-[10px] text-slate-300 mt-0.5">High-trust recycler partner</div>
          </div>
        </div>
      </div>

      {/* 2. TRANSFER FUNDS FORM */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Instant Cash Settlement
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
              Withdraw Earnings to UPI or Bank
            </h2>
            <p className="text-xs text-slate-500">
              Disburse your earnings directly to your bank account or registered UPI ID via IMPS instant rails.
            </p>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('profile')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Edit Saved Bank / UPI</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-5">
          {/* Quick preset chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Amount to Withdraw
            </label>
            <div className="flex flex-wrap gap-2.5 items-center">
              {[500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setWithdrawAmount(Math.min(amt, balanceINR))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    withdrawAmount === amt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setWithdrawAmount(balanceINR)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  withdrawAmount === balanceINR && balanceINR > 0
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                Entire Balance (₹{balanceINR.toLocaleString('en-IN')})
              </button>

              <div className="flex items-center gap-1.5 ml-auto w-full sm:w-auto mt-2 sm:mt-0">
                <span className="text-xs text-slate-500 font-semibold">Custom: ₹</span>
                <input
                  type="number"
                  min="1"
                  max={balanceINR}
                  value={withdrawAmount || ''}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Payout Channel
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setPaymentChannel('upi')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentChannel === 'upi'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Instant (0s)
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 mt-2">UPI Virtual Payment Address</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{payoutUpiId}</div>
              </div>

              <div
                onClick={() => setPaymentChannel('bank')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentChannel === 'bank'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
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
                <div className="font-bold text-xs text-slate-900 mt-2">{payoutBankName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  A/C: ...{payoutAccountNo.slice(-4)} • {payoutIfsc}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              Transferring: <strong className="text-emerald-700 text-sm">₹{withdrawAmount.toLocaleString('en-IN')}</strong>
              <span className="mx-2">•</span>
              Zero processing fee
              <span className="mx-2">•</span>
              Remaining balance: <strong>₹{(balanceINR - withdrawAmount).toLocaleString('en-IN')}</strong>
            </div>

            <button
              type="submit"
              disabled={isProcessing || withdrawAmount <= 0 || withdrawAmount > balanceINR}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transferring Funds...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Disburse ₹{withdrawAmount.toLocaleString('en-IN')} Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. TRANSACTION HISTORY */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Audit Trail
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Collector Wallet Activity
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('earned')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'earned' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Earnings (+)
              </button>
              <button
                onClick={() => setFilterType('payout')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'payout' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Payouts (-)
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-36 sm:w-48"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {filteredTxs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No transactions found matching your filter criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTxs.map((tx) => {
              const isEarned = tx.type === 'earned';
              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isEarned
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {isEarned ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{tx.productName}</span>
                        {tx.pickupRequestId && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-mono">
                            Ref: {tx.pickupRequestId}
                          </span>
                        )}
                      </div>
                      {tx.notes && <p className="text-slate-500 text-[11px]">{tx.notes}</p>}
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>{new Date(tx.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                        {tx.paymentMethod && <span>• {tx.paymentMethod}</span>}
                        {tx.referenceNumber && <span className="font-mono">• Ref: {tx.referenceNumber}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-base font-black font-display ${
                        isEarned ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {isEarned ? `+₹${tx.amountINR}` : `-₹${tx.amountINR}`}
                    </div>
                    <span
                      className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isEarned ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isEarned ? 'Settlement Credited' : 'Transferred'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. RECEIPT MODAL */}
      {payoutReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Disbursement Complete
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Disbursed to Collector Account
              </h3>
              <div className="text-3xl font-black text-emerald-600 font-display">
                ₹{payoutReceipt.amountINR.toLocaleString('en-IN')} INR
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{payoutReceipt.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Destination Account:</span>
                <span className="font-semibold text-slate-900">{payoutReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">NPCI / Bank UTR:</span>
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-800">
                  <span>{payoutReceipt.referenceNumber}</span>
                  <button
                    onClick={() => payoutReceipt.referenceNumber && handleCopyUtr(payoutReceipt.referenceNumber)}
                    className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  >
                    {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-medium text-slate-700">
                  {new Date(payoutReceipt.date).toLocaleTimeString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setPayoutReceipt(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
