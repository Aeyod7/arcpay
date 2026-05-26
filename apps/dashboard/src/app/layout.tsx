import './globals.css';
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'ArcPay - Stablecoin Operating System',
  description: 'Stablecoin payments, invoicing, and payout operating system built specifically for the Arc Network.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_ZmFrZS1jbGVyay1rZXktZm9yLWJ1aWxkLmNsZXJrLmFjY291bnRzLmRldiQ';

  const content = (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#faf9f9] text-[#1a1c1c] min-h-screen">
        {children}
      </body>
    </html>
  );

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {content}
    </ClerkProvider>
  );
}
