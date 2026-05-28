import React from 'react';
import type { Metadata } from 'next';
import PublicReceiptClient from './receipt-client';

// Dynamic metadata based on invoice data (fetched at request time)
export async function generateMetadata({ params }: { params: { invoiceId: string } }): Promise<Metadata> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
    const res = await fetch(`${apiUrl}/api/invoices/${params.invoiceId}`, {
      next: { revalidate: 60 }
    });
    const data = await res.json();

    if (data.success && data.invoice) {
      const inv = data.invoice;
      const status = inv.status === 'paid' ? '✅ PAID' : `⏳ ${inv.status.toUpperCase()}`;
      const title = `ArcPay Receipt — ${inv.invoiceNumber || 'Invoice'} — ${status}`;
      const description = `${inv.clientName} • ${inv.description} • $${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC on Arc Network`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'website',
          siteName: 'ArcPay',
          images: [{
            url: `${process.env.NEXT_PUBLIC_RECEIPT_BASE_URL || 'https://arcpaye.com'}/og-receipt.png`,
            width: 1200,
            height: 630,
            alt: `ArcPay Receipt — ${inv.amount} USDC`
          }]
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description
        }
      };
    }
  } catch (e) {
    // Fall through to default metadata
  }

  return {
    title: 'ArcPay Receipt',
    description: 'Cryptographically verified receipt on the Arc Network',
    openGraph: {
      title: 'ArcPay Receipt',
      description: 'View your cryptographically verified payment receipt on the Arc Network'
    }
  };
}

export default function ReceiptPage() {
  return <PublicReceiptClient />;
}
