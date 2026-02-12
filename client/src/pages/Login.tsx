import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { RetroButton } from '@/components/RetroButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
      } else {
        setLocation('/boot');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
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
            Agent Authentication
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-[hsl(var(--gb-light))] p-8 border-4 border-[hsl(var(--gb-dark))] shadow-[8px_8px_0px_0px_hsl(var(--gb-dark))]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] p-3 text-[10px] uppercase tracking-wider">
                ERROR: {error}
              </div>
            )}

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
                placeholder="********"
                className="w-full p-4 bg-[hsl(var(--gb-lightest))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] font-bold outline-none focus:bg-[hsl(var(--gb-light))] placeholder-[hsl(var(--gb-dark))]/50"
                required
              />
              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-[10px] text-[hsl(var(--gb-dark))] hover:text-[hsl(var(--gb-darkest))] underline hover:no-underline uppercase"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <RetroButton 
              type="submit" 
              disabled={loading}
              fullWidth
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </RetroButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-[hsl(var(--gb-dark))] uppercase">
              New Agent?{' '}
              <Link 
                href="/register" 
                className="text-[hsl(var(--gb-darkest))] underline hover:no-underline"
              >
                Register Here
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
