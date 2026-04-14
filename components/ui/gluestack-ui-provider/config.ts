'use client';
import { vars } from 'nativewind';

// Street Fire palette for TruckTrack — dark mode only
// All values are RGB triplets (e.g., '255 92 0' for #FF5C00)

const streetFire = vars({
  // Primary — Fire Orange (#FF5C00)
  '--color-primary-0': '255 240 232',
  '--color-primary-50': '255 207 179',
  '--color-primary-100': '255 175 128',
  '--color-primary-200': '255 138 64', // Orange Light (hover)
  '--color-primary-300': '255 115 32',
  '--color-primary-400': '255 92 0', // Fire Orange — main brand
  '--color-primary-500': '230 83 0',
  '--color-primary-600': '204 73 0', // pressed
  '--color-primary-700': '179 64 0',
  '--color-primary-800': '153 43 0',
  '--color-primary-900': '128 32 0',
  '--color-primary-950': '102 23 0',

  // Secondary — Surface scale (used for cards, borders)
  '--color-secondary-0': '15 15 15', // App Black
  '--color-secondary-50': '26 26 26', // Charcoal
  '--color-secondary-100': '37 37 37', // Graphite
  '--color-secondary-200': '58 58 58', // Mid (borders)
  '--color-secondary-300': '68 68 68',
  '--color-secondary-400': '85 85 85',
  '--color-secondary-500': '102 102 102',
  '--color-secondary-600': '119 119 119',
  '--color-secondary-700': '136 136 136', // Muted text
  '--color-secondary-800': '170 170 170',
  '--color-secondary-900': '204 204 204',
  '--color-secondary-950': '230 230 230',

  // Tertiary — Signal Yellow (#FFD23F)
  '--color-tertiary-0': '102 84 25',
  '--color-tertiary-50': '128 105 32',
  '--color-tertiary-100': '153 126 38',
  '--color-tertiary-200': '179 147 44',
  '--color-tertiary-300': '204 168 50',
  '--color-tertiary-400': '224 168 0',
  '--color-tertiary-500': '255 210 63', // Signal Yellow — main accent
  '--color-tertiary-600': '255 218 102',
  '--color-tertiary-700': '255 226 140',
  '--color-tertiary-800': '255 234 179',
  '--color-tertiary-900': '255 242 217',
  '--color-tertiary-950': '255 249 238',

  // Error — Alert Red (#E74C3C)
  '--color-error-0': '83 19 19',
  '--color-error-50': '127 29 29',
  '--color-error-100': '153 27 27',
  '--color-error-200': '185 28 28',
  '--color-error-300': '192 57 43', // error-600
  '--color-error-400': '231 76 60', // Alert Red — main
  '--color-error-500': '239 88 72',
  '--color-error-600': '245 120 106',
  '--color-error-700': '250 160 150',
  '--color-error-800': '253 200 195',
  '--color-error-900': '254 226 226',
  '--color-error-950': '254 241 241',

  // Success — Active Green (#2ECC71)
  '--color-success-0': '15 60 33',
  '--color-success-50': '20 83 45',
  '--color-success-100': '25 100 55',
  '--color-success-200': '30 120 65',
  '--color-success-300': '37 162 90', // success-600
  '--color-success-400': '46 204 113', // Active Green — main
  '--color-success-500': '72 215 135',
  '--color-success-600': '102 225 160',
  '--color-success-700': '140 235 185',
  '--color-success-800': '180 243 210',
  '--color-success-900': '220 250 235',
  '--color-success-950': '240 253 245',

  // Warning — reuse Signal Yellow tones
  '--color-warning-0': '84 45 18',
  '--color-warning-50': '108 56 19',
  '--color-warning-100': '130 68 23',
  '--color-warning-200': '180 90 26',
  '--color-warning-300': '215 108 31',
  '--color-warning-400': '231 120 40',
  '--color-warning-500': '251 149 75',
  '--color-warning-600': '253 173 116',
  '--color-warning-700': '254 205 170',
  '--color-warning-800': '255 231 213',
  '--color-warning-900': '255 244 237',
  '--color-warning-950': '255 249 245',

  // Info — cool blue for informational states
  '--color-info-0': '3 38 56',
  '--color-info-50': '5 64 93',
  '--color-info-100': '7 90 131',
  '--color-info-200': '9 115 168',
  '--color-info-300': '11 141 205',
  '--color-info-400': '13 166 242',
  '--color-info-500': '50 180 244',
  '--color-info-600': '87 194 246',
  '--color-info-700': '124 207 248',
  '--color-info-800': '162 221 250',
  '--color-info-900': '199 235 252',
  '--color-info-950': '236 248 254',

  // Typography — Warm Cream (#F5F0E8) as body text
  '--color-typography-0': '15 15 15',
  '--color-typography-50': '26 26 26',
  '--color-typography-100': '58 58 58',
  '--color-typography-200': '85 85 85',
  '--color-typography-300': '102 102 102',
  '--color-typography-400': '119 119 119',
  '--color-typography-500': '136 136 136', // Muted #888888
  '--color-typography-600': '170 170 170',
  '--color-typography-700': '204 204 204',
  '--color-typography-800': '220 220 220',
  '--color-typography-900': '240 236 228', // near Warm Cream
  '--color-typography-950': '245 240 232', // Warm Cream #F5F0E8

  // Outline — borders
  '--color-outline-0': '15 15 15',
  '--color-outline-50': '26 26 26',
  '--color-outline-100': '37 37 37',
  '--color-outline-200': '58 58 58', // Mid #3A3A3A — default border
  '--color-outline-300': '68 68 68',
  '--color-outline-400': '85 85 85',
  '--color-outline-500': '102 102 102',
  '--color-outline-600': '136 136 136',
  '--color-outline-700': '170 170 170',
  '--color-outline-800': '204 204 204',
  '--color-outline-900': '230 230 230',
  '--color-outline-950': '245 245 245',

  // Background — App Black → Charcoal → Graphite
  '--color-background-0': '15 15 15', // App Black #0F0F0F
  '--color-background-50': '26 26 26', // Charcoal #1A1A1A
  '--color-background-100': '37 37 37', // Graphite #252525
  '--color-background-200': '58 58 58', // Mid #3A3A3A
  '--color-background-300': '68 68 68',
  '--color-background-400': '85 85 85',
  '--color-background-500': '102 102 102',
  '--color-background-600': '136 136 136',
  '--color-background-700': '170 170 170',
  '--color-background-800': '204 204 204',
  '--color-background-900': '230 230 230',
  '--color-background-950': '245 240 232', // Warm Cream for contrast

  // Background Special
  '--color-background-error': '66 30 30',
  '--color-background-warning': '65 47 35',
  '--color-background-success': '20 50 35',
  '--color-background-muted': '26 26 26',
  '--color-background-info': '26 40 46',

  // Focus Ring Indicator
  '--color-indicator-primary': '255 92 0', // Fire Orange
  '--color-indicator-info': '13 166 242',
  '--color-indicator-error': '231 76 60', // Alert Red
});

export const config = {
  light: streetFire, // TruckTrack has no light mode — both map to dark
  dark: streetFire,
};
