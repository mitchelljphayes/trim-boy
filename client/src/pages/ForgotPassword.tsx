import { useState } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { RetroButton } from '@/components/RetroButton';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[hsl(var(--gb-lightest))]">
      <div className="w-full max-w-md">
        
        {/* Retro Header */}
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-[hsl(var(--gb-darkest))] text-shadow-sm mb-2">
            TRIM
          </h1>
          <div className="h-1 w-24 bg-[hsl(var(--gb-darkest))] mx-auto" />
          <p className="text-xs md:text-sm text-[hsl(var(--gb-dark))] uppercase">
            Password Recovery
          </p>
        </div>

        {/* Form */}
        <div className="bg-[hsl(var(--gb-light))] p-8 border-4 border-[hsl(var(--gb-dark))] shadow-[8px_8px_0px_0px_hsl(var(--gb-dark))]">
          
          {success ? (
            <div className="space-y-6">
              <div className="bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] p-4 text-[10px] uppercase tracking-wider text-center">
                CHECK YOUR EMAIL FOR RESET LINK
              </div>
              <p className="text-xs text-[hsl(var(--gb-dark))] text-center">
                If an account exists for {email}, you will receive a password reset link shortly.
              </p>
              <Link href="/login">
                <RetroButton fullWidth>
                  RETURN TO LOGIN
                </RetroButton>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] p-3 text-[10px] uppercase tracking-wider">
                  ERROR: {error}
                </div>
              )}

              <p className="text-xs text-[hsl(var(--gb-dark))]">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="block text-xs uppercase text-[hsl(var(--gb-darkest))]"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@trim.corp"
                  className="w-full p-4 bg-[hsl(var(--gb-lightest))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] font-bold outline-none focus:bg-[hsl(var(--gb-light))] placeholder-[hsl(var(--gb-dark))]/50"
                  autoFocus
                  required
                />
              </div>

              <RetroButton 
                type="submit" 
                disabled={loading}
                fullWidth
              >
                {loading ? 'SENDING...' : 'SEND RESET LINK'}
              </RetroButton>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-[10px] text-[hsl(var(--gb-dark))] uppercase">
              Remember your password?{' '}
              <Link 
                href="/login" 
                className="text-[hsl(var(--gb-darkest))] underline hover:no-underline"
              >
                Login Here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-[10px] text-[hsl(var(--gb-dark))]/60">
          © 1989-2026 TRIM CORP
        </div>
      </div>
    </div>
  );
}
