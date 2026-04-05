import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["variant", [".dark &", ".charcoal &"]],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Aggressive CSS purging for production
  safelist: [
    // Only safelist essential dynamic classes
    'animate-spin',
    'will-change-transform',
  ],
  theme: {
  	screens: {
  		'xs': '480px',
  		'sm': '640px',
  		'md': '768px',
  		'lg': '1024px',
  		'xl': '1280px',
  		'2xl': '1536px',
  	},
  	// ── Complete Apple HIG type scale (replaces ALL Tailwind defaults) ──
  	// Mapping from Tailwind defaults:
  	//   text-xs→caption1  text-sm→subhead   text-base→callout  text-lg→headline
  	//   text-xl→title3    text-2xl→title2   text-3xl→title1
  	//   text-4xl→display  text-5xl→display1 … text-9xl→display5
  	fontSize: {
  		// ── Display (web marketing, SF Display equivalent) ───────────────
  		'display5':    ['8rem',    { lineHeight: '1.00', fontWeight: '800', letterSpacing: '-0.04em'  }], // 128px
  		'display4':    ['6rem',    { lineHeight: '1.01', fontWeight: '800', letterSpacing: '-0.035em' }], //  96px
  		'display3':    ['4.5rem',  { lineHeight: '1.02', fontWeight: '800', letterSpacing: '-0.03em'  }], //  72px
  		'display2':    ['3.75rem', { lineHeight: '1.04', fontWeight: '800', letterSpacing: '-0.025em' }], //  60px
  		'display1':    ['3rem',    { lineHeight: '1.05', fontWeight: '800', letterSpacing: '-0.02em'  }], //  48px
  		'display':     ['2.25rem', { lineHeight: '1.08', fontWeight: '700', letterSpacing: '-0.02em'  }], //  36px
  		// ── Apple HIG Dynamic Type (standard UI scale) ───────────────────
  		'large-title': ['2.125rem',{ lineHeight: '1.21', fontWeight: '600', letterSpacing: '-0.01em'  }], //  34px
  		'title1':      ['1.75rem', { lineHeight: '1.21', fontWeight: '600' }],                            //  28px
  		'title2':      ['1.375rem',{ lineHeight: '1.27', fontWeight: '600' }],                            //  22px
  		'title3':      ['1.25rem', { lineHeight: '1.25', fontWeight: '600' }],                            //  20px
  		'headline':    ['1.0625rem',{ lineHeight: '1.29', fontWeight: '600' }],                           //  17px
  		'callout':     ['1rem',    { lineHeight: '1.31', fontWeight: '500' }],                            //  16px
  		'subhead':     ['0.9375rem',{ lineHeight: '1.33', fontWeight: '500' }],                           //  15px
  		'footnote':    ['0.8125rem',{ lineHeight: '1.38', fontWeight: '500' }],                           //  13px
  		'caption1':    ['0.75rem', { lineHeight: '1.33', fontWeight: '500' }],                            //  12px
  		'caption2':    ['0.6875rem',{ lineHeight: '1.18', fontWeight: '500' }],                           //  11px
  	},
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				background: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			glass: {
  				DEFAULT: 'hsl(var(--glass-background))',
  				background: 'hsl(var(--glass-background))',
  				border: 'hsl(var(--glass-border))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			sparkle: 'sparkle 2s ease-in-out infinite',
  			'sparkle-fall': 'sparkle-fall 2s ease-out forwards',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'float': 'float 3s ease-in-out infinite'
  		},
  		keyframes: {
  			'float': {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-8px)'
  				}
  			},
  			'sparkle-fall': {
  				'0%': {
  					transform: 'translateY(-20px) rotate(0deg) scale(0)',
  					opacity: '0'
  				},
  				'10%': {
  					transform: 'translateY(0) rotate(30deg) scale(1)',
  					opacity: '1'
  				},
  				'50%': {
  					transform: 'translateY(50vh) rotate(180deg) scale(1)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translateY(100vh) rotate(360deg) scale(0.5)',
  					opacity: '0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		}
  	}
  },
  plugins: [],
};

export default config;
