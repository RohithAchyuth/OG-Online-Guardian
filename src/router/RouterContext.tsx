import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Normalize path to clean standard routes: '/', '/login', '/register', '/dashboard', '/onboarding', '/personal', '/personal/apps', '/personal/lookalike', '/personal/social', '/access-pending', '/account-setup'
function normalizePath(rawPath: string): string {
  const p = rawPath.trim().toLowerCase();
  if (!p || p === '/' || p === '/home' || p === '/landing') return '/';
  if (p === '/login' || p === '/signin') return '/login';
  if (p === '/register' || p === '/signup') return '/register';
  if (p === '/access-pending' || p === '/pending') return '/access-pending';
  if (p === '/account-setup') return '/personal';
  if (p === '/personal' || p === '/personal/overview') return '/personal';
  if (p === '/personal/apps' || p === '/personal/app-monitoring') return '/personal/apps';
  if (p === '/personal/lookalike' || p === '/personal/look-alike') return '/personal/lookalike';
  if (p === '/personal/social' || p === '/personal/social-monitoring') return '/personal/social';
  if (p.startsWith('/dashboard')) return '/dashboard';
  if (p.startsWith('/onboarding')) return '/onboarding';
  return p;
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return normalizePath(window.location.pathname);
    }
    return '/';
  });

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const target = normalizePath(to);
    if (target === path) {
      return;
    }
    console.log(`[SentinelGuard Navigation] Navigating to: "${target}" (current: "${path}", replace: ${Boolean(options?.replace)})`);

    if (typeof window !== 'undefined') {
      if (options?.replace) {
        window.history.replaceState({}, '', target);
      } else {
        window.history.pushState({}, '', target);
      }
    }
    setPath(target);
  }, [path]);

  useEffect(() => {
    const handlePopState = () => {
      const current = normalizePath(window.location.pathname);
      console.log(`[SentinelGuard Navigation] PopState event detected. Setting path: "${current}"`);
      setPath(current);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return ctx;
};
