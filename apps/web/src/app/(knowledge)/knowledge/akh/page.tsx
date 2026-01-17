/**
 * Alifh Knowledge Hub - About
 * Clean, professional introduction to AKH
 * Bilingual: English & Arabic
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, BookOpen, Wrench, FileText, Scale } from 'lucide-react';
import { useLanguage } from '../../_components/language-context';
import { useAside } from '../../_components/aside-context';

// Aside summary content
const asideSummary = {
  en: {
    title: 'Quick look',
    items: [
      { icon: BookOpen, label: '4 topic areas' },
      { icon: FileText, label: 'In-depth guides' },
      { icon: Wrench, label: 'Free tools' },
      { icon: Scale, label: 'UAE-focused' },
    ],
    footer: 'Updated regularly',
  },
  ar: {
    title: 'نظرة سريعة',
    items: [
      { icon: BookOpen, label: '٤ مجالات' },
      { icon: FileText, label: 'أدلة شاملة' },
      { icon: Wrench, label: 'أدوات مجانية' },
      { icon: Scale, label: 'خاص بالإمارات' },
    ],
    footer: 'يُحدّث بانتظام',
  },
};

// Content translations
const content = {
  en: {
    welcome: 'Welcome',
    title: 'Alifh Knowledge Hub',
    intro: 'Everything you need to know about buying, owning, and selling cars in the UAE. Free, clear, and always up-to-date.',
    whatIsIt: 'What is this?',
    whatIsItText1: 'A free library of guides, tools, and resources for anyone navigating the UAE automotive market.',
    whatIsItText2: "Whether you're buying your first car, selling a used vehicle, or just trying to understand insurance and registration—we've compiled the information you actually need in plain language.",
    whyExists: 'Why does this exist?',
    whyExistsText1: "Buying a car in the UAE can be confusing. What's GCC-spec? How do you check a VIN? What paperwork do you need at RTA? The answers exist, but they're scattered across forums, buried in documents, or only known to industry insiders.",
    whyExistsText2: 'We built this to change that. One place with clear, honest information—so you can make confident decisions without needing years of experience.',
    whatsInside: "What's inside",
    tools: 'Tools',
    toolsDesc: 'Free utilities to help you make informed decisions.',
    alwaysFree: 'Always free.',
    alwaysFreeText: 'This is not a sales pitch. Whether you use Alifh or not, this knowledge is yours. We believe informed buyers make the entire market better.',
    learnMore: 'Learn more',
    sections: {
      gettingStarted: { title: 'Getting Started', desc: 'VIN numbers, GCC specs, and inspection basics.' },
      buying: { title: 'Buying & Selling', desc: 'Valuation, negotiation, and market dynamics.' },
      legal: { title: 'Legal & Finance', desc: 'Insurance, registration, and RTA procedures.' },
      maintenance: { title: 'Maintenance', desc: 'Care, service schedules, and preservation.' },
      vinDecoder: { title: 'VIN Decoder', desc: "Instantly decode any vehicle's specs." },
      compareCars: { title: 'Compare Cars', desc: 'Compare up to 3 cars side by side.' },
      valuation: { title: 'Car Valuation', desc: 'AI-powered market value estimates.' },
    },
  },
  ar: {
    welcome: 'مرحباً',
    title: 'مركز معرفة أليف',
    intro: 'كل ما تحتاج معرفته عن شراء وامتلاك وبيع السيارات في الإمارات. مجاني، واضح، ومحدّث دائماً.',
    whatIsIt: 'ما هذا؟',
    whatIsItText1: 'مكتبة مجانية من الأدلة والأدوات والموارد لأي شخص يتعامل مع سوق السيارات الإماراتي.',
    whatIsItText2: 'سواء كنت تشتري سيارتك الأولى، أو تبيع سيارة مستعملة، أو تحاول فهم التأمين والتسجيل—جمعنا لك المعلومات التي تحتاجها فعلاً بلغة بسيطة.',
    whyExists: 'لماذا أنشأنا هذا؟',
    whyExistsText1: 'شراء سيارة في الإمارات قد يكون محيراً. ما معنى مواصفات خليجية؟ كيف تفحص رقم الهيكل VIN؟ ما الأوراق المطلوبة في هيئة الطرق؟ الإجابات موجودة، لكنها متناثرة في المنتديات أو مدفونة في المستندات.',
    whyExistsText2: 'أنشأنا هذا لتغيير ذلك. مكان واحد بمعلومات واضحة وصادقة—لتتخذ قراراتك بثقة دون الحاجة لسنوات من الخبرة.',
    whatsInside: 'ماذا ستجد هنا',
    tools: 'الأدوات',
    toolsDesc: 'أدوات مجانية لمساعدتك في اتخاذ قرارات مدروسة.',
    alwaysFree: 'مجاني دائماً.',
    alwaysFreeText: 'هذا ليس عرضاً تسويقياً. سواء استخدمت أليف أم لا، هذه المعرفة لك. نؤمن أن المشتري المطّلع يرفع مستوى السوق بأكمله.',
    learnMore: 'اقرأ المزيد',
    sections: {
      gettingStarted: { title: 'البداية', desc: 'رقم الهيكل، المواصفات الخليجية، وأساسيات الفحص.' },
      buying: { title: 'البيع والشراء', desc: 'التقييم، التفاوض، وديناميكيات السوق.' },
      legal: { title: 'القانون والمالية', desc: 'التأمين، التسجيل، وإجراءات هيئة الطرق.' },
      maintenance: { title: 'الصيانة', desc: 'العناية، جداول الخدمة، والحفاظ على السيارة.' },
      vinDecoder: { title: 'فك رمز VIN', desc: 'فك رمز مواصفات أي سيارة فوراً.' },
      compareCars: { title: 'مقارنة السيارات', desc: 'قارن حتى ٣ سيارات جنباً إلى جنب.' },
      valuation: { title: 'تقييم السيارة', desc: 'تقديرات القيمة السوقية بالذكاء الاصطناعي.' },
    },
  },
};

export default function AKHPage() {
  const { language, isRTL } = useLanguage();
  const { setContent } = useAside();
  const t = content[language];
  const aside = asideSummary[language];
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // Set aside content on mount and language change
  useEffect(() => {
    setContent(
      <div className="space-y-4">
        <span className="block text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
          {aside.title}
        </span>
        <div className="space-y-3">
          {aside.items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground/70">
                <Icon className="size-4 text-muted-foreground/60" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
        <div className="pt-3 border-t border-border/20">
          <span className="text-xs text-muted-foreground/50">{aside.footer}</span>
        </div>
      </div>
    );
    
    return () => setContent(null);
  }, [language, aside, setContent]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
            {t.welcome}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {t.intro}
        </p>
      </header>

      {/* What is this */}
      <section className="space-y-4">
        <h2 className="text-[15px] font-bold tracking-tight">{t.whatIsIt}</h2>
        
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>{t.whatIsItText1}</p>
          <p>{t.whatIsItText2}</p>
        </div>
      </section>

      {/* Why this exists */}
      <section className="space-y-4">
        <h2 className="text-[15px] font-bold tracking-tight">{t.whyExists}</h2>
        
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>{t.whyExistsText1}</p>
          <p>{t.whyExistsText2}</p>
        </div>
      </section>

      {/* What you'll find */}
      <section className="space-y-4">
        <h2 className="text-[15px] font-bold tracking-tight">{t.whatsInside}</h2>
        
        <div className="rounded-xl border border-border/40 bg-sidebar divide-y divide-border/20">
          <Link 
            href="/knowledge/basics" 
            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
          >
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors">{t.sections.gettingStarted.title}</h3>
              <p className="text-xs text-muted-foreground/70">{t.sections.gettingStarted.desc}</p>
            </div>
            <Arrow className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </Link>

          <Link 
            href="/knowledge/buying" 
            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
          >
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors">{t.sections.buying.title}</h3>
              <p className="text-xs text-muted-foreground/70">{t.sections.buying.desc}</p>
            </div>
            <Arrow className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </Link>

          <Link 
            href="/knowledge/legal" 
            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
          >
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors">{t.sections.legal.title}</h3>
              <p className="text-xs text-muted-foreground/70">{t.sections.legal.desc}</p>
            </div>
            <Arrow className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </Link>

          <Link 
            href="/knowledge/maintenance" 
            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
          >
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors">{t.sections.maintenance.title}</h3>
              <p className="text-xs text-muted-foreground/70">{t.sections.maintenance.desc}</p>
            </div>
            <Arrow className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </Link>
        </div>
      </section>

      {/* Tools */}
      <section className="space-y-4">
        <h2 className="text-[15px] font-bold tracking-tight">{t.tools}</h2>
        
        <p className="text-sm text-muted-foreground">
          {t.toolsDesc}
        </p>

        <div className="rounded-xl border border-border/40 bg-sidebar divide-y divide-border/20">
          <Link 
            href="/tools/vin-decoder" 
            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
          >
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors">{t.sections.vinDecoder.title}</h3>
              <p className="text-xs text-muted-foreground/70">{t.sections.vinDecoder.desc}</p>
            </div>
            <Arrow className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </Link>

          <Link 
            href="/tools/compare" 
            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
          >
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors">{t.sections.compareCars.title}</h3>
              <p className="text-xs text-muted-foreground/70">{t.sections.compareCars.desc}</p>
            </div>
            <Arrow className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </Link>

          <Link 
            href="/tools/valuation" 
            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors">{t.sections.valuation.title}</h3>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 rounded">Beta</span>
              </div>
              <p className="text-xs text-muted-foreground/70">{t.sections.valuation.desc}</p>
            </div>
            <Arrow className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </Link>
        </div>
      </section>

      {/* Note */}
      <div className="rounded-xl bg-sidebar border border-border/40 p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="font-semibold text-foreground">{t.alwaysFree}</strong> {t.alwaysFreeText}
        </p>
      </div>
    </div>
  );
}
