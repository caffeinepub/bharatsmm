import React from 'react';
import { LogIn, Zap, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

const features = [
  { icon: Zap, title: 'Fast Delivery', desc: 'Orders processed within minutes' },
  { icon: Shield, title: 'Secure & Private', desc: 'Blockchain-powered identity' },
  { icon: TrendingUp, title: 'Grow Your Reach', desc: '17+ services across 6 platforms' },
];

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Login error:', err?.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo & Brand */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/bharatsmm-logo.dim_256x256.png"
              alt="BharatSMM"
              className="w-20 h-20 rounded-2xl object-cover shadow-brand"
            />
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">
              Bharat<span className="text-brand">SMM</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              India's Premier Social Media Marketing Panel
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
            >
              <div className="w-10 h-10 rounded-lg brand-gradient flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full brand-gradient text-white hover:opacity-90 font-semibold h-12 text-base"
        >
          {isLoggingIn ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              Connecting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              Login to BharatSMM
            </span>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Secured by Internet Identity — no passwords required
        </p>
      </div>
    </div>
  );
}
