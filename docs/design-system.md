# TruckTrack — Design System

> Street Fire palette, typography, spacing, components, and Gluestack UI v3 theme config. Version 1.0 · 2026

---

TruckTrack · Design System · v1.0

# DESIGN  
SYSTEM

Gluestack UI + Street Fire palette. The single source of truth for every screen, component, and interaction in the TruckTrack app.

UI LibraryGluestack UI v3

PaletteStreet Fire

PlatformsiOS · Android

Version1.0 — Draft

01 — Color Palette

## STREET FIRE

Three functional color roles — brand, status, and surface — built for high contrast in outdoor, sunlit conditions. Never use brand orange for status states; never use green or red for CTAs.

### Brand & Accent

#FF5C00

Fire Orange

#FF5C00

RGB 255 · 92 · 0

Primary Brand

#FF8A40

Orange Light

#FF8A40

RGB 255 · 138 · 64

Hover / Pressed

#FFD23F

Signal Yellow

#FFD23F

RGB 255 · 210 · 63

Secondary Accent

#F5F0E8

Warm Cream

#F5F0E8

RGB 245 · 240 · 232

Body Text

### Status Colors

#2ECC71

Active Green

#2ECC71

RGB 46 · 204 · 113

Open · Following · Success

#E74C3C

Alert Red

#E74C3C

RGB 231 · 76 · 60

Closed · Error · Danger

### Surface Scale

#0F0F0F

App Black

#0F0F0F

Page background

Surface 0

#1A1A1A

Charcoal

#1A1A1A

Cards, sheets

Surface 1

#252525

Graphite

#252525

Elevated cards

Surface 2

#3A3A3A

Mid

#3A3A3A

Dividers, borders

Stroke

02 — Typography

## TYPE SCALE

Two font families — Bebas Neue for display headings, DM Sans for all UI text. DM Mono is reserved for labels, badges, code, and metadata only.

**Expo setup:** Load via `expo-font` or `@expo-google-fonts/dm-sans` \+ `@expo-google-fonts/bebas-neue`. DM Mono via `@expo-google-fonts/dm-mono`.

### Display / Headings — Bebas Neue

Display · 48px · Bebas Neue  
Screen titles, hero labels

Find Your Truck

H1 · 32px · Bebas Neue  
Section headers

Nearby Trucks

H2 · 24px · Bebas Neue  
Card titles, list headers

Smoque BBQ

### Body — DM Sans

Body L · 16px · 400  
Descriptions, onboarding

Slow-smoked brisket, ribs, and all the sides. Parked at Bank & Sparks until 3pm today.

Body M · 14px · 400  
Standard UI text

Slow-smoked brisket, ribs, and all the sides. Parked at Bank & Sparks until 3pm today.

Body S · 12px · 400  
Secondary info, timestamps

Updated 4 min ago · 0.3 km away

### Labels — DM Mono

Label M · 11px · Mono  
Button text, badges, tags

Open Now · 0.3 km

Label S · 9px · Mono  
Section numbers, eyebrows

Last Updated · 4 Min Ago

03 — Spacing

## SPACE SCALE

Base unit is 4px. All spacing values are multiples. Consistent spacing creates rhythm — don't use arbitrary values outside this scale.

**space-1 · 4px** — Icon padding, tight gaps

**space-2 · 8px** — Badge/pill inner padding

**space-3 · 12px** — Element gaps within a card

**space-4 · 16px** — Card padding, list item height

**space-5 · 20px** — Section gaps on mobile

**space-6 · 24px** — Card outer padding

**space-8 · 32px** — Section top/bottom padding

**space-12 · 48px** — Screen edge padding (horizontal)

**space-16 · 64px** — Hero vertical padding

04 — Border Radius

## CORNER RADIUS

TruckTrack uses a deliberately sharp aesthetic — consistent with the street-food energy of the brand. Pill shapes are reserved for status badges only.

none · 0px  
Buttons, cards,  
input fields

xs · 2px  
Tags, chips,  
code blocks

sm · 4px  
Modals,  
dropdowns

md · 8px  
Bottom sheets,  
map overlays

full · pill  
Status badges  
only

**Rule:** Buttons and input fields are always sharp (radius: 0). This is an intentional brand decision — it distinguishes TruckTrack from rounded consumer food apps like Uber Eats.

05 — Buttons

## BUTTON SYSTEM

Buttons use DM Mono, uppercase, letter-spaced. Primary is always Fire Orange. One primary action per screen maximum.

### Variants

Follow Truck View Menu Share Unfollow Confirmed

### Sizes

Small Default Large

### Usage Rules

Variant| When to use| Example  
---|---|---  
`primary`| The single main action on a screen| Follow, Book Catering, Get Directions  
`secondary`| Supporting action alongside a primary| View Menu, See Schedule  
`ghost`| Tertiary / destructive-neutral| Cancel, Dismiss, Share  
`danger`| Irreversible destructive actions| Delete Listing, Cancel Booking  
`success`| Confirmation states only — not interactive| Booking Confirmed, Payment Complete  
  
### Gluestack Implementation

