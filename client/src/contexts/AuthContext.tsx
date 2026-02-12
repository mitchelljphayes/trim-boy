import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  };

  useEffect(() => {
    // Timeout to prevent infinite loading if Supabase is slow/unreachable
    const AUTH_TIMEOUT_MS = 5000;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let resolved = false;

    const finishLoading = () => {
      if (!resolved) {
        resolved = true;
        if (timeoutId) clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    // Set a timeout fallback - if auth takes too long, proceed without session
    timeoutId = setTimeout(() => {
      if (!resolved) {
        console.warn('Auth initialization timed out, proceeding without session');
        finishLoading();
      }
    }, AUTH_TIMEOUT_MS);

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (resolved) return; // Already timed out
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          const profileData = await fetchProfile(session.user.id);
          if (!resolved) setProfile(profileData);
        } catch (err) {
          console.error('Error fetching profile during init:', err);
        }
      }

      finishLoading();
    }).catch((err) => {
      console.error('Error getting session:', err);
      finishLoading();
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile in background - don't block auth flow
          fetchProfile(session.user.id)
            .then((profileData) => setProfile(profileData))
            .catch((err) => console.error('Error fetching profile on auth change:', err));
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const formattedName = name.toUpperCase().slice(0, 8); // Match original 8-char limit
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: formattedName,
          },
        },
      });

      // If signup succeeded, create the profile
      if (!error && data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: formattedName,
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't fail the signup, profile can be created later
        }
      }

      return { error: error as Error | null };
    } catch (err) {
      console.error('SignUp exception:', err);
      return { error: err instanceof Error ? err : new Error('Sign up failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error as Error | null };
    } catch (err) {
      console.error('SignIn exception:', err);
      return { error: err instanceof Error ? err : new Error('Sign in failed') };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    // Clear any legacy localStorage items
    const keys = Object.keys(localStorage).filter(k => k.startsWith('trim_'));
    keys.forEach(k => localStorage.removeItem(k));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
