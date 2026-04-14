# TruckTrack — Business Plan

> Full-scale business plan for TruckTrack. Ottawa-first food truck discovery and loyalty platform. Version 1.0 · 2026

---

Full Scale Business Plan · 2026

# TRUCKTRACK

Ottawa's food truck schedule, discovery & loyalty platform — built for operators, loved by locals.

Target Market Ottawa → Canada

Revenue Model B2B SaaS · Monthly

MVP Timeline 6–8 Weeks

Year 1 Target MRR $1,500–$2,500

01 — Problem

## THE CURRENT MESS

Ottawa's food truck operators have no centralized, reliable way to tell customers where they'll be tomorrow. Customers have no easy way to follow their favourites. The tools that exist are abandoned, inaccurate, or built for the US market.

📍

#### Scattered Scheduling

Trucks post daily locations across Instagram, Facebook, and Twitter with zero consistency. Customers miss trucks entirely.

HIGH PAIN

📱

#### Street Food App is Dead

The only Ottawa-specific app (since 2011) shows only 3 trucks. User reviews call it useless. Developers abandoned it.

COMPETITOR GAP

🎟️

#### No Loyalty Tools

Operators hand out paper stamp cards that get lost. No digital loyalty system exists that's built for food trucks specifically.

REVENUE GAP

🌨️

#### Ottawa Weather Chaos

Last-minute cancellations and location changes due to weather have no communication channel. Customers show up to empty spots.

UNIQUE TO OTTAWA

📅

#### Catering Discovery is Broken

Corporate clients and event organizers struggle to find and book food trucks. Trucks miss high-value catering revenue.

REVENUE OPPORTUNITY

📊

#### Zero Customer Insights

Truck operators have no data on who their repeat customers are, what sells best at which location, or when to open.

BUSINESS NEED

02 — Solution

## WHAT WE BUILD

TruckTrack is a two-sided platform: a consumer app for finding and following trucks, and a business dashboard for operators to manage their schedule, loyalty program, and catering inquiries — all in one place.

**Core insight:** Every existing competitor picked one side — either a consumer finder OR an operator tool. TruckTrack connects both. Operators get real customers. Customers get accurate, real-time schedules.

### Two Products, One Platform

🧑‍🤳

#### Consumer App (Free)

Ottawa residents find trucks on a live map, follow favourites, get push alerts for schedule changes, and collect loyalty stamps. iOS + Android.

FREE — DRIVES SUPPLY

🚚

#### Operator Dashboard (Paid)

Truck owners update their schedule in 30 seconds, manage loyalty rewards, view follower analytics, and receive catering inquiries. Web + mobile.

PAID — $19–$39/MO

### Key Features

| Feature                        | For Who  | Why It Matters                                                                                 | Tier     |
| ------------------------------ | -------- | ---------------------------------------------------------------------------------------------- | -------- |
| **Live Map + Schedule**        | Consumer | Real-time truck locations with today/tomorrow view                                             | Free     |
| **Follow & Notifications**     | Consumer | Push alert when favourite truck opens or changes location                                      | Free     |
| **Storm Alerts**               | Both     | Instant push when a truck cancels due to Ottawa weather                                        | Free     |
| **Digital Stamp Card**         | Consumer | QR scan at truck → collect stamps → redeem rewards                                             | Starter+ |
| **Schedule Manager**           | Operator | 30-second location + hours update from phone                                                   | Starter+ |
| **Follower Analytics**         | Operator | See follower count, top locations, peak hours                                                  | Pro      |
| **Catering Inquiry Form (L1)** | Operator | Receive event/corporate booking requests. Negotiate offline. You take 5–10% referral fee.      | Pro      |
| **Catering Marketplace (L2)**  | Both     | Organizer posts event → trucks bid → TruckTrack manages contract + deposit → 10–15% commission | Phase 2  |
| **Daily Specials Push**        | Both     | Operator posts special → followers get notified instantly                                      | Pro      |
| **Instagram Photo Sync**       | Operator | Connect Instagram Business account → auto-sync latest posts to TruckTrack profile gallery      | Pro      |

**Instagram Sync note:** Works only with Instagram Business accounts (which all active food trucks already use). Requires Meta App Review approval before going live with real users. Treat as optional enhancement — if Meta restricts access again, trucks can still upload photos manually. Never build your core product around a Meta API.

03 — Market

## MARKET SIZE

### Ottawa Beachhead

78+

Food trucks in Ottawa

50+

Trucks at annual festival

6

Active months / year

1M+

Ottawa population

### Canadian Expansion TAM

| City                             | Est. Trucks | Target MRR (30% penetration) |
| -------------------------------- | ----------- | ---------------------------- |
| **Ottawa** (Year 1)              | 78          | $444                         |
| **Kingston** (Year 1)            | 30          | $171                         |
| **Hamilton** (Year 2)            | 120         | $684                         |
| **Halifax** (Year 2)             | 90          | $513                         |
| **Edmonton** (Year 3)            | 200         | $1,140                       |
| **Calgary** (Year 3)             | 250         | $1,425                       |
| **Total Canadian Potential MRR** | **$4,377+** |

**Seasonality note:** Ottawa is 6-month active (May–Oct). Target cities like Hamilton, Calgary, and Halifax to offset Ottawa's winter quiet. Year-round product from Day 1 by building multi-city from the start.

### Competitive Landscape

| Competitor           | Coverage     | Ottawa?    | Loyalty? | Weakness                        |
| -------------------- | ------------ | ---------- | -------- | ------------------------------- |
| **Street Food App**  | Many cities  | Yes (dead) | No       | Abandoned, 3 trucks listed      |
| **Roaming Hunger**   | US + Canada  | Yes        | No       | Catering-focused, not real-time |
| **Stamp Me**         | Global       | No         | Yes      | Generic, not food-truck-native  |
| **StreetFoodFinder** | US-focused   | Limited    | No       | No Canadian presence            |
| **TruckTrack**       | Ottawa-first | ✅ Yes     | ✅ Yes   | —                               |

04 — Product

## PRODUCT DESIGN

### Consumer App — Key Screens

🗺️

#### Home Map View

Live map with truck pins, cuisine filter, open-now toggle. Tap a pin → truck card with menu, hours, today's special.

⭐

#### My Trucks Feed

Followed trucks in a scrollable feed showing today's status: open/closed/changed location. Activity timeline.

🎟️

#### Stamp Card Wallet

All loyalty cards in one place. Tap to show QR code at the truck. Progress bars show stamps to next reward.

🔔

#### Notification Centre

Storm alerts, special announcements, loyalty reward unlocked. Clean inbox with truck branding.

### Operator Dashboard — Key Screens

📍

#### Quick Location Update

Drop a pin or search an address. Set hours. One tap to publish. Notifies all followers instantly. Under 30 seconds.

📊

#### Follower Analytics

Follower growth chart, top locations by engagement, peak hours heatmap, loyalty redemption rate.

🎫

#### Loyalty Manager

Set stamp reward (e.g. "10 stamps = free item"). View QR scanner history. Export customer list.

📧

#### Catering Inbox

Receive event booking inquiries. Reply, accept, or decline. Calendar view of confirmed catering events.

04c — Product Features Deep Dive

## FEATURE DETAILS

Six product decisions that define TruckTrack's quality, trust, and differentiation — beyond the core map and schedule.

### 🇫🇷 1. Bilingual — French & English

Ottawa is Canada's federal capital. Roughly one third of the population is francophone, and the Gatineau side of the river is predominantly French-speaking. Every food truck app in Canada is English-only. TruckTrack bilingual is a genuine moat that no competitor based in Toronto or the US will bother to replicate.

**Strategic insight:** A francophone truck owner who sees TruckTrack available in French will trust it immediately over any English-only competitor. One bilingual feature unlocks an entirely separate community of operators and consumers that currently has no dedicated platform.

📱

#### Consumer App

All UI text, button labels, notifications, and error messages available in French. Language follows device language setting automatically. Users can also toggle manually in settings.

LAUNCH WITH MVP

🚚

