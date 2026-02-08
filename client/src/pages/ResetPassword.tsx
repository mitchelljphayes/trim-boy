import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { RetroButton } from '@/components/RetroButton';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if we have a valid recovery session
    // Supabase automatically handles the token from the URL hash
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setValidSession(!!session);
    };
    
    // Listen for auth state changes (recovery link will trigger this)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
      } else if (session) {
        setValidSession(true);
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        setLocation('/dashboard');
      }, 2000);
    }
  };

  // Still checking session
  if (validSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--gb-lightest))]">
        <div className="text-2xl font-bold text-[hsl(var(--gb-darkest))]">
          VERIFYING...
        </div>
      </div>
    );
  }

  // No valid session - invalid or expired link
  if (!validSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[hsl(var(--gb-lightest))]">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-[hsl(var(--gb-darkest))] text-shadow-sm mb-2">
              TRIM
            </h1>
            <div className="h-1 w-24 bg-[hsl(var(--gb-darkest))] mx-auto" />
          </div>

          <div className="bg-[hsl(var(--gb-light))] p-8 border-4 border-[hsl(var(--gb-dark))] shadow-[8px_8px_0px_0px_hsl(var(--gb-dark))]">
            <div className="space-y-6">
              <div className="bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] p-4 text-[10px] uppercase tracking-wider text-center">
                INVALID OR EXPIRED LINK
              </div>
              <p className="text-xs text-[hsl(var(--gb-dark))] text-center">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/forgot-password">
                <RetroButton fullWidth>
                  REQUEST NEW LINK
                </RetroButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Set New Password
          </p>
        </div>

        {/* Form */}
        <div className="bg-[hsl(var(--gb-light))] p-8 border-4 border-[hsl(var(--gb-dark))] shadow-[8px_8px_0px_0px_hsl(var(--gb-dark))]">
          
          {success ? (
            <div className="space-y-6">
              <div className="bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] p-4 text-[10px] uppercase tracking-wider text-center">
                PASSWORD UPDATED SUCCESSFULLY
              </div>
              <p className="text-xs text-[hsl(var(--gb-dark))] text-center">
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] p-3 text-[10px] uppercase tracking-wider">
                  ERROR: {error}
                </div>
              )}

              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="block text-xs uppercase text-[hsl(var(--gb-darkest))]"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full p-4 bg-[hsl(var(--gb-lightest))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] font-bold outline-none focus:bg-[hsl(var(--gb-light))] placeholder-[hsl(var(--gb-dark))]/50"
                  autoFocus
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-xs uppercase text-[hsl(var(--gb-darkest))]"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  className="w-full p-4 bg-[hsl(var(--gb-lightest))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] font-bold outline-none focus:bg-[hsl(var(--gb-light))] placeholder-[hsl(var(--gb-dark))]/50"
                  required
                  minLength={6}
                />
              </div>

              <RetroButton 
                type="submit" 
                disabled={loading}
                fullWidth
              >
                {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </RetroButton>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-[10px] text-[hsl(var(--gb-dark))]/60">
          © 1989-2026 TRIM CORP
        </div>
      </div>
    </div>
  );
}
