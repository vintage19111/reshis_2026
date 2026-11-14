---
name: Aero Orbit
colors:
  surface: '#111316'
  surface-dim: '#111316'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#bcc8cd'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#879397'
  outline-variant: '#3d494d'
  surface-tint: '#5dd5f7'
  primary: '#5dd5f7'
  on-primary: '#003642'
  primary-container: '#1aa9c9'
  on-primary-container: '#003845'
  inverse-primary: '#00677d'
  secondary: '#ffb957'
  on-secondary: '#462b00'
  secondary-container: '#d98e00'
  on-secondary-container: '#4c2f00'
  tertiary: '#6fd3f5'
  on-tertiary: '#003543'
  tertiary-container: '#3ba7c7'
  on-tertiary-container: '#003846'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b2ebff'
  primary-fixed-dim: '#5dd5f7'
  on-primary-fixed: '#001f27'
  on-primary-fixed-variant: '#004e5e'
  secondary-fixed: '#ffddb5'
  secondary-fixed-dim: '#ffb957'
  on-secondary-fixed: '#2a1800'
  on-secondary-fixed-variant: '#643f00'
  tertiary-fixed: '#b6ebff'
  tertiary-fixed-dim: '#6fd3f5'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004e60'
  background: '#111316'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  display-hero:
    fontFamily: Manrope
    fontSize: 52px
    fontWeight: '800'
    lineHeight: 58px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Manrope
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Manrope
    fontSize: 38px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Manrope
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
  mono-metric:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 28px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system powers an aerospace intelligence interface built for predictive demand modeling, load factor tracking, and yield intelligence. The visual language merges high-velocity consumer search layouts with institutional data density.

### Emotional Intent
The interface must communicate absolute mathematical certainty and technological vanguard. It balances frictionless exploratory interactions—reminiscent of premier consumer flight search engines—with the calculated precision of mission control software. Users should feel empowered, agile, and commanding over large-scale predictive datasets.

### Design Movement: Cyber-Aeronautics & Modern Minimalist Utility
The aesthetic framework balances two specialized dynamics:
- **Unified Monolithic Controls**: Search parameters and parameter adjusters sit inside wide, singular command panels with subtle internal dividers rather than isolated input boxes.
- **Orbital Instrumentation**: Backgrounds feature faint concentric coordinate rings, vector trajectory guides, and crisp atmospheric accents that evoke radar telemetry and flight corridor geometries without cluttering data surfaces.
- **Precision Data Surfaces**: Sharp typographic hierarchy, deep-contrast framing, and deliberate boundary lines establish instantaneous scanning of capacity risks and load projections.

## Colors

The system uses a technical cyber-aeronautical scheme designed for long-duration analytical work with prominent focal beacons.

### Palettes & Application Roles

- **Primary (`#1AA9C9`)**: Electric Cyan. Used as the principal focus beacon, key operational interactive states, predictive curve indicators, and high-impact CTA surfaces in the dark environment. In the light environment, it forms the signature hero atmospheric gradient when paired with Tertiary (`#0F8FAE`).
- **Secondary (`#F5A524`)**: Aviation Amber. Dedicated to alert states, critical capacity thresholds (e.g., predicted load factor > 92%), operational bottlenecks, and surge anomalies. Never used purely for decoration.
- **Tertiary (`#0F8FAE`)**: Deep Cyan. Serves as supporting vector accents, chart fill gradients, and depth layers behind key data clusters.
- **Neutral Canvas & Surfaces**:
  - *Dark Mode (Default)*: Pure deep ground `#0A0A0B`, elevated cards `#16181B`, structural boundary lines `#26292E`, crisp primary data text `#FFFFFF`, and muted metadata text `#9AA0A6`. High-contrast CTA buttons invert to vibrant Cyan (`#1AA9C9`) filled with dense `#0A0A0B` text.
  - *Light Mode*: Canvas surface `#F3F5F7`, elevated search containers and cards `#FFFFFF`, borders `#E2E5E9`, text `#0A0A0B`, and secondary text `#6B7280`. The primary CTA converts into high-contrast obsidian `#0A0A0B` with bold white text.

### Threshold System
Reserve Amber strictly for warning metrics and capacity overflows. Standard operational values retain primary cyan or monochrome neutrality to prevent cognitive fatigue.

## Typography

The typography relies on **Manrope** across all roles to ensure geometric clarity, tight numerical alignment, and balance in Cyrillic script.

### Hierarchy & Style Rules
- **Display & Headings**: Set at weights `700` and `800` with tight negative tracking (`-0.01em` to `-0.03em`) to mimic aerospace telemetry identity. Used for high-impact market projections and section headers.
- **Numerical Data & Metrics (`mono-metric`)**: Utilize tabular figures (`font-variant-numeric: tabular-nums`) to ensure load factors, passenger volumes, and currency values align flush across lists and comparison matrices.
- **Micro-labels (`label-sm`)**: Set in uppercase with wide letter spacing (`0.06em`) at weight `700` to denote flight classes, status pills, and coordinate badges.
- **Cyrillic Execution**: Manrope ensures optimal legibility for Russian language strings (e.g., «Прогноз загрузки», «Спрос на направления», «Пиковые интервалы»), preventing odd descender collisions and uneven line baselines.

## Layout & Spacing