#### Operator Dashboard

Full French UI for the truck management dashboard. Operators can write their truck description, menu items, and specials in both languages — consumers see the version matching their language preference.

LAUNCH WITH MVP

🔔

#### Push Notifications

Notification copy sent in the consumer's language. "Votre camion favori est maintenant ouvert!" for French users. Requires bilingual notification templates — small one-time translation effort.

MVP+

📧

#### Emails & Invoices

Approval emails, billing receipts, and platform communications sent in the operator's preferred language. Set during registration — changeable in settings anytime.

MVP+

| Implementation Approach | Detail                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **i18n library**        | Use `react-i18next` for both React Native and Next.js. Define translation keys once, maintain two JSON files (en.json, fr.json).                        |
| **Language detection**  | Auto-detect from device locale on first launch. Store preference in user profile. Override available in settings.                                       |
| **Truck content**       | Each text field in the truck profile has an EN and FR variant. If FR not filled in, falls back to EN gracefully.                                        |
| **Translation cost**    | Initial UI translation: use DeepL Pro + one human review pass. ~$50–$100 one-time. Ongoing: operator enters their own French content.                   |
| **App Store**           | Submit app with both English and French App Store descriptions. Apple and Google surface bilingual apps more prominently in Quebec and Ottawa searches. |

### ⭐ 2. Truck Ratings & Reviews

Without a reputation layer, consumers can't distinguish a beloved local institution from a low-quality newcomer. Ratings give good operators a competitive advantage and create a natural incentive to stay active on the platform.

⭐

#### Star Rating

1–5 stars. Only consumers who have scanned a loyalty stamp at that truck can leave a rating — prevents fake reviews. Verified badge shown next to review.

VERIFIED ONLY

💬

#### Short Review

Optional 1–3 sentence comment with the rating. Max 280 characters. Shown on truck profile chronologically. Operator cannot delete consumer reviews — only flag for moderation.

OPTIONAL TEXT

🏆

#### Display on Profile

Average star rating shown prominently on map pin and truck card. Review count shown too ("4.7 ★ · 43 reviews"). Builds social proof at first glance.

HIGH VISIBILITY

🚩

#### Moderation

Operators can flag a review as inappropriate. You review flagged content in the admin panel and remove if it violates policy. No auto-removal — human decision only.

ADMIN MODERATED

| Rule                                   | Detail                                                          | Why                                                 |
| -------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| **Who can review**                     | Only consumers with at least 1 loyalty stamp scan at that truck | Prevents fake reviews from competitors or bots      |
| **Review frequency**                   | One review per consumer per truck, updatable                    | Prevents rating manipulation by loyal fans          |
| **Minimum ratings to display**         | Require 5+ ratings before showing average publicly              | Prevents distortion from single early review        |
| **Operator response**                  | Pro tier operators can reply to reviews publicly                | Adds engagement value and upsell incentive          |
| **Review visibility during hibernate** | Reviews still visible on hibernated profiles                    | Helps consumers decide whether to follow for spring |

### 🔔 3. Notification Settings & Controls

Notifications are TruckTrack's primary engagement engine — but uncontrolled notifications are the #1 reason users uninstall apps. Every consumer needs granular control over what they receive and when.

🎛️

#### Per-Truck Controls

For each followed truck, consumer sets independently: location updates on/off, daily specials on/off, storm cancellations on/off. Not an all-or-nothing toggle.

🌙

#### Quiet Hours

Set a daily quiet window (e.g. 10pm–7am). All notifications held and delivered silently during this time. Default quiet hours pre-set to 9pm–7am to prevent late-night pings.

📋

#### Notification Types

Four types with individual toggles: 📍 Location opened, 🌟 Daily special posted, ❄️ Truck cancelled/closed, 🎟️ Loyalty reward unlocked. All on by default, easily turned off.

📊

#### Frequency Cap

Even if an operator posts 5 specials in a day, consumers receive max 2 notifications per truck per day. Prevents notification spam from over-enthusiastic operators.

SYSTEM ENFORCED

**Operator side:** Starter and Pro operators see a "notification sent" counter per post. If they exceed 2 notifications/day the system queues the rest for the next day. They see this clearly in the dashboard — no surprises.

### 📱 4. Social Sharing

Every share is free marketing. A consumer sharing a truck's special to their Instagram Story reaches hundreds of potential new users at zero cost to you. Build sharing into every high-value moment.

🔗

#### Truck Profile Link

Every truck has a public URL: `trucktrack.ca/trucks/[truck-slug]`. Shareable anywhere — iMessage, Instagram bio, WhatsApp. Opens in browser with prompt to download app.

WEB + APP

📸

#### Share a Special

When a truck posts a daily special, consumers can share it as a card — pre-formatted image with truck name, special description, and "Find them on TruckTrack" branding. One tap to Instagram Stories, iMessage, or clipboard.

VIRAL MECHANIC

🗺️

#### Share Location

"I'm here at [Truck Name]!" — share current truck location to contacts. Useful for groups ("meet me at the taco truck at Lansdowne"). Generates a deep link that opens TruckTrack at that truck's pin.

PHASE 2

🏆

#### Operator Share Tools

Pro operators get a "Share my profile" button that generates a branded image card with their photo, rating, and QR code — ready to post to their own Instagram. Saves them 10 minutes of design work.

PRO TIER

### 🗓️ 5. Weekly Advance Schedule

Today's location view is reactive — consumers check where a truck is right now. A weekly schedule view is proactive — it lets consumers plan their week around their favourite trucks. This dramatically increases app open frequency and follow value.

📅

#### 7-Day View

Operators can pre-publish their location for up to 7 days ahead. Consumers see a "This Week" tab on each truck's profile showing planned locations per day.

OPERATOR SETS IT

🔁

#### Recurring Slots

Operators can set recurring weekly patterns — "Every Tuesday, Lansdowne Park, 11am–2pm." Published automatically each week unless manually overridden. Saves operators from re-entering the same schedule weekly.

LOW FRICTION

🗺️

#### Consumer Weekly Map

A "This Week" map view showing all trucks with published schedules. Filter by day — see who's near your office on Wednesday. Huge value for the federal government lunch crowd in Ottawa.

PHASE 2

⚠️

#### Override & Cancel

If a truck can't make a scheduled slot (weather, breakdown), they tap "Cancel today's slot." All followers with that day's notification enabled get an instant alert. Schedule updates automatically.

STORM INTEGRATION

### ♿ 6. Accessibility — AODA Compliance

Ontario's Accessibility for Ontarians with Disabilities Act (AODA) requires digital products to meet WCAG 2.0 Level AA standards. As a small startup you're not legally required to comply immediately, but building accessible from the start is easier than retrofitting later — and opens the door to government and enterprise catering clients who require it.

| Requirement              | What It Means in Practice                                                                                                                             | Priority   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **Colour contrast**      | Text must have 4.5:1 contrast ratio against background. TruckTrack's orange-on-dark palette already meets this — verify with a contrast checker tool. | 🔴 Launch  |
| **Tap target size**      | All buttons and interactive elements minimum 44×44px. Critical for mobile — prevents mis-taps and screen reader issues.                               | 🔴 Launch  |
| **Screen reader labels** | All images, icons, and buttons have descriptive `accessibilityLabel` props in React Native. "Open map for Smoke's Poutine" not just "button".         | 🟡 MVP+    |
| **Font scaling**         | UI respects device font size settings. Users with large text accessibility setting should not break the layout.                                       | 🟡 MVP+    |
| **VoiceOver / TalkBack** | Test the app with iOS VoiceOver and Android TalkBack before App Store submission. Fix navigation order and focus issues.                              | 🟢 Phase 2 |

04d — Catering

## CATERING MARKETPLACE

Catering is TruckTrack's highest-revenue opportunity — a single corporate booking at $2,000 with a 10% fee generates more than 5 months of a Pro subscription. It's built in two levels, sequenced carefully so complexity never outpaces your supply base.

