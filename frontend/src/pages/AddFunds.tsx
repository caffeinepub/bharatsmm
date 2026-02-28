import { useState } from 'react';
import { useGetBalance, useInitiateTopUp } from '../hooks/useQueries';
import { formatBalance } from '../utils/orderCalculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wallet, Info, CheckCircle2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const SMALL_PRESETS = [5, 10, 20, 50];
const LARGE_PRESETS = [100, 200, 500, 1000];

const UPI_ID = '8825245372-l3c6@ibl';

export default function AddFunds() {
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: balance, isLoading: balanceLoading } = useGetBalance();
  const { mutateAsync: initiateTopUp, isPending } = useInitiateTopUp();

  const handlePreset = (val: number) => {
    setAmount(val.toString());
    setSuccess(false);
  };

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy UPI ID');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt < 1) {
      toast.error('Minimum top-up amount is ₹1');
      return;
    }
    try {
      await initiateTopUp({ amount: BigInt(amt), redirectUrl: window.location.href });
      setSuccess(true);
      toast.success('Top-up request submitted! Admin will verify and credit your balance.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit top-up request');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Add Funds</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Top up your BharatSMM wallet via UPI.
        </p>
      </div>

      {/* Current Balance */}
      <div className="glass-card rounded-xl p-5 border border-border/30 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand/20 flex items-center justify-center">
          <Wallet size={22} className="text-brand" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Current Balance</p>
          {balanceLoading ? (
            <Loader2 size={18} className="animate-spin text-muted-foreground mt-1" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{formatBalance(balance ?? BigInt(0))}</p>
          )}
        </div>
      </div>

      {/* QR Code Section */}
      <div className="glass-card rounded-xl p-6 border border-border/30 text-center space-y-4">
        <h2 className="text-lg font-semibold font-display text-foreground">Scan &amp; Pay via UPI</h2>

        <p className="text-sm font-medium text-brand">Scan with PhonePe or any UPI app</p>

        {/* PhonePe QR Code */}
        <div className="flex justify-center">
          <div className="p-3 bg-white rounded-2xl shadow-lg inline-block">
            <img
              src="/assets/generated/bharatsmm-phonepe-qr.dim_400x600.png"
              alt="PhonePe UPI QR Code – Mr Sandeep Kumar"
              className="w-52 object-contain"
            />
          </div>
        </div>

        {/* Account Holder Name */}
        <p className="text-sm font-semibold text-foreground tracking-wide">Mr Sandeep Kumar</p>

        {/* UPI ID Display */}
        <div className="mt-2 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Pay to this UPI ID using any UPI app (PhonePe, Google Pay, Paytm, etc.)
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 bg-muted/60 border border-border/40 rounded-lg px-4 py-2.5">
              <span className="font-mono text-sm font-semibold text-foreground select-all">
                {UPI_ID}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyUpi}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                copied
                  ? 'bg-green-500/20 text-green-400 border-green-500/40'
                  : 'bg-brand/20 text-brand border-brand/40 hover:bg-brand/30'
              }`}
              title="Copy UPI ID"
            >
              {copied ? (
                <>
                  <Check size={15} />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm">
        <Info size={18} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium mb-1">How it works</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-300/80">
            <li>Scan the QR code or copy the UPI ID and complete your payment</li>
            <li>Enter the amount below and submit your request</li>
            <li>Admin will verify your payment and credit your balance</li>
          </ol>
        </div>
      </div>

      {/* Amount Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 border border-border/30 space-y-5">
        <h2 className="text-lg font-semibold font-display text-foreground">Submit Top-up Request</h2>

        {/* Small Presets */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Quick Amounts</Label>
          <div className="flex flex-wrap gap-2">
            {SMALL_PRESETS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handlePreset(val)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  amount === val.toString()
                    ? 'bg-brand text-white border-brand'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border-border/30'
                }`}
              >
                ₹{val}
              </button>
            ))}
          </div>
        </div>

        {/* Large Presets */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Larger Amounts</Label>
          <div className="flex flex-wrap gap-2">
            {LARGE_PRESETS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handlePreset(val)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  amount === val.toString()
                    ? 'bg-brand text-white border-brand'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border-border/30'
                }`}
              >
                ₹{val}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-foreground font-medium">
            Amount (₹) <span className="text-brand">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
            <Input
              id="amount"
              type="number"
              min={1}
              placeholder="Enter amount (min ₹1)"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setSuccess(false); }}
              className="pl-7 bg-background border-border/50 focus:border-brand"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">Minimum top-up: ₹1</p>
        </div>

        {success ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
            <CheckCircle2 size={20} />
            <div>
              <p className="font-medium">Request Submitted!</p>
              <p className="text-sm text-green-400/80">
                Your top-up request for ₹{amount} has been submitted. Admin will verify and credit your balance shortly.
              </p>
            </div>
          </div>
        ) : (
          <Button
            type="submit"
            disabled={isPending || !amount || parseInt(amount) < 1}
            className="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Wallet size={16} className="mr-2" />
                Submit Top-up Request
              </>
            )}
          </Button>
        )}
      </form>
    </div>
  );
}
