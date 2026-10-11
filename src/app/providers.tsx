'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/auth-context'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            unstyled: true,
            className:
              'w-full flex items-center gap-3 p-4 bg-black text-white border border-black font-mono text-xs uppercase tracking-widest shadow-none',
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}