**The sequencing rule:** Never launch Level 2 (full marketplace) until you have 50+ active trucks. An organizer posting a catering event needs at least 10–15 trucks available to bid — otherwise the marketplace is empty and embarrassing. Prove the supply first.

### Level 1 — Catering Inquiry Form (Pro Tier · Month 4–5)

The simplest version of catering. TruckTrack connects the organizer with the truck — but the transaction happens completely offline between them. You take a referral fee by invoicing the truck separately after a confirmed booking.

📋

#### How It Works — Organizer Side

On any truck's profile page a "Request Catering" button is visible to all consumers. Organizer taps it and fills in a short form: event date, location, estimated guests, budget range, type of event. Submitted directly to the truck's catering inbox.

PUBLIC FACING

📬

#### How It Works — Operator Side

Truck receives the inquiry in their dashboard Catering Inbox (Pro feature). They can reply, accept, or decline with a message. All communication logged in TruckTrack — not via WhatsApp or email chains.

PRO DASHBOARD

💰

#### How You Get Paid

When a truck marks an inquiry as "Confirmed," TruckTrack sends the truck a separate referral invoice for 5–10% of the agreed booking value. Honour-system at first, automated via Stripe later.

5–10% REFERRAL FEE

🔔

#### You Get Notified Too

Every catering inquiry and confirmation is visible in your admin panel. Track conversion rates, average booking values, and which trucks bring in the most catering revenue. Useful data for the Level 2 build.

ADMIN VISIBILITY

### Level 1 — Catering Inquiry Flow

| Step | Actor          | Action                                       | System Response                                                                           |
| ---- | -------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1    | Organizer      | Taps "Request Catering" on any truck profile | Modal form opens — date, location, guests, budget, event type                             |
| 2    | Organizer      | Submits inquiry form                         | Inquiry logged in DB. Truck notified via push + email. Organizer gets confirmation email. |
| 3    | Truck operator | Reviews inquiry in Catering Inbox            | Sees full inquiry details. Options: Reply with quote, Accept, Decline with note.          |
| 4    | Truck operator | Replies with pricing / availability          | Reply sent to organizer's email. Thread logged in dashboard.                              |
| 5    | Both           | Negotiate offline (phone / email)            | TruckTrack not involved in negotiation or payment at Level 1.                             |
| 6    | Truck operator | Marks booking as "Confirmed" in dashboard    | TruckTrack auto-sends referral invoice to truck for 5–10% of entered booking value.       |
| 7    | Truck operator | Pays referral invoice via Stripe             | Revenue logged. Admin notified. Booking marked complete.                                  |

### Level 2 — Catering Marketplace (Phase 2 · Month 12+)

The full marketplace model. TruckTrack owns the entire transaction end-to-end — organizer posts, trucks bid, TruckTrack holds the deposit, manages the contract, and guarantees the booking. This is how Roaming Hunger built a $10M+ business.

**Prerequisites before building Level 2:** 50+ active trucks on the platform, proven Level 1 conversion rate, at least 5 successful catering bookings tracked, and you have bandwidth to personally handle disputes. This is an operational commitment — not just a feature.

📢

#### Event Posting (Organizer)

Organizer creates a public event request visible to all relevant trucks in the city. Specifies date, location, guest count, budget, cuisine preferences, and any dietary requirements. Posted anonymously to prevent trucks from bypassing the platform.

🏷️

#### Truck Bidding

Eligible trucks receive a notification and submit a bid: their proposed menu, price, and availability. Organizer sees all bids side by side and selects their preferred truck. No direct contact until selection — TruckTrack mediates.

📄

#### Contract & Deposit

TruckTrack generates a standard catering contract from a template. Organizer pays a 25–30% deposit via Stripe — held by TruckTrack. Deposit protects the truck from no-shows and gives the organizer a formal commitment.

✅

#### Post-Event Settlement

After the event, organizer confirms completion. TruckTrack releases the full payment to the truck minus TruckTrack's 10–15% commission. Truck rates the organizer. Organizer rates the truck. Both ratings public.

🛡️

#### TruckTrack Guarantee

If a truck cancels within 72 hours of the event, TruckTrack activates the "Emergency Replacement" protocol — contacts the next best available truck in the city and offers them the booking. If no replacement found, organizer receives 110% refund.

COMPETITIVE MOAT

💬

#### In-Platform Messaging

All organizer-truck communication happens inside TruckTrack after selection. No phone numbers or emails exchanged until booking is confirmed and deposit paid. Protects both parties and keeps the record for dispute resolution.

### Catering Revenue Comparison

| Scenario                            | Booking Value | Level 1 (5–10%) | Level 2 (10–15%)  |
| ----------------------------------- | ------------- | --------------- | ----------------- |
| Small office lunch (15 people)      | $400          | $20–$40         | $40–$60           |
| Corporate lunch program (50 people) | $1,200        | $60–$120        | $120–$180         |
| Company event (100 people)          | $2,500        | $125–$250       | $250–$375         |
| Wedding / large event (150 people)  | $4,000        | $200–$400       | $400–$600         |
| **10 bookings/mo at avg $1,500**    | $15,000       | **$750–$1,500** | **$1,500–$2,250** |

**10 catering bookings per month at Level 2 adds $1,500–$2,250 to MRR** — roughly doubling your subscription revenue at Month 12 projections, from a single revenue stream that doesn't require a single new truck signup. Ottawa's large federal government workforce, corporate headquarters, and active event scene make this highly realistic.

### Target Catering Clients in Ottawa

🏛️

#### Federal Government

Ottawa has 100,000+ federal public servants. Departments regularly hold team lunches, appreciation days, and onboarding events. Food trucks are a popular, informal alternative to restaurant buyouts. HR teams are your buyer.

HIGH VOLUME

🏢

#### Tech Companies

Ottawa's Kanata tech corridor hosts Shopify, Nokia, Ericsson, and hundreds of smaller firms. Engineering teams celebrate launches, product milestones, and all-hands events. Budget is usually available and decisions are made fast.

HIGH VALUE

🎓

#### Universities

uOttawa and Carleton both hold campus events, orientation weeks, club fairs, and graduation celebrations. Student union procurement is a reliable annual repeating customer.

SEASONAL

💍

#### Weddings & Private Events

Food trucks at Ottawa weddings and backyard parties are a growing trend. Average wedding catering booking = $3,000–$6,000. One wedding referral = 2–3 months of a Pro subscription in a single transaction.

HIGH VALUE / SEASONAL

### Level 1 vs Level 2 — When to Switch

| Signal                        | Threshold                                | Action                                                         |
| ----------------------------- | ---------------------------------------- | -------------------------------------------------------------- |
| Active trucks on platform     | 50+ trucks approved                      | Begin planning Level 2 build                                   |
| Level 1 bookings confirmed    | 10+ confirmed bookings tracked           | You have proof of demand — build Level 2                       |
| Average booking value         | $800+ average                            | Commission model justifies the operational overhead            |
| Referral fee payment friction | 3+ trucks resist paying referral invoice | Automate payment inside the platform — move to Level 2 model   |
| Organizer repeat usage        | Same organizer books twice               | Strong signal — build the better experience for repeat clients |

04b — Operator Registration

## JOINING THE PLATFORM

Operators register and build their full profile in draft mode before going live. A lightweight approval layer protects listing quality and consumer trust — the single most important asset in a two-sided marketplace.

### Registration Journey — 6 States

State 1

#### 📝 Registered

- Operator signs up with email + password (or Google login)
- Enters truck name, owner name, phone number, city
- Receives welcome email with onboarding checklist
- Account created — dashboard unlocked in draft mode
- Not visible to consumers yet

State 2

#### 🛠️ Profile Setup (Draft)

- Operator builds full profile at their own pace — no deadline
- Add truck description, cuisine type, price range
- Upload cover photo + gallery photos (min. 1 required to submit)
- Build menu: categories, items, prices, dietary tags
- Add social links (Instagram, Facebook, website)
- Set typical operating areas and hours
- Progress bar shows profile completeness (e.g. 60% complete)
- Can save and return anytime — no pressure

State 3

#### 📬 Submitted for Review

