'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  PanelLeftClose, 
  PanelLeft, 
  Menu, 
  BookOpen, 
  Compass, 
  ShoppingBag, 
  Scale, 
  Wrench,
  LayoutGrid,
  ScanLine,
  GitCompare,
  Sparkles,
  Moon,
  Languages,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useLanguage } from './language-context';

// Navigation items - each is a section/page
const knowledgeItems = [
  { label: 'About AKH', labelAr: 'عن المركز', href: '/knowledge/akh', icon: BookOpen, exact: true },
  { label: 'Getting Started', labelAr: 'البداية', href: '/knowledge/basics', icon: Compass },
  { label: 'Buying & Selling', labelAr: 'البيع والشراء', href: '/knowledge/buying', icon: ShoppingBag },
  { label: 'Legal & Finance', labelAr: 'القانون والمالية', href: '/knowledge/legal', icon: Scale },
  { label: 'Maintenance', labelAr: 'الصيانة', href: '/knowledge/maintenance', icon: Wrench },
];

const toolItems = [
  { label: 'All Tools', labelAr: 'الأدوات', href: '/tools', icon: LayoutGrid, exact: true },
  { label: 'VIN Decoder', labelAr: 'فك رمز VIN', href: '/tools/vin-decoder', icon: ScanLine },
  { label: 'Compare Cars', labelAr: 'مقارنة السيارات', href: '/tools/compare', icon: GitCompare },
  { label: 'Car Valuation', labelAr: 'تقييم السيارة', href: '/tools/valuation', icon: Sparkles, badge: 'Beta' },
];

// Language Toggle Component
function LanguageToggle({ isCollapsed }: { isCollapsed?: boolean }) {
  const { language, setLanguage } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        'flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-all duration-150 w-full',
        'text-foreground/70 hover:bg-muted/60 hover:text-foreground',
        isCollapsed && 'justify-center px-0'
      )}
      title={isCollapsed ? (language === 'en' ? 'العربية' : 'English') : undefined}
    >
      <Languages className="h-4 w-4 text-muted-foreground/70" />
      {!isCollapsed && (
        <span className="text-[13px] font-medium">
          {language === 'en' ? 'العربية' : 'English'}
        </span>
      )}
    </button>
  );
}

interface KnowledgeSidebarProps {
  className?: string;
}

