/**
 * Pricing PDF Generator
 * Clean, breathable PDF export for partner plans
 * Matches Alifh design system: rounded-xl cards, semibold labels, proper spacing
 */

'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface FeatureCategory {
  name: string;
  features: {
    name: string;
    description?: string;
    flow?: boolean | string | number;
    black?: boolean | string | number;
  }[];
}

interface BlackFeatureCategory {
  name: string;
  features: {
    name: string;
    description?: string;
  }[];
}

interface PricingPdfGeneratorProps {
  flowCategories: FeatureCategory[];
  blackCategories: BlackFeatureCategory[];
}

export function PricingPdfGenerator({ flowCategories, blackCategories }: PricingPdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleDownload = async () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Alifh Partner Plans</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #000;
      color: #fafafa;
      font-size: 12px;
      line-height: 1.5;
    }
    
    .page {
      background: #000;
      padding: 40px 48px;
    }
    
    /* Header */
    .header {
      display: table;
      width: 100%;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #222;
    }
    
    .header-left { display: table-cell; vertical-align: middle; }
    .header-right { display: table-cell; vertical-align: middle; text-align: right; }
    
    .logo {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #fff;
    }
    
    .header-subtitle {
      font-size: 11px;
      color: #71717a;
      margin-top: 2px;
    }
    
    .header-date {
      font-size: 11px;
      color: #71717a;
    }
    
    /* Pricing Table */
    .pricing-table {
      width: 100%;
      margin-bottom: 36px;
      border-collapse: collapse;
    }
    
    .pricing-table td {
      padding: 24px 28px;
      background: #111;
      vertical-align: top;
    }
    
    .pricing-table td:first-child {
      border-right: 1px solid #222;
    }
    
    .plan-name {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #71717a;
      margin-bottom: 12px;
    }
    
    .plan-price {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -1px;
      color: #fafafa;
      margin-bottom: 6px;
    }
    
    .plan-price span {
      font-size: 13px;
      font-weight: 500;
      color: #71717a;
    }
    
    .plan-detail {
      font-size: 12px;
      color: #71717a;
    }
    
    /* Page break spacer */
    .page-spacer {
      height: 40px;
    }
    
    /* Section */
    .section {
      margin-bottom: 28px;
    }
    
    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #fafafa;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #222;
    }
    
    .section-title span {
      color: #3b82f6;
    }
    
    .section-title .dim {
      color: #71717a;
    }
    
    /* Feature Table */
    .feature-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .feature-table th {
      text-align: left;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #52525b;
      padding: 8px 0;
      border-bottom: 1px solid #1a1a1a;
    }
    
    .feature-table td {
      padding: 10px 0;
      border-bottom: 1px solid #111;
      vertical-align: top;
    }
    
    .feature-table tr:last-child td {
      border-bottom: none;
    }
    
    .cat-name {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #52525b;
      padding-top: 4px;
    }
    
    .feature-name {
      font-size: 12px;
      font-weight: 500;
      color: #e4e4e7;
    }
    
    .feature-desc {
      font-size: 11px;
      color: #71717a;
      margin-top: 2px;
    }
    
    /* Footer */
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #222;
      display: table;
      width: 100%;
    }
    
    .footer-left { display: table-cell; vertical-align: middle; }
    .footer-right { display: table-cell; vertical-align: middle; text-align: right; }
    
    .footer-text {
      font-size: 11px;
      color: #52525b;
      line-height: 1.6;
    }
    
    .footer-text strong {
      color: #71717a;
    }
    
    .footer-link {
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="page">
  
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="logo">Alifh</div>
        <div class="header-subtitle">Partner Plans</div>
      </div>
      <div class="header-right">
        <div class="header-date">${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
      </div>
    </div>
    
    <!-- Pricing -->
    <table class="pricing-table">
      <tr>
        <td width="50%">
          <div class="plan-name">Flow</div>
          <div class="plan-price">AED 7,000 <span>/mo</span></div>
          <div class="plan-detail">Per showroom · Billed monthly</div>
        </td>
        <td width="50%">
          <div class="plan-name">Black</div>
          <div class="plan-price">AED 21,000 <span>+</span></div>
          <div class="plan-detail">Limited availability · Custom pricing</div>
        </td>
      </tr>
    </table>

    <!-- Flow Features -->
    <div class="section">
      <div class="section-title"><span>Flow</span> <span class="dim">— Full Platform</span></div>
      <table class="feature-table">
        <tr>
          <th width="20%">Category</th>
          <th>Features</th>
        </tr>
        ${flowCategories.map((category, idx) => `
        ${category.name === 'Team Management' ? '<tr><td colspan="2" style="height: 40px; border: none;"></td></tr>' : ''}
        <tr>
          <td class="cat-name">${category.name}</td>
          <td>
            ${category.features.map(feature => `
            <div style="margin-bottom: 8px;">
              <div class="feature-name">${feature.name}</div>
              ${feature.description ? `<div class="feature-desc">${feature.description}</div>` : ''}
            </div>
            `).join('')}
          </td>
        </tr>
        `).join('')}
      </table>
    </div>
    
    <!-- Black Features -->
    <div class="section" style="padding-top: 40px;">
      <div class="section-title"><span class="dim">Black</span> — Additional Extras</div>
      <table class="feature-table">
        <tr>
          <th width="20%">Category</th>
          <th>Features</th>
        </tr>
        ${blackCategories.map(category => `
        <tr>
          <td class="cat-name">${category.name}</td>
          <td>
            ${category.features.map(feature => `
            <div style="margin-bottom: 8px;">
              <div class="feature-name">${feature.name}</div>
              ${feature.description ? `<div class="feature-desc">${feature.description}</div>` : ''}
            </div>
            `).join('')}
          </td>
        </tr>
        `).join('')}
      </table>
    </div>
    
    <!-- Spacer to push footer to bottom -->
    <div style="height: 85px;"></div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-left">
        <div class="footer-text">
          <strong>Same platform. Same rankings.</strong><br/>
          Black is branding—not advantage.
        </div>
      </div>
      <div class="footer-right">
        <div class="footer-text">
          <a class="footer-link" href="https://alifh.ae">alifh.ae</a><br/>
          Zero commission · Unlimited listings
        </div>
      </div>
    </div>
    
  </div>
</body>
</html>`;

    setIsGenerating(true);
    
    try {
      // Dynamic import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Create a container element
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);
      
      // Wait for fonts to load
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = container.querySelector('.page') as HTMLElement;
      
      const opt = {
        margin: 0,
        filename: 'alifh-partner-plans.pdf',
        image: { type: 'jpeg' as const, quality: 1 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#000000',
          logging: false,
        },
        jsPDF: { 
          unit: 'mm' as const, 
          format: 'a4' as const, 
          orientation: 'portrait' as const
        },
        pagebreak: { mode: 'avoid-all' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
      
      // Cleanup
      document.body.removeChild(container);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center justify-center gap-2.5 h-12 px-8 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download PDF
        </>
      )}
    </button>
  );
}