- Operator clicks "Submit for Review" when ready
- System auto-checks minimum requirements before allowing submission
- Auto-check: at least 1 photo, truck name, cuisine type, city, 1 menu item
- If checks pass → status moves to "Pending Review"
- If checks fail → inline errors shown, operator fixes and resubmits
- You (admin) receive email notification of new submission
- Operator sees "Your profile is under review — we'll respond within 24 hours"

State 4a

#### ✅ Approved → Active

- You review profile in admin panel — takes ~2 minutes per truck
- One-click approve → truck goes live on the map immediately
- Operator receives email: "You're live on TruckTrack! 🎉"
- Email includes link to their public profile + tips to get first followers
- Free tier activated — can upgrade to Starter or Pro anytime

State 4b

#### ❌ Declined

- You decline with a required reason selected from a dropdown
- Reasons: duplicate listing, not a food truck, incomplete profile, location not supported yet
- Operator receives email with the specific reason and next steps
- If fixable → operator updates profile and resubmits (goes back to State 3)
- If location not yet supported → added to waitlist for that city's launch

State 5

#### ❄️ Hibernated (Winter Pause)

- Operator clicks "Hibernate for Winter" from dashboard — available Oct 1 onward
- Sets an optional return date (e.g. "Back May 1st") shown publicly on their profile
- Subscription billing paused immediately — zero charge during hibernation
- Maximum pause duration: 6 months
- Truck removed from map, search results, and "Open Now" filters
- Profile page stays fully visible — followers can still browse menu and photos
- Status badge shown on profile: _"❄️ Hibernating — Back [Month]!"_
- Followers see truck grayed out in their Following feed with hibernation badge
- All follower data, loyalty history, and analytics preserved — nothing lost
- Reactivation: one-tap "Wake up 🌸" button — billing resumes, truck goes live instantly
- When truck reactivates → all followers get a push notification automatically

State 6

#### 🔄 Active → Suspended (Edge Case)

- Admin can suspend a live truck if consumer complaints arise
- Truck hidden from map but profile data preserved
- Operator notified with reason and resolution path
- Can be reinstated after issue resolved

### ❄️ Winter Pause — Full Design

The hibernation feature is TruckTrack's most important retention tool. Trucks that cannot pause will cancel their subscription in October and need to be re-acquired every spring. A zero-friction pause keeps them on the platform permanently.

💳

#### Billing During Pause

Subscription is fully paused — zero charge. No partial billing, no reduced rate. Trucks that feel charged for a service they can't use will cancel permanently. Zero charge = zero reason to leave.

FREE PAUSE

🗺️

#### Map Behaviour

Hidden from live map, search results, "Open Now" filter, and nearby truck suggestions. Not deletable — just invisible. Direct profile URL still works for anyone with the link.

HIDDEN NOT DELETED

👤

#### Consumer Profile View

Profile fully visible. Cover photo, menu, gallery, and follower count all displayed. Status banner at top: "❄️ Hibernating — Back May 1st!" Return date set by the operator.

PROFILE STAYS LIVE

🔔

#### "Notify Me When Back" Button

Consumers visiting a hibernated truck's profile can tap this. When the operator wakes up their listing in spring, all opted-in followers get an instant push: "🌸 [Truck Name] is back for the season!"

RE-ENGAGEMENT HOOK

📋

#### Following Feed Status

In the consumer's Following list, hibernated trucks appear at the bottom, visually dimmed with a small ❄️ snowflake badge and their return date. Not removed — just deprioritized.

VISIBLE BUT DIMMED

🌸

#### Spring Reactivation

One-tap "Wake up 🌸" button in dashboard. Billing resumes from that day. Truck instantly reappears on map. All followers get automatic push notification. Everything exactly as they left it.

ONE TAP RETURN

### Pause Rules & Guardrails

| Rule                                 | Detail                                                     | Why                                                                |
| ------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| **Max pause duration**               | 6 months                                                   | Prevents permanent free-riding on the platform                     |
| **Pause availability window**        | Oct 1 – Nov 30 to initiate                                 | Prevents mid-season abuse; aligns with Ottawa's natural off-season |
| **Minimum active time before pause** | Must have been active for at least 1 month                 | Prevents signing up → immediately pausing → never paying           |
| **Pauses per year**                  | 1 pause allowed per calendar year                          | Prevents repeated pausing in shoulder seasons                      |
| **Auto-resume**                      | After 6 months, billing auto-resumes and truck goes active | Safety net — no truck stays invisible forever                      |
| **Data preserved**                   | Followers, loyalty history, analytics, photos, menu        | Ensures seamless spring return — nothing to rebuild                |
| **Cancellation during pause**        | Allowed — but triggers a "Are you sure?" + spring offer    | Last-chance retention before full churn                            |

**The spring re-engagement push is gold:** When 30 hibernated trucks reactivate in May, 30 × their average follower count gets push notifications simultaneously. That's potentially thousands of consumers re-engaged with the app in a single day — at zero marketing cost to you.

### Minimum Profile Requirements to Submit

| Field                     | Required?      | Why                                               |
| ------------------------- | -------------- | ------------------------------------------------- |
| **Truck name**            | ✅ Yes         | Core identity                                     |
| **Cover photo**           | ✅ Yes         | Consumers won't trust a blank profile             |
| **Cuisine type**          | ✅ Yes         | Used for map filtering                            |
| **City / operating area** | ✅ Yes         | Determines which map they appear on               |
| **At least 1 menu item**  | ✅ Yes         | Bare minimum for consumers to know what you sell  |
| **Owner phone number**    | ✅ Yes         | For admin verification only — not shown publicly  |
| Gallery photos (2+)       | ⭐ Recommended | Shown in completeness bar as strong encouragement |
| Full menu with prices     | ⭐ Recommended | Drives higher consumer engagement                 |
| Social media links        | Optional       | Enables Instagram sync for Pro users              |
| Typical hours             | Optional       | Helps consumers but not blocking                  |

### Admin Review Panel

A minimal internal dashboard — just for you — to manage the approval queue. Doesn't need to be beautiful, just functional.

📋

#### Submission Queue

List of pending profiles sorted by submission date. Oldest first. Each row shows truck name, city, cuisine, and submitted photo thumbnail.

ADMIN ONLY

👁️

#### Profile Preview

See exactly what the consumer will see before approving. Full profile view rendered in the admin panel.

ADMIN ONLY

✅

#### One-Click Approve / Decline

Approve sends live email + activates listing. Decline requires selecting a reason from dropdown before sending.

ADMIN ONLY

🔔

#### Admin Notifications

Email to you on every new submission. Daily digest if queue exceeds 5 pending. Target: review all submissions within 24 hours.

SLA: 24 HRS

**When to remove the approval layer:** Once you've approved 100+ trucks and have zero quality issues, switch to self-serve publish with automated checks only. The approval layer is a temporary trust-building mechanism, not a permanent feature.

05 — Monetization

## HOW WE MAKE MONEY

Charge operators, never consumers. Revenue comes from three streams: subscriptions, catering referral fees, and eventually premium consumer features.

### Operator Subscription Tiers

Free

$0

/ month forever

- Basic listing on map
- Manual schedule updates
- Menu page
- Up to 3 photos

⭐ Starter — Most Popular

$19

/ month

- Everything in Free
- Push notify followers on update
- Daily specials posting
- Storm / cancellation alerts
- Basic follower count
- Unlimited photos

Pro

$39

/ month

- Everything in Starter
- Digital loyalty stamp card
- Full follower analytics
- Catering inquiry inbox
- Customer export (CSV)
- Priority listing placement
- 📸 Instagram photo auto-sync

### Additional Revenue Streams

| Stream                    | Model                                                    | Est. Value            | Timeline |
| ------------------------- | -------------------------------------------------------- | --------------------- | -------- |
| **Catering Referral Fee** | 5–10% of catering booking value                          | $50–$200 per booking  | Year 1   |
| **Festival Packages**     | One-time feature listing per festival event              | $49–$99 per truck     | Year 1   |
| **Consumer Pro**          | $2.99/mo for ad-free + exclusive early access alerts     | Low until scale       | Year 2   |
| **White Label**           | Sell platform to food truck associations in other cities | $200–$500/mo per city | Year 3   |

