# Transition Types — Known Options

These are types we've identified. Before implementing ANY of them, research the specific CSS/SVG/Canvas technique first.

## Proven (implemented in GregV2.tsx)
- **Blob + particle trail** — wobbly SVG blob on bezier curve, particles fall behind
- **Gooey merge** — SVG feColorMatrix filter, elements melt together
- **Film grain** — feTurbulence seed={frame} overlay
- **Neon glow** — layered feGaussianBlur on accent elements

## Researched (ready to implement)
- **Lightning arc** — midpoint displacement algorithm, Canvas2D, 3-layer glow with additive blending, flicker pattern. Research notes in `research/element-transitions-guide.md`

## Identified (need research before implementation)
- **Particle dissolve** — element shatters into particles, reforms as target
- **Elastic snap** — rubber band stretch with spring overshoot
- **Ripple/shockwave** — expanding rings, target appears when wave arrives
- **Portal/wormhole** — rotating vortex sucks in A, spits out B
- **Shatter & reform** — glass break into fragments, reform at target
- **Ink/smoke flow** — feTurbulence displacement on moving shape
- **Origami fold** — CSS 3D perspective transforms, paper folding
- **Magnetic pull** — force field distortion, skew toward target

## RULE: Research before implementing
For each new type, search for:
1. The exact algorithm (midpoint displacement, Perlin noise, spring equation, etc)
2. Best rendering method (Canvas2D vs SVG vs pure CSS)
3. How to achieve glow/polish
4. Performance in frame-by-frame rendering (Remotion)
5. CodePen/GitHub examples with real code
