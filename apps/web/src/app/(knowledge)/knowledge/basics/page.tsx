/**
 * Getting Started - Library Index
 * All foundational guides for car buyers
 */

'use client';

import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../_components/language-context';

const content = {
  en: {
    section: 'Knowledge',
    title: 'Getting Started',
    intro: 'The fundamentals every car buyer should know.',
    introHighlight: 'VIN numbers, GCC specifications, inspection checklists, and essential terminology.',
    tip: 'Use our',
    compareTool: 'Compare Cars tool',
    tipEnd: 'to evaluate options side by side.',
    guidesTitle: 'Guides',
    learnMore: 'Learn more',
    comingSoon: 'More guides coming soon',
    guides: [
      {
        title: 'What is a VIN Number?',
        description: 'Complete guide to Vehicle Identification Numbers.',
        href: '/knowledge/basics/vin-guide',
        readTime: '5 min',
      },
      {
        title: 'How to Compare Cars',
        description: 'Using our side-by-side comparison tool.',
        href: '/knowledge/basics/compare-guide',
        readTime: '3 min',
      },
    ],
  },
  ar: {
    section: 'المعرفة',
    title: 'البداية',
    intro: 'الأساسيات التي يجب أن يعرفها كل مشتري سيارة.',
    introHighlight: 'أرقام VIN، المواصفات الخليجية، قوائم الفحص، والمصطلحات الأساسية.',
    tip: 'استخدم',
    compareTool: 'أداة مقارنة السيارات',
    tipEnd: 'لتقييم الخيارات جنباً إلى جنب.',
    guidesTitle: 'الأدلة',
    learnMore: 'اقرأ المزيد',
    comingSoon: 'المزيد من الأدلة قريباً',
    guides: [
      {
        title: 'ما هو رقم VIN؟',
        description: 'دليل شامل لأرقام تعريف المركبات.',
        href: '/knowledge/basics/vin-guide',
        readTime: '٥ دقائق',
      },
      {
        title: 'كيف تقارن السيارات',
        description: 'استخدام أداة المقارنة جنباً إلى جنب.',
        href: '/knowledge/basics/compare-guide',
        readTime: '٣ دقائق',
      },
    ],
  },
};

export default function BasicsPage() {
  const { language, isRTL } = useLanguage();
  const t = content[language];
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
            {t.section}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xl">
          {t.intro} <span className="text-blue-500">{t.introHighlight}</span>
        </p>
        <p className="text-xs text-muted-foreground/50">
          {t.tip} <Link href="/tools/compare" className="text-blue-500 hover:text-blue-600">{t.compareTool}</Link> {t.tipEnd}
        </p>
      </header>

      {/* Guides List */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">{t.guidesTitle}</h2>
        </div>
        
        <div className="space-y-3">
          {t.guides.map((guide, index) => (
            <div 
              key={guide.href}
              className={`flex items-start justify-between py-2 ${index > 0 ? 'border-t border-border/20' : ''}`}
            >
              <div className="space-y-0.5 flex-1">
                <h3 className="text-sm font-medium">{guide.title}</h3>
                <p className="text-xs text-muted-foreground/60">{guide.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground/40">{guide.readTime}</span>
                <Link href={guide.href} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors">
                  {t.learnMore} <Arrow className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}

          {t.guides.length <= 2 && (
            <p className="text-xs text-muted-foreground/50 py-4 text-center">
              {t.comingSoon}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
