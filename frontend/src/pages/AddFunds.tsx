import React, { useState } from 'react';
import { Wallet, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useBalance } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { formatBalance } from '../utils/orderCalculations';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export default function AddFunds() {
  const { identity } = useInternetIdentity();
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Login Required</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Please log in to add funds to your account.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setSubmitted(true);
    setAmount('');
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Add Funds</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Top up your BharatSMM account balance.
        </p>
      </div>

      {/* Current Balance */}
      <Card className="bg-card border-border relative overflow-hidden">
        <div className="absolute inset-0 brand-gradient opacity-10 pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center flex-shrink-0">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              {balanceLoading ? (
                <Skeleton className="h-8 w-32 bg-muted mt-1" />
              ) : (
                <p className="text-3xl font-display font-bold text-foreground">
                  {formatBalance(balance ?? BigInt(0))}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300/80">
          <p className="font-medium text-blue-300 mb-1">How it works</p>
          <p>
            Submit a top-up request below. Our team will review and credit your account within 24 hours.
            Contact support with your transaction reference for faster processing.
          </p>
        </div>
      </div>

      {submitted && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-400 font-medium text-sm">Request submitted!</p>
            <p className="text-green-400/70 text-xs">
              Your top-up request is pending admin approval. We'll credit your account shortly.
            </p>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="ml-auto text-green-400/50 hover:text-green-400 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add Funds Form */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base font-semibold text-foreground">
            Request Top-Up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preset Amounts */}
            <div className="space-y-2">
              <Label className="text-foreground text-sm">Quick Select</Label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`py-2 rounded-lg text-sm font-medium transition-all border ${
                      amount === preset.toString()
                        ? 'brand-gradient text-white border-transparent'
                        : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-brand/50'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-foreground text-sm">
                Amount (₹) <span className="text-brand">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                className="bg-background border-border text-foreground"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full brand-gradient text-white hover:opacity-90 font-semibold h-11"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Submit Top-Up Request
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        For immediate assistance, contact our support team with your principal ID.
      </p>
    </div>
  );
}
