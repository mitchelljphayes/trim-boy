import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { RetroButton } from '@/components/RetroButton';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (name.length === 0) {
      setError('Agent name is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, name);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Auto-login after signup (if email confirmation is disabled)
      setLoading(false);
      setLocation('/boot');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[hsl(var(--gb-lightest))]">
      <div className="w-full max-w-md">
        
        {/* Retro Header */}
        <div className="mb-8 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-[hsl(var(--gb-darkest))] text-shadow-sm mb-2">
            TRIM
          </h1>
          <div className="h-1 w-24 bg-[hsl(var(--gb-darkest))] mx-auto" />
          <p className="text-xs md:text-sm text-[hsl(var(--gb-dark))] uppercase">
            New Agent Registration
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-[hsl(var(--gb-light))] p-8 border-4 border-[hsl(var(--gb-dark))] shadow-[8px_8px_0px_0px_hsl(var(--gb-dark))]">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <div className="bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] p-3 text-[10px] uppercase tracking-wider">
                ERROR: {error}
              </div>
            )}

            <div className="space-y-2">
              <label 
                htmlFor="name" 
                className="block text-xs uppercase text-[hsl(var(--gb-darkest))]"
              >
                Agent Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 8))}
                placeholder="PLAYER 1"
                className="w-full p-4 bg-[hsl(var(--gb-lightest))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] font-bold outline-none focus:bg-[hsl(var(--gb-light))] placeholder-[hsl(var(--gb-dark))]/50"
                autoFocus
                required
              />
              <p className="text-[10px] text-right text-[hsl(var(--gb-dark))]">
                {name.length}/8 CHARS
              </p>
            </div>

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
                required
              />
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-xs uppercase text-[hsl(var(--gb-darkest))]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full p-4 bg-[hsl(var(--gb-lightest))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] font-bold outline-none focus:bg-[hsl(var(--gb-light))] placeholder-[hsl(var(--gb-dark))]/50"
                required
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
                placeholder="Repeat password"
                className="w-full p-4 bg-[hsl(var(--gb-lightest))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] font-bold outline-none focus:bg-[hsl(var(--gb-light))] placeholder-[hsl(var(--gb-dark))]/50"
                required
              />
            </div>

            <RetroButton 
              type="submit" 
              disabled={loading}
              fullWidth
            >
              {loading ? 'INITIALIZING...' : 'CREATE ACCOUNT'}
            </RetroButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-[hsl(var(--gb-dark))] uppercase">
              Already Registered?{' '}
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
        <div className="mt-8 text-center text-[10px] text-[hsl(var(--gb-dark))]/60">
          © 1989-2026 TRIM CORP
        </div>
      </div>
    </div>
  );
}