components/TruckTrackButton.tsx
    
    
    import { Button, ButtonText } from '@gluestack-ui/themed'
    
    // Primary
    <Button action="primary" size="md">
      <ButtonText>Follow Truck</ButtonText>
    </Button>
    
    // Secondary
    <Button action="secondary" variant="outline">
      <ButtonText>View Menu</ButtonText>
    </Button>
    
    // Danger
    <Button action="negative">
      <ButtonText>Unfollow</ButtonText>
    </Button>

06 — Badges & Tags

## STATUS BADGES

Badges communicate real-time state. They are always pill-shaped (the only exception to the sharp-corner rule) and use DM Mono uppercase text.

### Consumer App Badges

● Open Now ● Closed 0.3 km Away ★ Featured Catering Available

### Operator Dashboard Badges

Active Pro Plan Starter Plan Paused — Winter Catering Request

### Badge Token Map

Badge| Background| Text| Context  
---|---|---|---  
Open Now| rgba(46,204,113, 0.15)| #2ECC71| Truck is currently serving  
Closed| rgba(136,136,136, 0.15)| #888888| Truck is not serving today  
Nearby| rgba(255,92,0, 0.15)| #FF5C00| Within user's radius  
Featured| rgba(255,210,63, 0.15)| #FFD23F| Pro plan promoted listing  
Catering| rgba(231,76,60, 0.15)| #E74C3C| Catering request or event  
  
07 — Form Inputs

## INPUT FIELDS

Inputs are sharp-cornered, dark-surfaced, and use a 1px border that highlights in Fire Orange on focus. Error state switches the border to Alert Red.

### States

Truck Name

Location (focused)

Phone Number (error) Please enter a valid phone number

### Gluestack Implementation

components/TruckTrackInput.tsx
    
    
    import { Input, InputField, FormControl,
             FormControlLabel, FormControlError } from '@gluestack-ui/themed'
    
    <FormControl isInvalid={hasError}>
      <FormControlLabel>Truck Name</FormControlLabel>
      <Input>
        <InputField placeholder="e.g. Smoque BBQ" />
      </Input>
      <FormControlError>
        Please enter a valid truck name
      </FormControlError>
    </FormControl>

08 — Cards

## TRUCK CARD

The primary unit of content in the consumer app. The card image slot uses a 3:2 ratio. Status badge is always overlaid top-right of the image.

### Consumer App Card

🔥 ● Open Now

Smoque BBQ

BBQ · American

**0.3 km** · Bank & Sparks · Until **3pm**

Follow Directions

🌮 ● Closed

El Taquero

Mexican · Street Tacos

**1.1 km** · Opens tomorrow

Follow Menu

09 — Gluestack Theme

## THEME CONFIG

Drop this config into your Gluestack provider to wire the Street Fire tokens into every component automatically. Extend, never override the base theme — add keys, don't replace them.

theme/trucktrack.ts
    
    
    import { createConfig } from '@gluestack-ui/themed'
    
    export const config = createConfig({
      tokens: {
        colors: {
          // Brand
          primary50:   '#FFF0E8',
          primary100:  '#FFCFB3',
          primary200:  '#FF8A40',  // hover
          primary400:  '#FF5C00',  // ← Fire Orange (primary CTA)
          primary600:  '#CC4900',  // pressed
          primary800:  '#992B00',
    
          // Accent
          yellow400:   '#FFD23F',  // Signal Yellow
          yellow600:   '#E0A800',
    
          // Status
          success400:  '#2ECC71',  // Active Green
          success600:  '#25A25A',
          error400:    '#E74C3C',  // Alert Red
          error600:    '#C0392B',
    
          // Surfaces
          backgroundDark:    '#0F0F0F',
          backgroundCard:    '#1A1A1A',
          backgroundElevated:'#252525',
          borderDefault:     '#3A3A3A',
          textMuted:         '#888888',
          textBody:          '#F5F0E8',
        },
    
        space: {
          '1':  '4px',   '2': '8px',   '3': '12px',
          '4':  '16px',  '5': '20px',  '6': '24px',
          '8':  '32px',  '12':'48px',  '16':'64px',
        },
    
        radii: {
          none: '0px',   // buttons, cards, inputs
          xs:   '2px',   // tags
          sm:   '4px',   // modals, dropdowns
          md:   '8px',   // sheets, map overlays
          full: '9999px', // status badges only
        },
    
        fonts: {
          heading: 'BebasNeue',
          body:    'DMSans',
          mono:    'DMMono',
        },
      },
    
      components: {
        Button: {
          theme: {
            borderRadius: '$none',         // sharp buttons everywhere
            _text: { fontFamily: '$mono', textTransform: 'uppercase', letterSpacing: 1 }
          }
        },
        Input: {
          theme: {
            borderRadius: '$none',
            borderColor: '$borderDefault',
            _focus: { borderColor: '$primary400' },
            _invalid: { borderColor: '$error400' },
          }
        },
        Badge: {
          theme: { borderRadius: '$full' }  // pills for badges only
        }
      }
    })

### Provider Setup

App.tsx
    
    
    import { GluestackUIProvider } from '@gluestack-ui/themed'
    import { config } from './theme/trucktrack'
    
    export default function App() {
      return (
        <GluestackUIProvider config={config} colorMode="dark">
          <NavigationContainer />
        </GluestackUIProvider>
      )
    }

TRUCKTRACK

Design System · v1.0 Gluestack UI v3 Street Fire Palette Ottawa, Canada · 2026