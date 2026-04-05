import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			'font-size': [
				'text-display5', 'text-display4', 'text-display3',
				'text-display2', 'text-display1', 'text-display',
				'text-large-title', 'text-title1', 'text-title2', 'text-title3',
				'text-headline', 'text-callout', 'text-subhead',
				'text-footnote', 'text-caption1', 'text-caption2',
			],
		},
	},
})

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
