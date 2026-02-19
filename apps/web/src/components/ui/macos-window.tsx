/**
 * MacOS Window Component
 * Reusable macOS Sequoia-style browser/window frame
 * Matches latest macOS design language with:
 * - RevvUp logo in glass bubble style
 * - Compact glass pill URL bar (left-aligned)
 * - Unified background (no separate title bar color)
 * - Glass/frosted bubble UI elements
 * - Hidden delights for the curious
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Messages for logo clicks - cycling through with personality
const LOGO_MESSAGES = [
  "Yeah, we know we're better",
  "Stop clicking, go find your next car",
  "Built different. Literally.",
  "You found us. Now what.",
  "This button doesn't do anything... or does it",
  "We put more effort into this than some entire apps",
  "Still here. Impressive dedication.",
  "The cars were inside you all along",
  "You've unlocked nothing. Congratulations.",
  "Okay now you're just showing off",
];

// Messages for URL bar clicks
const URL_BAR_MESSAGES = [
  "Mehhhhhh",
  "Nice try, this isn't a real browser",
  "localhost is where the heart is",
  "You cannot hack us through here",
  "The URL is merely a suggestion",
  "This is not the address bar you're looking for",
  "Error 418: I'm a teapot",
];

// Typewriter Toast Component
function TypewriterToast({ 
  message, 
  onComplete 
}: { 
  message: string; 
  onComplete: () => void;
}) {
  const [displayText, setDisplayText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start expansion
    requestAnimationFrame(() => setIsExpanded(true));
    
    let currentIndex = 0;
    const typeSpeed = Math.max(20, Math.min(40, 800 / message.length));
    
    const typeNextChar = () => {
      if (currentIndex < message.length) {
        setDisplayText(message.slice(0, currentIndex + 1));
        currentIndex++;
        timeoutRef.current = setTimeout(typeNextChar, typeSpeed);
      } else {
        setIsComplete(true);
        // Hold for a moment, then fade out
        timeoutRef.current = setTimeout(() => {
          setIsExpanded(false);
          setTimeout(onComplete, 300);
        }, 1800);
      }
    };

    // Small delay before starting to type
    timeoutRef.current = setTimeout(typeNextChar, 150);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [message, onComplete]);

  return (
    <div 
      className={cn(
        "absolute top-14 left-1/2 z-50 transition-all duration-300 ease-out",
        isExpanded ? "opacity-100 -translate-x-1/2 translate-y-0" : "opacity-0 -translate-x-1/2 -translate-y-2"
      )}
    >
      <div 
        className={cn(
          "bg-transparent backdrop-blur-2xl border border-white/[0.12] rounded-full shadow-2xl overflow-hidden transition-all duration-300 ease-out",
          isExpanded ? "px-5 py-2.5" : "px-0 py-0"
        )}
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <span className="text-sm text-white/90 font-medium whitespace-nowrap">
          {displayText}
          <span 
            className={cn(
              "inline-block w-[2px] h-[14px] bg-white/60 ml-0.5 align-middle transition-opacity",
              isComplete ? "opacity-0" : "animate-pulse"
            )}
          />
        </span>
      </div>
    </div>
  );
}

export interface MacOSWindowProps {
  /** URL to display in the address bar */
  url?: string;
  /** Content to render inside the window */
  children: React.ReactNode;
  /** Additional classes for the outer container */
  className?: string;
  /** Additional classes for the content area */
  contentClassName?: string;
  /** Whether to show the URL bar (default: true) */
  showUrlBar?: boolean;
}