**Winter pause billing note:** Subscriptions pause at zero charge during hibernation (max 6 months). This reduces Oct–Apr MRR by ~40% for Ottawa-only trucks. Offset this by expanding to year-round cities (Halifax, Vancouver, Hamilton) — their active season covers Ottawa's dead months. By Year 2, no single city's seasonality should impact overall MRR by more than 20%.

05b — Billing & Payments

## HOW WE CHARGE OPERATORS

All billing runs through Stripe — the industry standard for Canadian SaaS businesses. Operators save a card once and are charged automatically every month. Everything from invoicing to tax collection is handled without manual work from you.

### Payment Methods Accepted

💳

#### Credit & Debit Cards

Visa, Mastercard, Amex, Discover. The primary payment method for Canadian small businesses. Operators enter card once at signup — auto-billed monthly.

PRIMARY METHOD

#### Apple Pay & Google Pay

Stripe supports both digital wallets natively in Canada. Faster checkout for operators on mobile — no card number needed.

SUPPORTED

🏦

#### Pre-Authorized Debit (PAD)

Canadian bank account direct debit — similar to ACH in the US. Good option for operators who prefer not to use a card. Slightly slower (2–5 days to settle) but lower failure rate.

OPTIONAL — ADD LATER

❌

#### Interac e-Transfer

Not available through Stripe. Interac has no public API for automated billing. Manual e-Transfer invoicing is possible but doesn't scale. Skip this — card billing is standard for SaaS.

NOT SUPPORTED

### How Subscription Billing Works

| Step                        | What Happens                                                                                                                                                                                      | Who Does It         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **1\. Signup**              | Operator selects a plan (Free, Starter, Pro) and enters card details via Stripe's hosted checkout form. Card is saved securely — PCI compliant, you never touch raw card data.                    | Operator            |
| **2\. First charge**        | Stripe charges the card immediately on plan selection. Billing cycle starts from that date (e.g. the 14th of the month).                                                                          | Stripe (auto)       |
| **3\. Monthly renewal**     | On the same date each month, Stripe auto-charges the saved card. No action needed from you or the operator.                                                                                       | Stripe (auto)       |
| **4\. Invoice sent**        | Stripe automatically emails a PDF invoice to the operator immediately after each successful charge. Includes your business name, HST number (once registered), billing period, and tax breakdown. | Stripe (auto)       |
| **5\. Upgrade / Downgrade** | Operator can change plans anytime from dashboard. Stripe handles proration automatically — charges or credits the difference for the remaining days in the billing cycle.                         | Operator self-serve |
| **6\. Winter pause**        | Operator clicks "Hibernate" → Stripe subscription paused. Billing resumes automatically on reactivation date or when operator clicks "Wake up".                                                   | Operator self-serve |
| **7\. Cancellation**        | Operator cancels from dashboard. Access continues until end of current billing period. No refund for partial months.                                                                              | Operator self-serve |

### Invoice Format

Every operator receives a professional, CRA-compliant PDF invoice automatically after each charge. Here's what it includes:

🧾

#### Your Business Details

TruckTrack business name, Ottawa address, your GST/HST registration number (added once you register). Required for operators to claim input tax credits.

📋

#### Line Items

Plan name (e.g. "TruckTrack Pro — October 2026"), billing period, subtotal, HST amount (13% in Ontario), and total in CAD.

📧

#### Delivery

Auto-emailed to the operator's registered email immediately on charge. Also available as a downloadable PDF in their dashboard under "Billing History."

💰

#### Currency

All charges in CAD. Never USD. Operators are Canadian small businesses — billing in CAD avoids conversion confusion and exchange rate friction.

### Canadian Tax — GST / HST

TruckTrack is a SaaS product. **SaaS subscriptions are fully taxable in Canada.** You are required to collect and remit GST/HST once your revenue crosses the small supplier threshold.

**Small supplier threshold:** You do _not_ need to collect GST/HST until your total revenue exceeds **$30,000 CAD** in any 12-month rolling period. Below that — no tax charged, no registration needed. At $19–$39/truck/month, you'll likely hit this threshold somewhere around **65–130 active paying trucks** — roughly Month 9–14 based on projections.

### Tax Rates by Province

| Province                 | Tax Type  | Rate               | Notes                                                           |
| ------------------------ | --------- | ------------------ | --------------------------------------------------------------- |
| **Ontario** 🏠 Your base | HST       | 13%                | Combined federal (5%) + provincial (8%)                         |
| **Nova Scotia**          | HST       | 15%                | Halifax expansion — higher rate                                 |
| **New Brunswick**        | HST       | 15%                | HST province                                                    |
| **British Columbia**     | GST + PST | 5% + 7% = 12%      | Separate PST registration required for BC                       |
| **Alberta**              | GST only  | 5%                 | No provincial sales tax — Calgary/Edmonton are cheaper to serve |
| **Manitoba**             | GST + RST | 5% + 7% = 12%      | Separate registration needed                                    |
| **Quebec**               | GST + QST | 5% + 9.975% = ~15% | Separate QST registration required                              |

**Use Stripe Tax.** Stripe automatically determines whether federal GST/HST, provincial PST, QST, or RST applies to each transaction based on the customer's location — not your location. Enable Stripe Tax in your dashboard, add your registrations as you expand to each province, and Stripe calculates, collects, and reports the correct amount per operator automatically. Costs ~0.5% per transaction but saves hours of manual tax calculation.

### When to Register for GST/HST

| Phase                     | Revenue                   | Action Required                                                                                        |
| ------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Early stage**           | Under $30,000/yr          | No registration needed. Don't charge HST. Keep it simple.                                              |
| **Approaching threshold** | $25,000–$30,000/yr        | Register proactively with CRA — takes 2–4 weeks to process. Don't get caught mid-month.                |
| **Over threshold**        | $30,000+/yr               | Must register, collect HST on all invoices, and remit to CRA quarterly. Enable Stripe Tax immediately. |
| **Expanding provinces**   | Any revenue in BC, QC, MB | Separate provincial registrations required for PST/QST/RST even if under federal threshold.            |

### What Operators Actually Pay (After Tax)

| Plan        | Base Price | \+ Ontario HST (13%) | Total Charged | Net to You (after Stripe fee) |
| ----------- | ---------- | -------------------- | ------------- | ----------------------------- |
| **Starter** | $19.00     | $2.47                | $21.47        | ~$18.15                       |
| **Pro**     | $39.00     | $5.07                | $44.07        | ~$37.57                       |

Stripe fee: 2.9% + C$0.30 per transaction. HST collected goes to CRA — not your revenue. Net figures reflect this.

### Failed Payment Handling

| Day        | What Happens                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Day 0**  | Payment fails. Stripe sends automatic "payment failed" email to operator with a link to update their card.                                                       |
| **Day 3**  | Stripe Smart Retry — automatically attempts charge again on a different time/day.                                                                                |
| **Day 7**  | Second retry attempt. Operator receives second reminder email.                                                                                                   |
| **Day 14** | Final retry. If still failing, subscription downgrades to Free tier automatically. Operator notified — map listing stays but push notifications disabled.        |
| **Day 30** | If no action taken after 30 days on Free tier, send a personal email from you. One human touch at this point recovers a significant portion of churned accounts. |

### Refund Policy

✅

#### Refundable

First charge if operator hasn't used any paid features and requests refund within 48 hours. Handled manually via Stripe dashboard — takes 60 seconds.

❌

#### Non-Refundable

Partial month refunds after cancellation. Industry standard for SaaS — access continues until end of billing period. State this clearly in your Terms of Service.

⚖️

#### Dispute / Chargeback

Stripe handles disputes automatically. Keep email records of operator signup, plan selection, and usage as evidence. Subscription receipts in Stripe's dashboard are your proof of service.

❄️

#### Winter Pause

