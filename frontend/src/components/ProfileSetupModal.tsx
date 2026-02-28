import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { User } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await saveProfile.mutateAsync({ name: name.trim(), email: email.trim() });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="bg-card border-border sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-display text-foreground">Welcome to BharatSMM!</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Set up your profile to get started.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-foreground">
              Full Name <span className="text-brand">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="bg-background border-border text-foreground"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-background border-border text-foreground"
            />
          </div>

          {saveProfile.isError && (
            <p className="text-sm text-destructive">
              {saveProfile.error?.message ?? 'Failed to save profile. Please try again.'}
            </p>
          )}

          <Button
            type="submit"
            disabled={saveProfile.isPending || !name.trim()}
            className="w-full brand-gradient text-white hover:opacity-90 font-semibold"
          >
            {saveProfile.isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </span>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
