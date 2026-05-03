// Canonical cuisine slug list for the operator onboarding step-3 chip
// grid (TT-9) and any future "filter trucks by cuisine" surface.
//
// Slugs are kebab-case ASCII so they round-trip cleanly through
// Postgres `text[]` (trucks.cuisine_tags), URL params, and i18n keys
// (`cuisines.<slug>` → "Mexican" / "Mexicain"). The seed.sql tags
// (`'mexican'`, `'korean-fried'`, etc.) already follow this convention;
// new operators picking from this list keep the data shape consistent.
//
// Order is intentional — cuisines that show up most often in Ottawa
// food-truck listings (per business plan + seed sample) come first so
// the chip grid surfaces them above the fold without scrolling.

export const COMMON_CUISINES = [
  'mexican',
  'korean',
  'japanese',
  'vietnamese',
  'thai',
  'chinese',
  'indian',
  'italian',
  'french',
  'greek',
  'middle-eastern',
  'caribbean',
  'latin',
  'african',
  'american',
  'canadian',
  'bbq',
  'burgers',
  'pizza',
  'tacos',
  'sushi',
  'sandwiches',
  'noodles',
  'soup',
  'salad',
  'breakfast',
  'brunch',
  'desserts',
  'ice-cream',
  'coffee',
  'vegan',
  'vegetarian',
  'gluten-free',
  'fusion',
  'street-food',
] as const;

export type CuisineSlug = (typeof COMMON_CUISINES)[number];