No charge during pause — no refund needed. Billing simply stops and resumes. Operators can't claim a refund for days already charged before initiating a pause.

### Business Registration Recommendation

**Register as a business before accepting your first payment.** A sole proprietorship with a CRA business number takes 15 minutes to set up online and costs nothing. This lets you open a separate business bank account, issue proper invoices, and deduct business expenses (hosting, Stripe fees, software). When MRR hits $3,000+/mo, consider incorporating — it limits personal liability and has tax advantages at higher income levels. Consult an Ottawa accountant at that point.

05c — Legal & Compliance

## LEGAL FOUNDATIONS

Three legal documents you must have before your first user signs up. Not optional — Apple and Google will reject your app without a Privacy Policy URL, and operating without Terms of Service leaves you completely exposed.

**Good news:** None of these require a lawyer at the early stage. Use a reputable generator like Termly or iubenda (~$10–$30/mo) to create compliant Canadian documents in under an hour. Review with a lawyer only when MRR hits $5,000+/mo.

### Document 1 — Privacy Policy

Required by: Apple App Store, Google Play Store, PIPEDA (Canadian federal law), and any province you operate in. Must be live at a public URL before app submission.

| Section                  | What It Must Cover for TruckTrack                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Data collected**       | Email addresses, names, phone numbers (operators), device location (consumers), payment info (via Stripe — note Stripe handles this, not you directly), usage analytics via PostHog. |
| **Why collected**        | Location: to show trucks on map and send relevant notifications. Email: account management and billing. Phone: operator verification only, not shared or marketed to.                |
| **Who it's shared with** | Stripe (payment processing), Firebase (push notifications), Supabase (database hosting), PostHog (analytics). List each third party by name — PIPEDA requires this.                  |
| **Data retention**       | Active accounts: indefinite. Deleted accounts: personal data purged within 30 days. Billing records: 7 years (CRA requirement).                                                      |
| **User rights**          | PIPEDA gives users the right to: access their data, correct inaccuracies, withdraw consent, and request deletion. Provide a support email for these requests.                        |
| **Location data**        | Consumer location used only when app is open to show nearby trucks. Never stored long-term. Never sold. Never shared with operators.                                                 |
| **Children**             | App not directed at users under 13. No knowingly collected data from minors.                                                                                                         |

### Document 2 — Terms of Service

Protects you legally when operators dispute charges, post bad content, or misuse the platform. Must be agreed to at signup — use a checkbox "I agree to the Terms of Service" with a link.

✅

#### Operator Obligations

Operators must provide accurate information. Fake listings, misleading menus, or fraudulent profiles result in immediate suspension. No refund on termination for policy violations.

📸

#### Content Ownership

Operators retain ownership of their photos and content. By uploading, they grant TruckTrack a licence to display it on the platform. TruckTrack does not claim ownership.

💳

#### Billing Terms

Subscriptions renew automatically. No partial-month refunds after cancellation. Winter pause rules. Failed payment downgrade process. All must be explicitly stated here.

⚖️

#### Limitation of Liability

TruckTrack is not responsible for truck quality, food safety, or service delivery. You are a platform, not a food vendor. This clause is critical for any consumer complaint or food-related incident.

🔄

#### Plan Changes

You reserve the right to change pricing with 30 days notice. Operators can cancel before the new price takes effect without penalty. Required to avoid disputes when you eventually raise prices.

📍

#### Governing Law

All disputes governed by the laws of Ontario, Canada. Venue for any legal proceedings: Ottawa, Ontario. Keeps you on home turf if anything goes wrong.

### Document 3 — PIPEDA Compliance Checklist

PIPEDA — Canada's Personal Information Protection and Electronic Documents Act — governs how private-sector businesses collect and handle personal data. It applies to TruckTrack from Day 1 since you're collecting names, emails, and location data.

| Principle                  | What TruckTrack Must Do                                                                             | Status               |
| -------------------------- | --------------------------------------------------------------------------------------------------- | -------------------- |
| **Accountability**         | Designate a privacy officer (you, at this stage). Have a documented privacy policy.                 | 🟢 Simple            |
| **Identifying purposes**   | State clearly why you collect each piece of data before or at the time of collection.               | 🟢 In Privacy Policy |
| **Consent**                | Obtain meaningful consent at signup. Checkbox agreeing to Privacy Policy is sufficient.             | 🟢 At signup         |
| **Limiting collection**    | Only collect data you actually need. Don't collect date of birth, SIN, or other unnecessary fields. | 🟢 Already lean      |
| **Limiting use**           | Don't use operator data for marketing without consent. Don't sell consumer location data.           | 🟢 Policy commitment |
| **Accuracy**               | Allow users to update their information. Profile edit screen covers this.                           | 🟢 Dashboard feature |
| **Safeguards**             | Encrypt data in transit (HTTPS always). Supabase encrypts at rest. Never log raw passwords.         | 🟡 Verify at launch  |
| **Openness**               | Privacy Policy must be publicly accessible without requiring login.                                 | 🟢 Public URL        |
| **Individual access**      | Respond to data access requests within 30 days. Provide a support email for requests.               | 🟡 Process needed    |
| **Challenging compliance** | Provide a mechanism for complaints. Support email is sufficient at this stage.                      | 🟢 Support email     |

### App Store Legal Requirements

🍎

#### Apple App Store

