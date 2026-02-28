import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, Zap, Shield, TrendingUp, Globe } from 'lucide-react';

const FEATURES = [
  {
    icon: <TrendingUp size={20} className="text-brand" />,
    title: 'Grow Your Presence',
    desc: 'Instagram, YouTube, TikTok, Twitter/X, Facebook & Telegram services.',
  },
  {
    icon: <Shield size={20} className="text-brand" />,
    title: 'Secure & Decentralized',
    desc: 'Powered by the Internet Computer — your data is safe and censorship-resistant.',
  },
  {
    icon: <Zap size={20} className="text-brand" />,
    title: 'Fast Delivery',
    desc: 'Orders processed quickly with real-time status tracking.',
  },
  {
    icon: <Globe size={20} className="text-brand" />,
    title: 'UPI Payments',
    desc: 'Easy top-up via UPI — pay as little as ₹1.',
  },
];

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border/30">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <img
            src="/assets/generated/bharatsmm-logo.dim_256x256.png"
            alt="BharatSMM"
            className="w-9 h-9 rounded-xl object-cover"
          />
          <span className="text-xl font-bold font-display text-foreground">BharatSMM</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/20 border border-brand/30 text-brand text-sm font-medium">
              <Zap size={14} />
              India's #1 SMM Panel
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold font-display text-foreground leading-tight">
              Boost Your Social Media{' '}
              <span className="brand-gradient bg-clip-text text-transparent">
                Instantly
              </span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Get real followers, likes, views, and more across all major platforms. 
              Affordable prices, fast delivery, and secure payments via UPI.
            </p>

            <button
              onClick={login}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-3 px-8 py-4 bg-brand hover:bg-brand/90 text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-brand disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Login to Get Started
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground">
              Secured by Internet Identity — no passwords needed.
            </p>
          </div>

          {/* Right: Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-5 border border-border/30 space-y-2"
              >
                <div className="w-9 h-9 rounded-lg bg-brand/20 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-border/30 text-center">
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} BharatSMM. Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