export function MacOSWindow({
  url = 'localhost',
  children,
  className,
  contentClassName,
  showUrlBar = true,
}: MacOSWindowProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const showToast = useCallback((message: string) => {
    setToast(null);
    // Small delay to reset state if rapidly clicking
    setTimeout(() => setToast(message), 10);
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleLogoClick = useCallback(() => {
    const message = LOGO_MESSAGES[logoClickCount % LOGO_MESSAGES.length];
    setLogoClickCount(prev => prev + 1);
    showToast(message);
  }, [logoClickCount, showToast]);

  const handleUrlBarClick = useCallback(() => {
    const message = URL_BAR_MESSAGES[Math.floor(Math.random() * URL_BAR_MESSAGES.length)];
    showToast(message);
  }, [showToast]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Revvup',
          text: 'The car marketplace that actually gets it.',
          url: 'https://revvup.ae',
        });
      } catch {
        // User cancelled - no toast needed
      }
    } else {
      window.open('https://revvup.ae', '_blank');
      showToast("Opened in a new tab");
    }
  }, [showToast]);

  const handleCopy = useCallback(async () => {
    const text = "Just found Revvup - finally a car marketplace that doesn't feel like it was built in 2005. Check it: https://revvup.ae";
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied. Now share it.");
    } catch {
      showToast("Copy failed. Blame your browser.");
    }
  }, [showToast]);

  const handleNewTab = useCallback(() => {
    showToast("One tab is all you need");
  }, [showToast]);

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5 bg-black relative",
      className
    )}>
      {/* Typewriter Toast */}
      {toast && (
        <TypewriterToast message={toast} onComplete={clearToast} />
      )}
      {/* macOS Title Bar - Sequoia Style (unified background) */}
      <div className="bg-black px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
        {/* RevvUp Logo - Glass Bubble Style */}
        <div className="flex items-center">
          <button
            onClick={handleLogoClick}
            className="flex items-center justify-center p-1.5 rounded-full bg-transparent backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.05)] hover:bg-white/[0.1] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 400 400" fill="none">
              <path
                d="M0 0 C11.23582766 4.49433107 11.23582766 4.49433107 16.4921875 6.890625 C18.26311768 7.69487915 18.26311768 7.69487915 20.06982422 8.51538086 C20.68758728 8.79703094 21.30535034 9.07868103 21.9418335 9.36886597 C25.35463882 10.92441688 28.77101676 12.47207849 32.1875 14.01953125 C32.90469208 14.3444606 33.62188416 14.66938995 34.36080933 15.00416565 C41.76026488 18.35198853 49.1839798 21.64452889 56.60955811 24.93389893 C70.20294974 30.95583331 83.76161742 37.04824279 97.2890625 43.21679688 C108.13441021 48.16093761 119.00199651 53.05451809 129.875 57.9375 C143.43882646 64.0293375 156.97635452 70.17544306 170.49151611 76.37445068 C180.21698891 80.83387532 189.96595103 85.2329468 199.75 89.5625 C208.21610993 93.30938171 216.65397576 97.08928177 225.01220703 101.07226562 C227.40036286 102.18685567 229.80740067 103.25584804 232.21484375 104.328125 C246.80694455 110.91163303 259.29745641 117.81613705 265.375 133.5625 C268.61125619 150.48542299 264.0765426 165.62131866 255 180 C242.6385291 197.19856821 226.29525577 209.28111966 209 221 C210.35622978 224.92958884 212.09617378 227.55792935 214.8125 230.6875 C218.79461775 235.43687292 222.46625339 240.32826358 226.0625 245.375 C230.98032488 252.26537513 236.03422239 259.03396719 241.1875 265.75 C245.99096142 272.01602306 250.72563839 278.30905786 255.27856445 284.75927734 C262.99357497 295.67992204 271.01713113 306.38393112 279.0625 317.0625 C283.7845796 323.33225059 288.40187603 329.67210603 292.97998047 336.04760742 C295.91299744 340.12731156 298.86967126 344.18714161 301.86328125 348.22265625 C302.50152832 349.08334717 303.13977539 349.94403809 303.79736328 350.83081055 C305.03135609 352.49180758 306.26789815 354.15091461 307.50732422 355.80786133 C308.06564941 356.55962646 308.62397461 357.3113916 309.19921875 358.0859375 C309.69252686 358.7464209 310.18583496 359.4069043 310.6940918 360.08740234 C311.99537763 361.99323021 313.01952214 363.91369167 314 366 C308.54829979 363.1767981 303.46615898 360.01404295 298.4375 356.5 C290.39068552 350.88876971 282.2069776 345.49757504 274 340.125 C273.319375 339.67925629 272.63875 339.23351257 271.9375 338.77426147 C268.40321624 336.45991275 264.86811685 334.14681409 261.33251953 331.83447266 C254.87793251 327.61257578 248.42844887 323.38290111 241.97973633 319.15203857 C240.0109701 317.86069032 238.04165971 316.57017562 236.07226562 315.27978516 C227.989893 309.98111759 219.93744383 304.63911013 211.90164185 299.27011108 C208.69110587 297.12578652 205.47826293 294.98492356 202.265625 292.84375 C198.15828849 290.10627031 194.05158926 287.36785061 189.94702148 284.6262207 C183.67428628 280.43795476 177.40013404 276.25288932 171.09042358 272.12045288 C168.65034384 270.52205534 166.21406936 268.91790776 163.7779541 267.31347656 C162.1237917 266.22773017 160.46385349 265.15079906 158.80371094 264.07421875 C148.6191942 257.35986223 137.75889789 249.65929982 133 238 C132.33652358 234.0191415 132.6577857 232.52472859 134.875 229.125 C137.98185176 225.76577092 141.58270904 223.01368207 145.18359375 220.20703125 C157.88036913 210.49382556 157.88036913 210.49382556 169.38452148 199.47314453 C174.3825962 194.08530826 180.04347218 190.78667144 186.4375 187.25 C196.33627793 181.63958323 205.77199112 175.64959464 215 169 C211.27090896 169 208.36052167 170.23574422 204.9375 171.5625 C204.22779053 171.83280029 203.51808105 172.10310059 202.78686523 172.3815918 C199.12342923 173.78117421 195.46996838 175.20554107 191.8203125 176.640625 C190.40115258 177.19819906 188.9818796 177.7554854 187.5625 178.3125 C186.83514648 178.59794678 186.10779297 178.88339355 185.35839844 179.17749023 C177.66512962 182.17212529 169.89592471 184.9516839 162.11743164 187.71606445 C154.69749922 190.35938155 147.3412344 193.14585248 140 196 C126.33277729 201.30202674 112.64556998 206.53464124 98.875 211.5625 C97.93302261 211.90649841 97.93302261 211.90649841 96.97201538 212.25744629 C96.0329686 212.60035706 96.0329686 212.60035706 95.07495117 212.95019531 C74.19904939 220.43197769 74.19904939 220.43197769 53.625 228.6875 C49.27984635 230.54350134 44.86920885 232.05434649 40.375 233.5 C31.60964339 236.33767113 23.02934461 239.62112536 14.4375 242.9375 C1.7648388 247.81842769 -10.92838366 252.64074896 -23.66647339 257.34866333 C-25.50978557 258.03139185 -27.35185862 258.71747557 -29.19265747 259.4069519 C-31.76975272 260.37141502 -34.3509556 261.32393489 -36.93359375 262.2734375 C-37.70702118 262.5654454 -38.48044861 262.85745331 -39.27731323 263.15830994 C-44.65725579 265.11424807 -44.65725579 265.11424807 -48 264 C-46.83936035 263.32179199 -46.83936035 263.32179199 -45.65527344 262.62988281 C-25.58053607 250.89434005 -5.57765061 239.05603285 14.25 226.90625 C18.62088179 224.22899246 23.00089298 221.56691655 27.3815918 218.90576172 C35.77627955 213.80531587 44.15425336 208.68017304 52.5 203.5 C62.56929178 197.25159419 72.68600182 191.08329108 82.81640625 184.93457031 C85.65969847 183.20679059 88.50100017 181.47581551 91.34132385 179.74316406 C93.81042518 178.23726755 96.2805048 176.73298006 98.7507019 175.22888184 C99.93186159 174.50923171 101.11264598 173.78896515 102.29299927 173.06799316 C115.31728089 165.11421184 128.53861543 157.62642022 142 150.4375 C143.155 149.81681641 144.31 149.19613281 145.5 148.55664062 C151.44675382 145.37419815 157.41573493 142.2370931 163.4296875 139.18359375 C164.52007324 138.62857178 165.61045898 138.0735498 166.73388672 137.50170898 C173.22775047 134.51592965 180.07845232 132.72068382 187 131 C167.32804941 120.30569667 147.1445986 110.98414969 126.27001953 102.88574219 C123.88277608 101.95426023 121.50334434 101.00474544 119.125 100.05078125 C113.7182543 97.88338145 108.29858787 95.74985771 102.875 93.625 C101.9571875 93.2640625 101.039375 92.903125 100.09375 92.53125 C97.06596453 91.34502172 94.0339854 90.17028094 91 89 C89.81559326 88.54173828 88.63118652 88.08347656 87.41088867 87.61132812 C77.44150674 83.79136442 67.35474097 80.38737881 57.19750977 77.10302734 C54.53924729 76.24247244 51.88383204 75.3735035 49.22851562 74.50390625 C47.5079757 73.94481003 45.78727814 73.38619861 44.06640625 72.828125 C43.28809952 72.57291077 42.50979279 72.31769653 41.707901 72.05474854 C36.52700914 70.38834781 31.33104248 69.09228813 26 68 C26 67.34 26 66.68 26 66 C25.38253906 65.96261719 24.76507812 65.92523438 24.12890625 65.88671875 C18.87367176 65.47877817 14.24565094 64.6503288 9.30078125 62.81640625 C6.24798967 61.73315763 3.11464961 60.88989989 0 60 C0 40.2 0 20.4 0 0 Z"
                fill="white"
                fillOpacity="0.7"
                transform="translate(80,15) scale(0.88)"
              />
            </svg>
          </button>
        </div>

        {/* URL Bar - Glass Pill Style, Left Aligned, Height matches logo bubble */}
        {showUrlBar && (
          <div className="flex items-center">
            <button
              onClick={handleUrlBarClick}
              className="bg-transparent backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.05),0_1px_2px_0_rgba(0,0,0,0.2)] rounded-full px-2.5 py-1.5 flex items-center gap-1.5 max-w-[180px] sm:max-w-[220px] hover:bg-white/[0.1] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              {/* Lock icon */}
              <svg className="w-3 h-3 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              
              {/* URL text */}
              <span className="text-xs text-white/50 font-medium truncate">{url}</span>
            </button>
          </div>
        )}

        {/* Spacer to push right side elements */}
        <div className="flex-1" />
        
        {/* Right side toolbar - Outer pill containing 3 bubbles */}
        <div className="hidden sm:flex items-center">
          <div className="flex items-center gap-1 rounded-full bg-transparent backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.03)] p-1">
            {/* Share bubble */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full bg-transparent border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.1] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
              </svg>
            </button>
            {/* Copy bubble */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-full bg-transparent border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.1] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </button>
            {/* Tabs bubble */}
            <button
              onClick={handleNewTab}
              className="p-1.5 rounded-full bg-transparent border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.1] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-6A2.25 2.25 0 019.75 18v-2.25m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Window Content */}
      <div className={cn("bg-black", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
