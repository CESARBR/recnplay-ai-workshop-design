---
version: alpha
name: CESAR
description: CESAR is Brazil's most comprehensive innovation and knowledge center, serving enterprises, startups, and educational institutions through integrated technology solutions, professional development, and business acceleration programs. 
colors:
  primary: "#201813"
  secondary: "#7B675B"
  tertiary: "#F76003"
  neutral: "#F7F8F9"
  surface: "#FFFFFF"
  on-tertiary: "#FFFFFF"
  border: "#E8E5E3"
typography:
  h1:
    fontFamily: DM Sans
    fontSize: 3rem
    fontWeight: 700
  body-md:
    fontFamily: DM Sans
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: DM Sans
    fontSize: 0.75rem
    fontWeight: 600
rounded:
  sm: 6px
  md: 12px
spacing:
  sm: 8px
  md: 24px
  lg: 32px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.tertiary}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 20px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

# CESAR

## Overview

The brand embodies a 'Technical Pragmatism' aesthetic—clean, purposeful, and grounded in real-world impact rather than decorative flourish. The visual language combines a primary color with vibrant tertiary accents  against a bright, accessible white canvas, creating an interface that feels both authoritative and approachable. The emotional response is one of clarity and forward momentum: users encounter a system designed to cut through complexity and enable transformation.

## Colors

The palette is rooted in semantic tokens. Use the role (e.g. `{colors.primary}`) — never the hex literal — when authoring components.

- **primary (#201813)**
- **secondary (#7B675B)**
- **tertiary (#F76003)**
- **neutral (#F7F8F9)**
- **surface (#FFFFFF)**
- **on-tertiary (#FFFFFF)**
- **border (#E8E5E3)**

## Typography

| Token | Font | Size | Weight |
| --- | --- | --- | --- |
| `h1` | DM Sans | 3rem | 700 |
| `body-md` | DM Sans | 1rem | 400 |
| `label-caps` | DM Sans | 0.75rem | 600 |

## Layout

Spacing scale (use the named scale; avoid arbitrary values):

- `spacing.sm` — 8px
- `spacing.md` — 24px
- `spacing.lg` — 32px

## Elevation & Depth

Depth is conveyed through tonal layering and subtle borders rather than drop shadows. Cards lift from the warm neutral background through pure-white surfaces and a single hairline border.

## Shapes

Corner radius scale:

- `rounded.sm` — 6px
- `rounded.md` — 12px

## Components

### button-primary
- backgroundColor: `{colors.tertiary}`
- textColor: `{colors.on-tertiary}`
- rounded: `{rounded.sm}`
- padding: `12px 20px`

### button-secondary
- backgroundColor: `transparent`
- textColor: `{colors.tertiary}`
- rounded: `{rounded.sm}`
- padding: `12px 20px`

### card
- backgroundColor: `{colors.surface}`
- textColor: `{colors.primary}`
- rounded: `{rounded.md}`
- padding: `20px`

### input
- backgroundColor: `{colors.surface}`
- textColor: `{colors.primary}`
- rounded: `{rounded.sm}`
- padding: `10px 14px`

## Do's and Don'ts

- Do use tertiary exclusively for the single most important CTA per screen—typically a form submit or next-step button—to maintain visual hierarchy and prevent decision fatigue.
- Do maintain consistent 24px (md) padding inside all cards and containers to create a predictable, scannable layout rhythm across the interface.
- Do apply 200ms ease-out transitions to all color and shadow changes on interactive elements to provide smooth, professional feedback without feeling sluggish.
- Do use DM Sans at 16px (body-md) with 1.5x line-height (24px) for all body copy to ensure readability on screens and print at standard viewing distances.
- Do reserve full (9999px) border-radius exclusively for pill-shaped inputs, badges, and avatars to create a clear visual distinction for interactive elements.
- Do layer elevation using the three-tier shadow system (sm/md/lg) rather than color shifts to maintain a clean, accessible appearance across light and dark contexts.
- Don't use primary or secondary  as primary CTAs—these are supporting accents and will dilute the visual hierarchy if overused on critical actions.
- Don't apply border-radius greater than lg (8px) to standard buttons, cards, or form controls; excessive rounding creates a playful tone that conflicts with CESAR's professional, pragmatic brand voice.
- Don't reduce padding below sm (12px) inside components or below md (24px) between major sections; white-space is a design material and compression reduces clarity.
- Don't use shadows with blur radii exceeding 15px or opacity exceeding 0.1 on the primary shadow layer; deep shadows feel dated and reduce the system's modern, clean aesthetic.