export function KnowledgeSidebar({ className }: KnowledgeSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-theme-menu]')) {
        setShowThemeMenu(false);
      }
    };

    if (showThemeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showThemeMenu]);

  // Active state logic - exact or child paths
  const isActive = (href: string, exact?: boolean) => {
    // For exact match requirement
    if (exact) {
      return pathname === href;
    }
    
    // Match exact or child paths
    if (pathname === href) return true;
    if (pathname.startsWith(href + '/')) return true;
    
    return false;
  };

  // Theme-aware logo
  const logoSrc = mounted && (resolvedTheme === 'dark' || resolvedTheme === 'charcoal')
    ? "/assets/Alifh_logo_White.svg" 
    : "/assets/Alifh_logo_Black.svg";

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'charcoal', label: 'Charcoal' }
  ];

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out',
        // macOS-style translucent sidebar
        'bg-muted/30 backdrop-blur-xl',
        isCollapsed ? 'w-[52px]' : 'w-[220px]',
        className
      )}
    >
      <div className="sticky top-0 h-screen flex flex-col py-5 px-3">
        {/* Header - Logo + Collapse Toggle */}
        <div className={cn(
          'flex items-center mb-6',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {/* Logo - Home Link */}
          <Link
            href="/"
            className="flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity"
            title="Back to Alifh"
          >
            {isCollapsed ? (
              <Image
                src={logoSrc}
                alt="Alifh"
                width={24}
                height={24}
                className="h-5 w-5 object-contain"
              />
            ) : (
              <Image
                src={logoSrc}
                alt="Alifh"
                width={72}
                height={20}
                className="h-5 w-auto"
              />
            )}
          </Link>

          {/* Collapse Toggle */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full h-6 mb-4 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        {/* Navigation - macOS Finder style */}
        <nav className="flex-1 space-y-6 overflow-y-auto">
          {/* Knowledge Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="block text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider px-2 mb-2">
                {language === 'ar' ? 'المعرفة' : 'Knowledge'}
              </span>
            )}
            {knowledgeItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              const label = language === 'ar' ? item.labelAr : item.label;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-all duration-150',
                    active 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground/70 hover:bg-muted/60 hover:text-foreground',
                    isCollapsed && 'justify-center px-0'
                  )}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className={cn(
                    'h-4 w-4 flex-shrink-0 transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground/80'
                  )} />
                  {!isCollapsed && (
                    <span className="text-[13px] font-medium truncate">{label}</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Tools Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="block text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider px-2 mb-2">
                {language === 'ar' ? 'الأدوات' : 'Tools'}
              </span>
            )}
            {isCollapsed && <div className="h-px bg-border/40 mx-2 my-2" />}
            {toolItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              const label = language === 'ar' ? item.labelAr : item.label;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-all duration-150',
                    active 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground/70 hover:bg-muted/60 hover:text-foreground',
                    isCollapsed && 'justify-center px-0'
                  )}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className={cn(
                    'h-4 w-4 flex-shrink-0 transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground/80'
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="text-[13px] font-medium truncate">{label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer - Language & Theme Toggle */}
        <div className={cn(
          'pt-4 mt-auto border-t border-border/30 space-y-1',
          isCollapsed ? 'flex flex-col items-center' : ''
        )}>
          {/* Language Toggle */}
          <LanguageToggle isCollapsed={isCollapsed} />
          
          {/* Theme Toggle */}
          <div className="relative" data-theme-menu>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowThemeMenu(!showThemeMenu);
              }}
              className={cn(
                'flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-all duration-150 w-full',
                'text-foreground/70 hover:bg-muted/60 hover:text-foreground',
                isCollapsed && 'justify-center px-0'
              )}
              title={isCollapsed ? 'Theme' : undefined}
            >
              <Moon className="h-4 w-4 text-muted-foreground/70" />
              {!isCollapsed && (
                <span className="text-[13px] font-medium">Theme</span>
              )}
            </button>

            {showThemeMenu && (
              <div 
                className={cn(
                  "absolute bottom-full mb-2 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-50 overflow-hidden",
                  isCollapsed ? "left-0 w-32" : "left-0 right-0 w-full"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1.5">
                  {themes.map((themeOption) => (
                    <button
                      key={themeOption.value}
                      onClick={() => {
                        setTheme(themeOption.value);
                        setShowThemeMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[13px] font-medium tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-between"
                    >
                      <span>{themeOption.label}</span>
                      {theme === themeOption.value && (
                        <CheckCircle2 className="size-3.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

// Mobile sidebar - macOS sheet style
export function MobileKnowledgeSidebar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-mobile-theme-menu]')) {
        setShowThemeMenu(false);
      }
    };

    if (showThemeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showThemeMenu]);

  // Active state logic - exact or child paths
  const isActive = (href: string, exact?: boolean) => {
    // For exact match requirement
    if (exact) {
      return pathname === href;
    }
    
    // Match exact or child paths
    if (pathname === href) return true;
    if (pathname.startsWith(href + '/')) return true;
    
    return false;
  };

  // Theme-aware logo
  const logoSrc = mounted && (resolvedTheme === 'dark' || resolvedTheme === 'charcoal')
    ? "/assets/Alifh_logo_White.svg" 
    : "/assets/Alifh_logo_Black.svg";

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'charcoal', label: 'Charcoal' }
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed bottom-6 left-6 z-50 h-11 w-11 rounded-full bg-foreground text-background shadow-lg hover:bg-foreground/90"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 bg-background/95 backdrop-blur-xl">
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="p-5 border-b border-border/30">
            <Link href="/" onClick={() => setOpen(false)} className="inline-block opacity-90 hover:opacity-100 transition-opacity">
              <Image
                src={logoSrc}
                alt="Alifh"
                width={72}
                height={20}
                className="h-5 w-auto"
              />
              <SheetTitle className="sr-only">Alifh Knowledge Hub</SheetTitle>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
            {/* Knowledge Section */}
            <div className="space-y-1">
              <span className="block text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider px-2 mb-2">
                {language === 'ar' ? 'المعرفة' : 'Knowledge'}
              </span>
              {knowledgeItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                const label = language === 'ar' ? item.labelAr : item.label;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150',
                      active 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-foreground/70 hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <Icon className={cn(
                      'h-[18px] w-[18px] flex-shrink-0',
                      active ? 'text-primary' : 'text-muted-foreground/70'
                    )} />
                    <span className="text-[14px] font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Tools Section */}
            <div className="space-y-1">
              <span className="block text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider px-2 mb-2">
                {language === 'ar' ? 'الأدوات' : 'Tools'}
              </span>
              {toolItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                const label = language === 'ar' ? item.labelAr : item.label;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150',
                      active 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-foreground/70 hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <Icon className={cn(
                      'h-[18px] w-[18px] flex-shrink-0',
                      active ? 'text-primary' : 'text-muted-foreground/70'
                    )} />
                    <span className="text-[14px] font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer - Language & Theme Toggle */}
          <div className="p-3 border-t border-border/30 space-y-1">
            {/* Language Toggle */}
            <LanguageToggle />
            
            {/* Theme Toggle */}
            <div className="relative" data-mobile-theme-menu>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowThemeMenu(!showThemeMenu);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-foreground/70 hover:bg-muted/60 hover:text-foreground"
              >
                <Moon className="h-[18px] w-[18px] text-muted-foreground/70" />
                <span className="text-[14px] font-medium">Theme</span>
              </button>

              {showThemeMenu && (
                <div 
                  className="absolute bottom-full left-0 right-0 mb-2 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1.5">
                    {themes.map((themeOption) => (
                      <button
                        key={themeOption.value}
                        onClick={() => {
                          setTheme(themeOption.value);
                          setShowThemeMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[14px] font-medium tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-between"
                      >
                        <span>{themeOption.label}</span>
                        {theme === themeOption.value && (
                          <CheckCircle2 className="size-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