The canvas is engineered around a standard desktop viewport of 1440px using a 12-column fluid grid system with structural gutters and adaptive container constraints.

### Desktop Layout Framework (1440px)
- **Container Max-Width**: 1360px centered with `margin: 2.5rem` outer canvas boundary.
- **12-Column Grid**: Dynamic columns separated by `gutter: 1.5rem` (24px) for analytical dashboards and forecasting cards.
- **Hero Staging Area**: Vertical rhythm is governed by `space-xl` (40px) and double-step margins (80px) above the fold, ensuring the unified forecast search bar remains the unencumbered centerpiece.

### Mobile & Tablet Adaptation
- **Tablet (768px - 1024px)**: Columns collapse to 8; margins compress to `1.5rem`; search bar segments become a 2x2 grid module.
- **Mobile (< 768px)**: Canvas margins drop to `1rem`; columns collapse to single-column full flow; search modules stack vertically into a singular grouped card while retaining uniform inner dividers.

## Elevation & Depth

Visual hierarchy does not rely on heavy, fuzzy drop shadows; instead, it uses crisp spatial boundaries, subtle tone steps, and luminous orbital wireframes.

### Tonal Tiers (Dark Theme)
- **Ground (`#0A0A0B`)**: Deep infinite field housing faint SVG orbital lines and coordinate arcs (rendered at 4-7% cyan stroke opacity).
- **Surface Elevation (`#16181B`)**: Forecasting widgets, route metrics, and analytical cards.
- **Interactive Top Tier (`#1F2327`)**: Hovered segment fields, open dropdown panels, and active tooltips.
- **Borders (`#26292E`)**: Delivers crisp structural definition without visual noise.

### Shadow Profiles
- **Command Bar Ambient Drop**: `0 12px 32px -8px rgba(0, 0, 0, 0.65), 0 0 0 1px #26292E`.
- **Active Accent Glow**: Focused inputs and primary forecast cards project a soft, atmospheric cyan halo: `0 0 24px -4px rgba(26, 169, 201, 0.25)`.
- **Light Theme Separation**: Soft ambient occlusion `0 8px 30px rgba(10, 10, 11, 0.05)` layered with a hair-line border `#E2E5E9`.

## Shapes

The interface balances soft consumer-grade curves with structural precision. Standard components utilize `0.5rem` (8px), while elevated hero elements and major structural containers leverage large radii (`rounded-lg` at `1rem` / 16px and `rounded-xl` at `1.5rem` / 24px).

### Curvature Taxonomy
- **The Unified Search Bar**: Styled with `rounded-xl` (24px) as a single continuous pill or rounded block housing all segmented inputs.
- **Analytics & Demand Cards**: Encapsulated in `rounded-lg` (16px) to maintain a modern, friendly posture.
- **Segment Selectors & Tags**: Built with `rounded-sm` (4px) to `rounded-md` (8px) for crisp, data-dense efficiency.

## Components

### 1. Unified Demand Search Bar (Hero Anchor)
- **Architecture**: A single, prominent wide container (`height: 64px`, `rounded-xl: 24px`, background `#16181B` in dark, `#FFFFFF` in light) divided into segmented zones: Origin («Откуда»), Destination («Куда»), Forecast Window («Период спроса»), Passenger Segment («Класс / Сегмент»).
- **Segment Dividers**: 1px vertical borders (`#26292E` dark, `#E2E5E9` light) spanning 60% of container height.
- **CTA Integration**: The right-most segment features an integrated search button:
  - *Dark Mode*: Solid vibrant cyan `#1AA9C9`, bold black text `#0A0A0B`, with subtle hover brightness.
  - *Light Mode*: Solid `#0A0A0B`, bold white text `#FFFFFF`.

### 2. Metric & Forecast Cards
- Surface background `#16181B` with `1px solid #26292E` and `rounded-lg` (16px).
- Upper metadata row displays airport IATA badges (`SVO → AER`) alongside confidence indices.
- Data body incorporates bold `mono-metric` figures alongside a micro vector sparkline showing predicted 30-day velocity.
- Warning cards automatically apply an amber micro-badge (`#F5A524`) and amber left-accent track line (3px).

### 3. Filter Chips & Temporal Switchers
- **Inactive**: Transparent surface with `#26292E` border, text `#9AA0A6`.
- **Active**: Filled with `#1AA9C9` at 15% opacity, border `1px solid #1AA9C9`, label text `#FFFFFF` (or `#0A0A0B` in light mode).
- Corner radius: `rounded-md` (8px).

### 4. Input Fields & Select Dropdowns
- Integrated cleanly within card containers without nested framing.
- **Floating Labels**: 11px uppercase bold in `#9AA0A6`.
- **Value Text**: 15px bold `#FFFFFF`.
- **Focus State**: Segment background illuminates to `#1F2327` with a cyan baseline indicator.

### 5. Checkboxes, Toggles & Radios
- **Checkboxes**: `rounded-sm` (4px), 18px box. Checked state features solid `#1AA9C9` background with dark tick.
- **Threshold Toggles**: Pill track (`36px x 20px`) with a sliding white thumb; active track glows cyan `#1AA9C9`.

### 6. Alert & Capacity Overflow Banners
- Dedicated card styling for load factor risk: Dark neutral base with `1px solid #F5A524`, featuring amber icon badge and clear Russian alert messaging («Превышение предельной загрузки: рейс 412»).