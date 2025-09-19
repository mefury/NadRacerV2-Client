/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}"], // Scans all JS/JSX/TS/TSX files in src/ for Tailwind classes
  theme: {
  	extend: {
  		fontFamily: {
  			orbitron: [
  				'Orbitron',
  				'sans-serif'
  			],
  			exo: [
  				'Exo 2',
  				'sans-serif'
  			]
  		},
  		animation: {
  			pulse: 'pulse 2s infinite',
  			'pulse-health': 'pulse-health 1.5s infinite'
  		},
  		keyframes: {
  			pulse: {
  				'0%, 100%': {
  					textShadow: '0 0 15px rgba(79, 70, 229, 0.7), 0 0 30px rgba(79, 70, 229, 0.4)'
  				},
  				'50%': {
  					textShadow: '0 0 25px rgba(79, 70, 229, 0.8), 0 0 50px rgba(79, 70, 229, 0.5)'
  				}
  			},
  			'pulse-health': {
  				'0%, 100%': {
  					transform: 'scale(1)'
  				},
  				'50%': {
  					transform: 'scale(1.1)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
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
  			// Game-specific semantic colors
  			success: 'hsl(var(--success))',
  			warning: 'hsl(var(--warning))',
  			error: 'hsl(var(--error))',
  			gold: 'hsl(var(--gold))',
  			silver: 'hsl(var(--silver))',
  			bronze: 'hsl(var(--bronze))'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};