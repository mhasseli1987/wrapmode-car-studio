# Wrapmode Car Wrap Studio --- Project Handoff

## User preferences

-   Keep responses short and direct to reduce token usage.
-   Work strictly step-by-step.
-   Do not explain the next step until the current step is finished and
    approved.
-   Review the result after each step before moving on.

## Project

Brand: **Wrapmode** Main site: https://wrapmode.ir

Goal: Build a separate **Wrapmode Car Wrap Studio** for approximately 10
real decorative car-wrap designs.

The app should eventually be independently deployed, preferably on
Vercel, e.g. `studio.wrapmode.ir`.

## Core concept

This is NOT a color configurator.

The user can: 1. Choose **Sedan** or **Hatchback**. 2. Choose one of
about 10 real wrap designs. 3. See the selected design applied to the
vehicle. 4. See the price. 5. Switch between designs. 6. Eventually
request/order installation.

Each wrap has a thumbnail, name, price, description, compatibility, and
eventually a real texture.

## Design references

### ENZO.DEV --- primary design-language reference

User's own repo: https://github.com/mhasseli1987/enzo-dev

Use it as inspiration for: - card design - subtle borders - spacing -
typography - hover states - micro-interactions - restrained purple
accent - dark premium aesthetic - cinematic composition - subtle
grain/texture - GSAP-style motion - component quality -
premium/experimental/creative feel

Do NOT copy its code or layout.

### CUPRA configurator

User provided a CUPRA configurator screenshot. Use it for configurator
UX/layout ideas: - vehicle as visual hero - right-side design selector -
price - vehicle selector - clear hierarchy

### HorizonX Apex Roadster

https://horizonx.so/explore/apex-roadster

Use only as motion/interaction inspiration. The Wrapmode version must be
much simpler.

## Current UI status

The first implementation is already built by GLM 5.0 in Z.ai.

It currently has: - responsive layout - Wrapmode header - Sedan /
Hatchback selector - right-side scrollable sidebar - 10 placeholder
designs - thumbnails - Toman pricing - dynamic design selection -
selected-design information panel - CTA - restrained animations - mobile
responsive behavior

The visual refinement pass also incorporated the ENZO.DEV design
language.

The current accepted visual state: - dark/premium appearance - larger
central vehicle - right sidebar - refined cards and borders - restrained
purple accent - CAR WRAP STUDIO heading - overall premium/creative feel

### Current remaining visual issue

The selected wrap pattern is still not sufficiently visible on the
vehicle. The contrast/readability of the wrap texture needs improvement
later.

**Do not modify this again unless the user asks. The current phase is
considered approved.**

## Current phase

Visual refinement is DONE and approved.

**The next phase has NOT started yet.**

Do not start or explain the next phase until the user explicitly asks.

## Z.ai / GLM

Model: **GLM 5.0**

Connected: - 21st.dev MCP - Canva MCP - video-to-website skill

Potentially useful later: - Browser / Playwright - Three.js / React
Three Fiber - GSAP

Do not use extra MCPs/skills unnecessarily.

## Technology direction

Preferred: - Next.js - TypeScript - React - Tailwind CSS - Three.js -
React Three Fiber - Drei - GSAP

Use only what is actually needed.

## Architecture direction

Keep product data separate from UI and make assets replaceable later.

Suggested structure:

``` text
app/
components/
  studio/
  vehicle/
  wrap-selector/
  ui/
data/
lib/
public/
  models/
  wraps/
  vehicles/
```

Example data shape:

``` ts
type Vehicle = {
  id: string
  name: string
  type: "sedan" | "hatchback"
  modelAsset?: string
}

type WrapDesign = {
  id: string
  name: string
  price: number
  thumbnail: string
  compatibleVehicles: string[]
  texture?: string
  description?: string
}
```

## 3D rule

Do not add real 3D until that phase is explicitly started.

When it is time: - Three.js - React Three Fiber - Drei - GLB/GLTF -
textures/materials - UV mapping - lighting - OrbitControls

The architecture should allow a real vehicle model to replace
placeholders later.

## Overall design goal

Final experience:

**Premium automotive configurator + ENZO.DEV design language + Wrapmode
identity**

Avoid: - dashboard-like UI - generic ecommerce look - excessive neon -
excessive glassmorphism - excessive gradients - sci-fi/gaming look -
animation overload

The vehicle and wrap design must remain the visual heroes.

## Prompting rule for GLM

Every future GLM prompt should clearly state: - what to change - what
must remain unchanged - what is currently out of scope - that GLM must
stop after completing that phase

Use: - ENZO.DEV = design language - CUPRA = configurator/layout
inspiration - Apex Roadster = motion inspiration - Wrapmode =
brand/product identity - user-provided images = visual references

## Instruction for a new ChatGPT session

If this file is provided in a new session, first acknowledge that the
project context has been received and wait for the user's instruction.

Do not start a new phase automatically.