Requires: Privacy Policy URL in App Store Connect. Privacy nutrition labels (what data is collected and how it's used). Location usage description string in the app explaining why location is needed.

REQUIRED BEFORE SUBMISSION

🤖

#### Google Play Store

Requires: Privacy Policy URL in the Play Console. Data safety form declaring what data is collected, shared, and whether it's encrypted. Location permission rationale in the app.

REQUIRED BEFORE SUBMISSION

05d — Operator Support

## HOW WE SUPPORT OPERATORS

A food truck operator struggling with a technical issue at 11am on a Tuesday — 30 minutes before the lunch rush — is your worst-case scenario. A solid support system prevents this from becoming a churn event.

### Support Channels

💬

#### In-App Live Chat

Crisp or Intercom free tier embedded in the operator dashboard. Operators can message you directly from within the product. Chat history saved — you can reply asynchronously without being tied to a phone.

PRIMARY CHANNEL

📧

#### Support Email

[email protected] — a dedicated inbox, not your personal email. Forward to your main inbox. Use Crisp or a simple help desk to track open tickets and ensure nothing falls through the cracks.

SECONDARY CHANNEL

📚

#### Help Centre / FAQ

A simple FAQ page covering the 10 most common questions: How do I update my location? Why aren't my followers getting notifications? How do I pause for winter? How do I cancel? Reduces support volume by 60%.

LAUNCH WITH MVP

🎥

#### Onboarding Video

A 2-minute screen recording walkthrough sent to every newly approved operator. Shows them exactly how to post their first location update and send their first notification. Reduces "how do I use this?" questions to near zero.

PHASE 2

### Support Response SLA

| Issue Type      | Target Response   | Example                                                                                      |
| --------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| **🔴 Critical** | Under 2 hours     | Operator can't update location before lunch rush, billing double-charged, account locked out |
| **🟡 Standard** | Same business day | Push notifications not sending, photo upload failing, menu not displaying correctly          |
| **🟢 General**  | Within 48 hours   | How-to questions, billing inquiries, feature requests, profile help                          |

### Top 10 FAQ — Build These First

| #   | Question                                   | Answer Summary                                                                                                          |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | How do I update my location?               | Dashboard → Today's Location → Drop pin or search address → Set hours → Publish                                         |
| 2   | Why aren't my followers getting notified?  | Push notifications only sent on Starter+ plans. Free tier updates the map but doesn't notify followers.                 |
| 3   | How do I pause my subscription for winter? | Dashboard → Billing → Hibernate for Winter → Set return date → Confirm                                                  |
| 4   | Can I change my plan anytime?              | Yes. Upgrade or downgrade from the Billing section. Changes take effect immediately with prorated charge or credit.     |
| 5   | How do I set up my loyalty stamp card?     | Pro plan required. Dashboard → Loyalty → Set reward (e.g. "10 stamps = free item") → Your QR code is auto-generated.    |
| 6   | Why is my profile not showing on the map?  | Profile must be approved and you must have published a location for today. Check your approval status in the dashboard. |
| 7   | How do I connect my Instagram?             | Pro plan required. Dashboard → Profile → Connect Instagram → Authorize via Meta login.                                  |
| 8   | Can I have the app in French?              | Yes. The app follows your device language automatically. You can also switch manually in Settings → Language.           |
| 9   | How do I cancel my subscription?           | Dashboard → Billing → Cancel Plan. Access continues until end of current billing period. No partial refunds.            |
| 10  | I was charged incorrectly — what do I do?  | Email [email protected] with your invoice number. We resolve billing issues within 24 hours.                            |

**Pro tip:** For your first 20 operators, do proactive check-ins. Email each one after their first week: "How's TruckTrack working for you so far?" These conversations generate your best feature ideas, surface issues before they become churn, and build the personal relationships that make Ottawa operators recommend you to other trucks.

06 — Tech Stack

## HOW WE BUILD IT

A lean, modern stack you can build solo. No over-engineering. Every choice prioritizes speed-to-market and long-term scalability.

Mobile App

React Native

iOS + Android from one codebase. Expo for fast iteration.

Operator Dashboard

Next.js (TypeScript)

Your existing skills. SSR for SEO on truck profile pages.

Backend API

Node.js + TypeScript

REST API. Your strongest skill. Deploy on Railway or Render.

Database

PostgreSQL + PostGIS

PostGIS for geo queries ("trucks near me"). Supabase for easy hosting.

Push Notifications

Firebase FCM

Free. Handles iOS + Android. Critical for storm alerts.

Maps

Mapbox

Cheaper than Google Maps at scale. Better customization for branded experience.

Payments

Stripe

Subscriptions + one-time fees. Battle-tested in Canada.

QR Loyalty

qrcode.react

Generate per-truck QR codes. Operator scans customer code. Simple, no hardware needed.

Auth

Supabase Auth

Email + Google login. Free tier handles early stage easily.

Storage

Cloudflare R2

Cheap photo/media storage. S3-compatible API.

Analytics

PostHog

Open source product analytics. Free self-hosted or cheap cloud.

Email

Resend

Simple transactional email API. Great DX for Node.js developers.

Instagram Sync (Pro)

Instagram Graph API

Fetch latest posts from truck's Business account via OAuth. Cache photos in R2. Requires Meta App Review approval.

### Infrastructure Cost at MVP Stage

| Service                      | Plan                   | Monthly Cost |
| ---------------------------- | ---------------------- | ------------ |
| Supabase (DB + Auth)         | Free tier → $25/mo Pro | $0–$25       |
| Railway (API hosting)        | Starter                | $5           |
| Cloudflare R2 (storage)      | Free tier (10GB)       | $0           |
| Firebase FCM (push)          | Free                   | $0           |
| Mapbox                       | Free (50k loads/mo)    | $0           |
| Resend (email)               | Free (3k emails/mo)    | $0           |
| **Total MVP Infrastructure** | **~$5–$30/mo**         |

07 — MVP Scope

## WHAT TO BUILD FIRST

The MVP is intentionally minimal. Prove the core loop first: trucks update their location → consumers follow → trucks pay to send push notifications. Everything else comes later.

**MVP Rule:** Build only what closes the feedback loop. A truck should be able to sign up, post a location, and have a follower get notified within 10 minutes of opening the app for the first time.

### MVP Feature Checklist (6–8 Weeks)

| Feature                                                                                    | Platform                     | Week        | Priority   |
| ------------------------------------------------------------------------------------------ | ---------------------------- | ----------- | ---------- |
| Truck onboarding (name, cuisine, photos)                                                   | Web dashboard                | 1           | 🔴 Must    |
| Draft profile builder with completeness bar                                                | Web dashboard                | 1           | 🔴 Must    |
| Submit for review flow + auto validation checks                                            | Web dashboard                | 1–2         | 🔴 Must    |
| Admin approval panel (approve / decline + reason)                                          | Web — admin only             | 2           | 🔴 Must    |
| Approval / decline email notifications to operator                                         | Email (Resend)               | 2           | 🔴 Must    |
| Location update (pin + hours)                                                              | Web + Mobile                 | 1–2         | 🔴 Must    |
| Consumer map with truck pins                                                               | Mobile app                   | 2–3         | 🔴 Must    |
| Follow a truck                                                                             | Mobile app                   | 3           | 🔴 Must    |
| Push notification on location update                                                       | Mobile app + FCM             | 3–4         | 🔴 Must    |
| Truck profile page (menu, photos, schedule)                                                | Mobile + Web                 | 4           | 🔴 Must    |
| Stripe subscription (Starter plan)                                                         | Web dashboard                | 4–5         | 🔴 Must    |
| Daily specials post                                                                        | Web dashboard                | 5           | 🟡 Should  |
| Storm / cancellation alert                                                                 | Web + Mobile                 | 5–6         | 🟡 Should  |
| Basic follower count analytics                                                             | Web dashboard                | 6           | 🟡 Should  |
| QR loyalty stamp card                                                                      | Mobile + Dashboard           | 7–8         | 🟢 Nice    |
| Catering inquiry form (Level 1) — request form, operator inbox, confirm + referral invoice | Web dashboard + consumer app | 8           | 🟢 Nice    |
| Instagram photo sync (Pro) — Meta OAuth + Graph API fetch + R2 cache                       | Web dashboard                | Post-MVP    | ⚪ Phase 2 |
| Catering marketplace (Level 2) — bidding, contracts, Stripe deposit, guarantee protocol    | Web dashboard + consumer app | Month 10–12 | ⚪ Phase 2 |

08 — Go-to-Market

## HOW WE LAUNCH

The classic two-sided marketplace cold start problem: you need trucks to get users, and users to get trucks. Solve supply first — always.

### Phase 1: Supply First (Month 1–2)

🦶

#### Direct Outreach

Visit Ottawa food truck hotspots in person — ByWard Market, Lansdowne, Westboro. Talk to 5 trucks face-to-face per week. Offer free Starter tier for first 3 months.

WEEK 1–4

📣

#### Ottawa Food Truck Rally

The annual September rally is your single best launch event. Table presence, onboard 20+ trucks in one day. Make this your public launch date.

SEPTEMBER LAUNCH

🤝

#### Ottawa Food Truck Association

Partner with any existing operator associations or WhatsApp groups. One credible endorser unlocks 20 trucks immediately.

LEVERAGE

🎁

#### Free Onboarding Service

Personally set up the first 10 trucks' profiles for them. Take their photos, write their bios. Reduce friction to zero.

CONCIERGE LAUNCH

### Phase 2: Demand Side (Month 2–3)

📍

#### Ottawa Reddit / Local Groups

r/ottawa has 200k+ members. Post authentically about the app. Ottawa Foodies Facebook groups. Don't spam — add value first.

🏢

#### Corporate Lunch Offices

Ottawa has a huge federal government workforce. Post flyers at office buildings near food truck clusters. "Know where your favourite truck is today."

📸

#### Truck Social Amplification

Ask each onboarded truck to share their TruckTrack profile link on Instagram. Their existing followers become your users.

🗞️

#### Ottawa Media

Ottawa Citizen, CBC Ottawa, and local food bloggers love local tech stories. One news mention drives hundreds of downloads.

### Phase 3: Festival Strategy (Month 4–6)

Festivals are not just a marketing channel — they are a revenue event, a consumer acquisition spike, and a supply-side onboarding machine all at once. Ottawa runs 2–3 food truck festivals per season. Each one should be treated as a mini product launch.

**Core insight:** One festival organizer deal unlocks 50+ trucks in a single handshake. That's worth more than 10 weeks of individual outreach. Approach organizers first, trucks second.

### Three Festival Revenue Layers

📦

#### Festival Listing Package

Trucks participating in a festival but not yet on TruckTrack pay a one-time fee to get a temporary profile active during the event. They appear on the festival map, their menu is shown, consumers can follow them. After the festival they're prompted to convert to a monthly plan.

$49–$99 / TRUCK

🤝

#### Organizer Partnership

Pitch TruckTrack to festival organizers as their official app. In exchange for being listed as a requirement ("all trucks must be on TruckTrack"), you offer a flat sponsorship deal or build their festival mode for free. One deal = 50 trucks onboarded instantly.

$500–$2,000 FLAT

🗺️

#### Festival Mode (Consumer)

A special in-app view showing the festival grounds map, which truck is at which stall, estimated wait times, and featured specials. Free for consumers — but drives thousands of downloads on event day. Your biggest annual acquisition spike.

FREE — ACQUISITION

### Festival Mode — What It Shows

| Feature                      | Set By                           | Consumer Sees                                             |
| ---------------------------- | -------------------------------- | --------------------------------------------------------- |
| **Festival grounds map**     | Admin (you) uploads layout once  | Overhead map with labelled stalls                         |
| **Truck stall assignment**   | Operator sets their stall number | Pin on map at correct stall                               |
| **Wait time estimate**       | Operator updates manually        | "~10 min wait" badge on truck pin                         |
| **Today's festival special** | Operator posts via dashboard     | Highlighted on truck card                                 |
| **Follow prompt**            | Automatic                        | "Follow this truck to get notified when they're near you" |
| **Priority placement**       | Pro subscribers                  | Featured at top of festival truck list                    |

### Revenue Per Festival Event

| Source                               | Calculation                               | Est. Revenue    |
| ------------------------------------ | ----------------------------------------- | --------------- |
| **Non-subscriber festival listings** | 30 non-subscriber trucks × $49            | $1,470          |
| **Organizer partnership fee**        | Flat deal with festival org               | $500–$2,000     |
| **Post-festival conversions**        | 10 trucks → Starter $19/mo ongoing        | $190 MRR tail   |
| **Consumer downloads (indirect)**    | 500–1,000 new users → future Pro upgrades | Long-term value |
| **Total per festival event**         | **$2,000–$4,000**                         |

**Ottawa season math:** 2–3 festival events per year (Food Truck Festival at Lansdowne, Ottawa Food Truck Rally in September, plus 1 spring event) = **$4,000–$12,000 in festival-driven revenue annually** , on top of regular MRR. This is your single biggest revenue spike of the year — plan around it.

### Festival Outreach Playbook

📅

#### 3 Months Before

Contact festival organizer. Pitch TruckTrack as the official festival app. Offer to build festival mode for free in exchange for being listed as a requirement for participating trucks.

ORGANIZER FIRST

📧

#### 6 Weeks Before

Email all confirmed festival trucks. "Your truck is at [Festival Name] — claim your free TruckTrack listing for the event. Upgrade to a festival package to be featured on the official map."

TRUCK OUTREACH

📲

#### Day of Festival

Flyers at the entrance and at each truck's stall with a QR code linking to the festival map. "Navigate the festival — download TruckTrack." This is your highest-volume consumer acquisition moment.

CONSUMER PUSH

🔄

#### Week After

Email all festival truck listings with conversion offer: "You were featured at [Festival Name] — keep your TruckTrack profile active year-round for $19/mo. First month free." Strike while the value is fresh.

CONVERT & RETAIN

09 — Roadmap

## 18-MONTH PLAN

Month 1–2

#### 🔨 Build MVP

- Core map + schedule + follow + push notifications
- Operator dashboard + Stripe subscriptions
- Onboard first 5 Ottawa trucks (free)
- Internal beta — friends and family testing

Month 3

#### 🚀 Ottawa Soft Launch

- Submit to App Store + Google Play
- Onboard 15–20 trucks via direct outreach
- Post on r/ottawa and local Facebook groups
- Target: 200 consumer downloads, 15 trucks active

Month 4–5

#### 💰 First Revenue

- Convert free trucks to paid Starter ($19/mo)
- Launch loyalty stamp card (Pro tier)
- First catering inquiry referrals
- Target: $300–$500 MRR, 500 consumers

Month 6

#### 🎪 Ottawa Food Truck Rally Launch Event

- Attend rally in person, onboard 25+ trucks in one day
- Massive consumer acquisition event
- Press outreach to Ottawa Citizen, CBC Ottawa
- Target: $800–$1,200 MRR, 2,000 consumers

Month 7–9

#### ❄️ Winter Prep + Analytics

- Build advanced operator analytics dashboard
- Add indoor market vendors (ByWard Market) to survive winter
- Expand to Kingston (same playbook, smaller city)
- Target: $1,500 MRR stable

Month 10–12

#### 🌎 Second City + Catering Marketplace

- Port the playbook to a second Canadian city (Hamilton or Halifax)
- Remote outreach via Instagram DMs to truck operators
- Launch Catering Level 2 — full marketplace with bidding, contracts, deposit via Stripe
- Target first 10 Level 2 bookings — validate the commission model
- Activate TruckTrack Guarantee protocol for cancellation protection
- Target: $2,500 MRR subscriptions + $500–$1,000 catering commissions

Month 13–18

#### 📈 Scale + White Label

- Add Calgary + Edmonton (massive food truck scenes)
- Explore white-label licensing to food truck associations
- Consumer Pro tier ($2.99/mo) with premium features
- Target: $5,000–$8,000 MRR

10 — Financials

## THE NUMBERS

### MRR Projections — Conservative

| Month    | Paid Trucks | Avg Plan | MRR    | Infra Cost | Net    |
| -------- | ----------- | -------- | ------ | ---------- | ------ |
| Month 3  | 8           | $19      | $152   | $30        | $122   |
| Month 4  | 15          | $22      | $330   | $30        | $300   |
| Month 6  | 30          | $25      | $750   | $50        | $700   |
| Month 9  | 50          | $26      | $1,300 | $75        | $1,225 |
| Month 12 | 80          | $28      | $2,240 | $100       | $2,140 |
| Month 18 | 180         | $30      | $5,400 | $200       | $5,200 |

**Catering bonus:** If 10 catering bookings/month at average $800 value with 8% referral = **+$640/mo** additional revenue by Month 12, not included above.

### Break-Even Analysis

7

Trucks to cover infra costs

Month 3

Projected break-even

$0

Required startup capital

$5K+

Month 18 net MRR target

11 — Risks & Mitigations

## WHAT COULD GO WRONG

| Risk | Severity | Probability | Mitigation |
| ---- | -------- | ----------- | ---------- |

**Trucks don't update their schedule**  
App becomes inaccurate, consumers stop using it | High | High | Make updates 30-second frictionless. Send daily 8am "update your location" SMS reminder. Tie notifications to paid plan.  
**Ottawa seasonality**  
6-month dead season kills MRR | High | Certain | Expand to year-round indoor vendors. Launch second southern city (Vancouver, Halifax) in winter months.  
**Trucks won't pay**  
Operators are cash-strapped and resistant to subscriptions | Med | Med | Start with free tier to build habit. Prove value (follower growth) before asking for money. $19 is low enough to be "rounding error" budget.  
**Street Food App revives**  
Existing competitor fixes their product | Med | Low | Move fast to lock in Ottawa trucks with relationships. Being local is an advantage a remote team can't replicate.  
**Consumer app adoption is slow**  
Not enough users for trucks to see value | High | Med | Seed with 5 trucks with large Instagram followings. Their followers download the app. Leverage existing audiences, don't build from zero.  
**Solo developer bottleneck**  
Feature velocity too slow to retain early customers | Med | Med | MVP is intentionally small. Don't over-promise. Set clear expectations. Use AI (Claude) for accelerated development.

### Key Success Factors

🔑

#### Speed of Onboarding

The faster a truck can sign up and go live, the more trucks you get. Every extra click kills conversion.

CRITICAL

🔑

#### Schedule Accuracy

One bad experience (consumer goes to a closed truck) creates churn. Reliability is your product.

CRITICAL

🔑

#### Local Relationships

You live in Ottawa. That is your unfair advantage. Use it. Show up in person. Know the operators by name.
