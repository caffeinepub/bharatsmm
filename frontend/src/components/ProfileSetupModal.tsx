import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    try {
      await saveProfile({ name: name.trim(), email: email.trim() });
      toast.success('Profile saved! Welcome to BharatSMM 🎉');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save profile');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md bg-card border-border/50" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/assets/generated/bharatsmm-logo.dim_256x256.png"
              alt="BharatSMM"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <DialogTitle className="text-xl font-bold font-display">Welcome to BharatSMM!</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Please set up your profile to get started with social media marketing services.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
              Your Name <span className="text-brand">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border/50 focus:border-brand"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email Address <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border/50 focus:border-brand"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending || !name.trim()}
            className="w-full bg-brand hover:bg-brand/90 text-white font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
