'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * Global error boundary — root layout алдаатай болоход ажиллана.
 * Энэ нь хамгийн сүүлийн шатны error handler юм.
 * Өөрийн html/body tag-ийг агуулах ёстой (layout ажиллахгүй учир).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry-д алдааг бүртгэх
    Sentry.captureException(error);
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html lang="mn">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#fafafa',
          color: '#1a1a1a',
        }}
      >
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
            <div
              style={{
                marginBottom: '1.5rem',
                display: 'inline-flex',
                height: '4rem',
                width: '4rem',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              }}
            >
              <svg
                style={{ height: '2rem', width: '2rem', color: '#ef4444' }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>

            <h1 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: 700 }}>
              Системийн алдаа
            </h1>

            <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Уучлаарай, системд алдаа гарлаа. Хуудсыг дахин ачааллана уу.
            </p>

            <button
              onClick={reset}
              style={{
                display: 'inline-flex',
                height: '2.5rem',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.375rem',
                backgroundColor: '#7c3aed',
                paddingLeft: '1.5rem',
                paddingRight: '1.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              Дахин оролдох
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
