import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Check, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setEmail(userProfile.email);
    }
  }, [userProfile]);

  const principalId = identity?.getPrincipal().toString() ?? '';

  const handleCopy = async () => {
    if (!principalId) return;
    await navigator.clipboard.writeText(principalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Principal ID copied!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      await saveProfile({ name: name.trim(), email: email.trim() });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account information.
        </p>
      </div>

      {/* Avatar */}
      <div className="glass-card rounded-xl p-6 border border-border/30 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center flex-shrink-0">
          <User size={28} className="text-brand" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{userProfile?.name || 'User'}</p>
          <p className="text-sm text-muted-foreground">{userProfile?.email || 'No email set'}</p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 border border-border/30 space-y-5">
        <h2 className="text-lg font-semibold font-display text-foreground">Edit Profile</h2>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground font-medium">
            Name <span className="text-brand">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="bg-background border-border/50 focus:border-brand"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="bg-background border-border/50 focus:border-brand"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending || !name.trim()}
          className="bg-brand hover:bg-brand/90 text-white font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>

      {/* Principal ID */}
      <div className="glass-card rounded-xl p-6 border border-border/30 space-y-3">
        <h2 className="text-lg font-semibold font-display text-foreground">Internet Identity</h2>
        <p className="text-sm text-muted-foreground">Your unique principal ID on the Internet Computer.</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-background border border-border/50 rounded-lg px-3 py-2.5 text-muted-foreground font-mono break-all">
            {principalId || 'Not available'}
          </code>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopy}
            disabled={!principalId}
            className="flex-shrink-0 border-border/50 hover:border-brand/50"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
