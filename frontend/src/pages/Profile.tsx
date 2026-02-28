import React, { useState } from 'react';
import { User, Mail, Shield, Copy, Check, AlertCircle, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function Profile() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const principalId = identity?.getPrincipal().toString() ?? '';

  const handleCopy = () => {
    navigator.clipboard.writeText(principalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setName(profile?.name ?? '');
    setEmail(profile?.email ?? '');
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await saveProfile.mutateAsync({ name: name.trim(), email: email.trim() });
    setEditing(false);
  };

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Login Required</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Please log in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your BharatSMM account details.
        </p>
      </div>

      {/* Avatar & Name */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <>
                  <Skeleton className="h-6 w-32 bg-muted mb-2" />
                  <Skeleton className="h-4 w-48 bg-muted" />
                </>
              ) : profile ? (
                <>
                  <h2 className="font-display font-bold text-xl text-foreground">{profile.name}</h2>
                  {profile.email && (
                    <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      {profile.email}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">No profile set up yet</p>
              )}
            </div>
            {isFetched && profile && !editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="border-border text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit / Setup Form */}
      {(editing || (isFetched && !profile && !isLoading)) && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-semibold text-foreground">
              {profile ? 'Edit Profile' : 'Set Up Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name" className="text-foreground text-sm">
                  Full Name <span className="text-brand">*</span>
                </Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-email" className="text-foreground text-sm">
                  Email Address
                </Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-background border-border text-foreground"
                />
              </div>

              {saveProfile.isError && (
                <p className="text-sm text-destructive">
                  {saveProfile.error?.message ?? 'Failed to save profile.'}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={saveProfile.isPending || !name.trim()}
                  className="flex-1 brand-gradient text-white hover:opacity-90 font-semibold"
                >
                  {saveProfile.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Saving...
                    </span>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
                {editing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="border-border text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Principal ID */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand" />
            Principal ID
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
            <code className="text-xs text-muted-foreground font-mono flex-1 break-all">
              {principalId}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Copy principal ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This is your unique identity on the Internet Computer blockchain.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
