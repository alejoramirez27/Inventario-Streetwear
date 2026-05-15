'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            60 * 1000, // 1 min
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background:  '#18181b',
            border:      '1px solid #27272a',
            color:       '#e4e4e7',
            fontFamily:  'var(--font-sans)',
            fontSize:    '13px',
          },
          classNames: {
            success: 'toast-success',
            error:   'toast-error',
          },
        }}
      />
    </QueryClientProvider>
  )
}
