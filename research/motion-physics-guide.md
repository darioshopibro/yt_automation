# Motion Physics & Professional Animation Guide

> Comprehensive research on animation physics, motion design principles, and techniques for making CSS/React animations look professional. Compiled from web sources, YouTube tutorials, and industry best practices.

---

## 1. ANIMATION PHYSICS PRINCIPLES

### Why After Effects Animations Look Better Than CSS

The fundamental difference comes down to **control granularity**:

- **After Effects** uses the **Graph Editor** — animators manipulate actual velocity and acceleration curves with Bezier handles. Every frame's speed is hand-tuned. Pros spend 80% of their time in the graph editor, not placing keyframes.
- **CSS transitions** only offer predefined timing functions (`ease`, `ease-in-out`, `linear`) or a single `cubic-bezier()`. This is like painting with 4 colors vs. an unlimited palette.
- **After Effects** supports per-property curves — position eases differently than opacity, which eases differently than scale. CSS applies one timing function to all properties simultaneously.

**Key insight from School of Motion:** "The graph editor is where animation goes from amateur to professional. The timeline just sets WHAT happens — the graph editor determines HOW it feels."

### Spring Physics vs. CSS Transitions

| Aspect | CSS Transitions | Spring Physics |
|--------|----------------|----------------|
| Mental model | Duration + curve | Mass + stiffness + damping |
| Duration | Fixed (you specify ms) | Emergent (physics determines when it settles) |
| Interruption | Snaps to new target instantly, "hits a wall" | Takes current velocity into account, swings naturally |
| Feel | Mechanical, predictable | Organic, weighted, alive |
| Overshoot | Only with custom cubic-bezier hacks | Natural overshooting built-in |
| Responsiveness | Same animation regardless of distance | Adapts to distance automatically |

**Critical difference:** When you interrupt a CSS animation mid-flight (e.g., hover then unhover quickly), it reverses INSTANTLY — like hitting a wall. Spring physics takes the element's current inertia into account, slowing down first before swinging back. This is what makes springs feel "real."

Source: [Josh W. Comeau — Spring Physics](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/)

### Mass, Damping, Stiffness — How Pros Tune These

**Default values (Framer Motion / Motion):** `stiffness: 100, damping: 10, mass: 1`

#### Stiffness (how "tight" the spring is)
- **Low (50-100):** Lazy, sluggish, floaty — good for background elements, large panels
- **Medium (100-300):** Responsive, snappy — good for cards, modals, general UI
- **High (300-1000):** Snappy, aggressive — good for buttons, toggles, micro-interactions

#### Damping (how quickly oscillation stops)
- **Low (5-10):** Bouncy, playful, attention-grabbing — use sparingly
- **Medium (10-20):** Slight overshoot then settle — professional, polished
- **High (20-40):** No bounce, just smooth deceleration — corporate, serious

#### Mass (how "heavy" the element feels)
- **Low (0.1-0.5):** Light, fast, nimble — icons, small elements
- **Medium (1):** Default, balanced feel
- **High (2-5):** Slow, weighty, deliberate — large panels, page transitions

#### Preset Combos

| Effect | Stiffness | Damping | Mass | Use Case |
|--------|-----------|---------|------|----------|
| **Snappy UI** | 300 | 20 | 0.5 | Buttons, toggles, small elements |
| **Smooth slide** | 100 | 20 | 1 | Panels, drawers, modals |
| **Bouncy entrance** | 300 | 10 | 1 | Attention-grabbing reveals |
| **Heavy/premium** | 80 | 25 | 2 | Large cards, page transitions |
| **Buttery smooth** | 60 | 30 | 1 | Sliders, smooth scrolling |
| **No bounce** | 100 | 30 | 1 | Professional, corporate feel |

Source: [Maxime Heckel — Physics Behind Spring Animations](https://blog.maximeheckel.com/posts/the-physics-behind-spring-animations/)

### Why Amateur Animations Look "Bouncy" and Cheap

1. **Too much bounce (low damping)** — Amateurs default to bouncy because it "looks animated." Pros use HIGH damping. The subtle overshoot-then-settle is what feels premium, not a full bounce.
2. **Default easing** — Using `ease` or `ease-in-out` for everything. Pros match easing to context (ease-out for entrances, ease-in for exits).
3. **Same duration for everything** — Amateurs use 300ms for all animations. Pros vary by element size and travel distance.
4. **Everything moves together** — No stagger, no offset, no overlapping action. Everything starts and stops at the exact same time.
5. **Linear movement** — Objects move in straight lines. Real objects move in arcs.

### What is "Weight" in Animation?

Weight is the illusion that an element has mass and is affected by gravity/inertia. You create weight through:

1. **Slow start, fast middle, slow end** — Heavy objects take time to accelerate and decelerate
2. **Overshoot and settle** — When a heavy object stops, it overshoots slightly then settles back (spring with medium damping)
3. **Follow-through** — Parts of the object continue moving after the main body stops (from School of Motion: "different parts of an object move at different times")
4. **Anticipation** — Before moving, the object "winds up" in the opposite direction
5. **Squash on landing** — Brief compression when coming to rest
6. **Different speeds for different elements** — Heavier parts move slower, lighter parts trail behind

**From fight animation tutorial (Howard Wimshurst):** "Speed and weight is power. You make it fast by taking out frames, creating space between positions. The body leads the movement, the extremity stays behind — this is how you sell weight."

### Easing Curves — Pros vs. Amateurs

| Amateur | Pro |
|---------|-----|
| `ease` (CSS default) | Custom cubic-bezier per property |
| `ease-in-out` for everything | Ease-out for entrances, ease-in for exits |
| Symmetric curves | Asymmetric — fast attack, slow settle |
| `linear` for movement | Arcs with custom acceleration |
| Same curve for all properties | Position eases differently than opacity |

**Pro curves commonly used:**

```
// Entrance (ease-out): fast start, gentle landing
cubic-bezier(0.16, 1, 0.3, 1)

// Exit (ease-in): gentle start, fast departure
cubic-bezier(0.7, 0, 0.84, 0)

// Movement (custom): quick attack, smooth settle
cubic-bezier(0.25, 0.46, 0.45, 0.94)

// Dramatic entrance: strong deceleration
cubic-bezier(0.0, 0.0, 0.2, 1)

// Apple-style smooth
cubic-bezier(0.4, 0.0, 0.2, 1)
```

**Rule from After Effects pros:** "Stronger curves on short moves, lighter curves on long moves. Short distance = aggressive easing. Long distance = gentler easing."

Source: [We Design Motion — Easing in After Effects](https://wedesignmotion.com/motion-design-how-tos/how-to-use-easing-for-smooth-animation-in-after-effects/)

---

## 2. ELEMENT TRANSFORMATION RULES

### How to Morph Shapes Smoothly

**Three approaches, ranked by quality:**

1. **SVG Path Morphing** (best for complex shapes) — Interpolate between SVG path data. Requires same number of points in source and target. Libraries: Flubber, GSAP MorphSVG.

2. **CSS clip-path transitions** — Define shapes via `clip-path: polygon()` and transition between them. GPU-accelerated. Works well for geometric shapes.

3. **Border-radius + width/height** (simplest) — Animate `border-radius` from `50%` (circle) to `8px` (card), combined with `width` and `height` changes. Use `transform: scale()` instead of direct width/height for performance.

**Key rules for smooth morphs:**
- Use `transform: scale()` not `width/height` — scale is GPU-accelerated and avoids layout recalculation
- Animate `border-radius` with percentage values for smooth transitions
- Keep a consistent anchor point (center, or where the user clicked)

Source: [CSS-Tricks — Shape Morphing](https://css-tricks.com/books/greatest-css-tricks/shape-morphing/)

### Rules for Visual Continuity During Transforms

1. **Maintain center of gravity** — The visual center of the element should move smoothly, not jump
2. **Preserve color** — Background color should crossfade, not snap
3. **Keep one axis stable** — If width is changing, keep the vertical center stable (or vice versa)
4. **Shared element transitions** — If morphing A into B, identify what they share (icon, title, color) and keep those elements persistent while everything else fades

### Text Changes During Morphs

- **Never morph text directly** — Text scaling looks terrible (blurry, wrong weight)
- **Fade out old text, fade in new text** — Use cross-fade with 30-40% overlap
- **Time the crossfade at 60-70% of the morph** — Text should start changing after the shape transition is already underway
- **Use opacity + slight translateY** — Text fades down/out while new text fades up/in

### Shadow Animation During Transforms

- **Shadows should animate WITH the element** — Don't snap shadow changes
- **Expanding element = larger, softer shadow** — As an element grows (e.g., card expanding), increase blur-radius and spread, decrease opacity
- **Collapsing element = tighter, sharper shadow** — Reverse the above
- **Elevation metaphor** — Larger shadows = element is "lifted" higher = more important

```css
/* Small state */
box-shadow: 0 2px 4px rgba(0,0,0,0.1);

/* Expanded state */
box-shadow: 0 12px 28px rgba(0,0,0,0.15);

/* Transition */
transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Border Radius Animation — What Looks Natural

- **Animate with absolute pixel values** for predictable results
- **Percentage-based** (`border-radius: 50%`) works great for circle-to-square morphs
- **Never go below 4px** on cards/containers — 0px corners look harsh during transitions
- **Match the border-radius curve** to the overall animation — if the element is spring-animating, the border-radius should use the same spring

### Scale vs. Width/Height — Which Looks Better and Why

**Scale wins. Always.**

| Property | Layout | Paint | Composite | Performance |
|----------|--------|-------|-----------|-------------|
| `width/height` | Yes (SLOW) | Yes (SLOW) | Yes | Bad — causes reflow |
| `transform: scale()` | No | No | Yes (FAST) | Great — GPU only |

**From Web Dev Simplified (64K views):** "Animating margin caused the CPU to run at maximum speed with zero idle time. Translating the same element? Almost entirely idle. The ONLY thing that changed was compositing, taking less than 1ms."

**The visual difference:** Scale animations maintain smooth 60fps even on 6x CPU throttling. Width/height animations become visibly choppy.

**The caveat:** `scale()` stretches content (text gets blurry). Solution: animate a container's scale, then counter-scale the content, or use `will-change: transform` on the container and animate width/height only when text reflow is essential.

Source: [Web Dev Simplified — Performant CSS Animations](https://www.youtube.com/watch?v=4PStxeSIL9I)

---

## 3. MOTION DESIGN PRINCIPLES (12 Principles Applied to UI)

### 1. Squash and Stretch

**In UI:** Apply subtle scale deformation when elements interact. A button that squashes slightly on press (scaleY: 0.95, scaleX: 1.02) feels tactile. A notification badge that stretches as it bounces in feels alive.

**Rule:** Volume should remain constant — if you squash vertically, stretch horizontally proportionally. For UI, keep deformation under 5% to avoid looking cartoonish.

**Brand consideration:** Corporate/professional = minimal or no squash. Playful/consumer = moderate squash/stretch is welcome.

### 2. Anticipation

**In UI:** Before a major action, show a small preparatory movement:
- Button dips down 2px before navigating
- Panel shrinks 2% before expanding
- Element pulls back slightly before sliding in
- Hover state that subtly lifts or shifts the element

**Timing:** Anticipation should be 15-25% of the total animation duration. If the main action is 400ms, anticipation is 60-100ms.

**From UI animation principles (Tamerlan Aziev):** "Anticipation lets users anticipate the behavior, increasing usability by teaching users the interaction pattern."

### 3. Follow-Through and Overlapping Action

**In UI (the MOST impactful principle):**
- When a panel opens, the panel arrives first, then child elements settle with 2-4 frame delays
- When a card snaps into place, its shadow settles a moment later
- When a menu closes, shadows fade after the panel disappears
- Icons and text within a container animate with slight offset from the container

**From School of Motion (Joey Korenman):** "Follow-through is the idea that when an object moves, different parts move at different times. Stagger keyframes by 1-2 frames for subtle overlap, 2-4 frames for obvious overlap."

**Implementation:** Apply the same animation curve to child elements but offset their start time by 30-80ms.

### 4. Slow In / Slow Out

**In UI:**
- **Entering the frame (from outside):** ease-out (fast entry, slow landing)
- **Moving within the frame:** ease-in-out (accelerate, decelerate)
- **Exiting the frame:** ease-in (slow start, fast exit)

**From UI animation tutorial (Tamerlan Aziev):** "The general rule: if the object enters from outside, slow it down at the end. If it's going out, accelerate it. The curve should be exaggerated — not the default CSS ease, but a custom steep curve."

**Pro tip:** The curve's steepness should match the travel distance. Short moves = aggressive easing. Long moves = gentler easing.

### 5. Arcs

**In UI:** Elements should not move in perfectly straight lines — add subtle curved paths:
- A notification sliding in from the top-right should arc slightly rather than moving purely diagonally
- A card transitioning to a new position should follow a gentle curve
- Swipe-dismiss animations should arc downward (gravity)

**Implementation:** Animate X and Y with slightly different timing functions or offsets, creating a natural curve.

### 6. Secondary Action

**In UI:** Supporting animations that reinforce the primary action:
- Toggle switch changes color (secondary) while the knob slides (primary)
- A background dims (secondary) when a modal opens (primary)
- A ripple effect (secondary) when a button is tapped (primary)
- Counter updates (secondary) when an item is added to cart (primary)

**From Tamerlan Aziev:** "Secondary action helps sell the main action — by itself it's not the main thing, but it helps convey the message."

### 7. Staging (Directing the Eye)

**In UI:**
- Only animate one major element at a time — don't split attention
- Use dimming/blurring of background to focus on foreground
- The CTA button should animate AFTER content loads, creating hierarchy
- Progressive disclosure: show information in sequence, not all at once

**From DesignerUp tutorial:** "The CTA button comes AFTER all information is loaded — you don't want to show the button before the image even expands. This gives a nice hierarchy."

### Duration Guidelines by Element Type

| Element Type | Duration | Examples |
|-------------|----------|----------|
| Micro-interaction | 50-100ms | Toggles, buttons, checkboxes |
| Small movement | 100-200ms | Accordion, small reveals |
| Medium transition | 200-350ms | Cards expanding, panels sliding |
| Large transition | 300-500ms | Page transitions, modals |
| Celebratory | 500-1000ms | Success animations, achievements |

Source: [IxDF — Disney's 12 Principles Applied to UI](https://ixdf.org/literature/article/ui-animation-how-to-apply-disney-s-12-principles-of-animation-to-ui-design)

---

## 4. PROFESSIONAL TIPS FOR REACT/CSS ANIMATIONS

### How to Avoid the "CSS Animation" Look

The "CSS animation look" comes from:

1. **Using `transition` for everything** — Transitions are fire-and-forget. Use animation libraries (Motion, GSAP) for anything complex.
2. **Default timing functions** — `ease`, `ease-in-out` are generic. Use custom bezier curves or spring physics.
3. **Single-property animation** — Animating ONLY opacity, or ONLY transform. Pros animate 3-5 properties simultaneously with offset timing.
4. **Same duration for all properties** — Opacity should resolve faster than position. Scale should resolve differently than rotation.
5. **No motion blur** — CSS has no motion blur. Use slight scale/opacity changes at peak velocity to simulate it.
6. **Ignoring layout** — CSS animations that trigger reflow (width, height, margin, padding) stutter.

### Stagger Timing — What Gap Between Elements

**The golden range: 50-120ms between elements**

| Stagger Delay | Feel | Use Case |
|--------------|------|----------|
| 30-50ms | Rapid cascade, feels like one unit | Lists, grid items loading |
| 50-80ms | Balanced, readable rhythm | Navigation items, cards |
| 80-120ms | Deliberate, each item distinct | Feature highlights, important items |
| 120-200ms | Dramatic, high emphasis | Hero sections, storytelling |
| 200ms+ | Too slow — elements feel disconnected | Almost never |

**From SVGator guide:** "When there is no stagger, all elements stick together as one object. When stagger is too long, elements disintegrate visually and appear as separate, unconnected parts."

**Total stagger limit:** Keep the TOTAL stagger duration under 800ms for a group. 10 items at 80ms each = 800ms total. If you have 20 items, reduce individual delay to 40ms.

Source: [Aninix — Mastering Stagger Techniques](https://www.aninix.com/wiki/how-to-create-a-good-stagger-in-the-ui-animation)

### Offset Animations — Not Everything Should Start at the Same Time

**The hierarchy of animation timing:**

1. **Container first** (0ms) — Background, shape, or container appears
2. **Primary content** (+60-100ms) — Main heading, primary image
3. **Secondary content** (+120-180ms) — Subheading, description
4. **Actions** (+200-300ms) — Buttons, CTAs, interactive elements
5. **Decorative** (+250-400ms) — Icons, badges, accents

**Rule: Important elements animate first, decorative elements last.**

### Layered Motion — Multiple Properties at Different Speeds

This is the single biggest differentiator between amateur and professional animations.

**Instead of:**
```javascript
// Amateur: everything at once
transition: all 300ms ease;
```

**Do this:**
```javascript
// Pro: layered timing per property
opacity: { duration: 200, ease: "easeOut" }
y: { duration: 350, ease: [0.16, 1, 0.3, 1] }
scale: { duration: 400, ease: "spring", stiffness: 200, damping: 20 }
```

**Rules:**
- **Opacity resolves first** (fastest) — 60-70% of the total duration
- **Position resolves second** — The main movement
- **Scale resolves last** (slowest) — Creates a subtle "settling" effect
- **Rotation** (if any) — Slightly offset from position, 10-30ms later

**From research on cascading systems:** "The brain interprets motion in intervals of approximately 100-200ms. Cascading animation systems align delays within this range to match natural perception."

### Micro-Delays That Add Realism

- **Shadow delay:** Shadow changes 20-40ms after the element moves (shadow is "projected" — it reacts to movement, not causes it)
- **Color transition delay:** Background color starts changing 30ms into the position animation
- **Text content delay:** Text fades in 50-80ms after its container has finished moving
- **Border changes:** 10-20ms after the shape change begins
- **Blur/backdrop effects:** 40-60ms after the triggering action

### How Framer Motion / GSAP Achieve "Weight" That Pure CSS Can't

1. **Spring physics** — Springs respond to current velocity. CSS can't do this. When you interrupt a spring mid-flight, it naturally decelerates and reverses. CSS snaps.

2. **Velocity-aware transitions** — When an animation is interrupted, the library carries over the current velocity to the new animation. CSS resets to zero.

3. **Per-property timing** — Framer Motion lets you specify different transitions for different properties in one `animate` call. CSS `transition` applies one curve to all.

4. **Layout animations** — Framer Motion's `layout` prop animates actual layout changes (width, height, position) using FLIP technique — it calculates the difference and uses `transform` under the hood.

5. **Timeline orchestration (GSAP)** — Nested timelines with labels, callbacks, and precise control over overlapping animations. CSS `@keyframes` has no concept of relative timing.

6. **Exit animations** — React components that leave the DOM can be animated out. CSS has no concept of "animate then remove."

Source: [Motion.dev — GSAP vs Motion comparison](https://motion.dev/docs/gsap-vs-motion)

---

## 5. CAMERA MOVEMENT IN 2D MOTION GRAPHICS

### How to Simulate Camera Movement on a 2D Canvas

In 2D, "camera movement" is achieved by moving ALL content in the opposite direction of the desired camera move:

- **Pan right** = Move all content left
- **Zoom in** = Scale all content up from center point
- **Tilt up** = Move all content down

**Implementation in Remotion / React:**

```javascript
// Camera container wraps ALL content
<div style={{
  transform: `
    translate(${-cameraX}px, ${-cameraY}px)
    scale(${cameraZoom})
  `,
  transformOrigin: `${focusX}px ${focusY}px`
}}>
  {/* All scene content */}
</div>
```

### Parallax Layers for Depth

**The principle:** Objects at different "distances" from the camera move at different speeds. Closer = faster, farther = slower.

**Layer speed multipliers:**

| Layer | Speed Multiplier | Content |
|-------|-----------------|---------|
| Background (far) | 0.3x | Sky, distant elements |
| Mid-background | 0.5x | Secondary elements |
| Main content | 1.0x | Primary focus |
| Foreground | 1.3x | Overlapping elements |
| Close foreground | 1.6x | Edge decorations |

**From parallax tutorial (mclelun):** "The key to parallax is to animate each layer with different speeds. Objects further from camera have slower animation, closer ones move faster. For zoom, scale each layer with different end values incrementally."

**Implementation approach:**
- Place elements on conceptual z-layers
- When camera pans, multiply movement by layer's depth multiplier
- When camera zooms, scale layers with different scale factors (far layers scale less)

### When to Zoom vs. Pan vs. Static

| Camera Move | When to Use | Feel |
|------------|-------------|------|
| **Static** | Information display, reading | Calm, neutral |
| **Slow zoom in** | Building focus, emphasis | Dramatic, intimate |
| **Slow zoom out** | Revealing context, overview | Grand, establishing |
| **Pan** | Following action, showing sequence | Dynamic, narrative |
| **Quick zoom** | Transitions between sections | Energetic, modern |

### Speed Curves for Camera Movement

- **Pan:** Use ease-in-out with stronger deceleration. Camera should ease to a stop, not snap.
- **Zoom:** Ease-out (fast start, gentle landing) — mimics real camera zoom where operator slows down as they find the framing.
- **Combined pan+zoom:** Both should use the same overall timing but zoom can lead slightly (50ms) before the pan kicks in.

**From camera tutorial:** "Set your default interpolation to ease-in-ease-out. This gives the camera smooth flow. Linear camera movement lacks realism — there's no acceleration or deceleration."

### Greg Isenberg Style Camera (Scroll + Zoom)

The Greg Isenberg video style uses:

1. **Slow continuous downward scroll** — Content flows upward as if scrolling a page
2. **Zoom on key moments** — When highlighting a specific element, smooth zoom in (1x to 1.3-1.5x) over 20-40 frames
3. **Zoom back out** — After the highlight, zoom back to 1x with a slightly longer duration (feels like the camera is "settling back")
4. **Minimal horizontal movement** — Mostly vertical scroll with zoom
5. **Speed:** Scroll speed varies — slow during explanation, faster during transitions

---

## 6. SPECIFIC TECHNIQUES FOR REMOTION

### Remotion spring() for Professional Feel

```typescript
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Professional entrance animation
const entrance = spring({
  frame,
  fps,
  config: {
    damping: 20,    // Minimal bounce
    stiffness: 200, // Responsive
    mass: 0.8,      // Slightly lighter than default
  },
});
```

### Best Damping/Stiffness/Mass Combos

| Effect | damping | stiffness | mass | Description |
|--------|---------|-----------|------|-------------|
| **Premium entrance** | 20 | 200 | 0.8 | Smooth, confident, no bounce |
| **Subtle bounce** | 12 | 180 | 1 | Gentle overshoot, professional |
| **Heavy panel** | 25 | 100 | 2 | Slow, weighty, deliberate |
| **Quick snap** | 30 | 300 | 0.5 | Fast, precise, no bounce |
| **Playful pop** | 8 | 250 | 0.8 | Noticeable bounce, fun |
| **Soft float** | 18 | 60 | 1.5 | Slow, dreamy, gentle |
| **Title slam** | 15 | 400 | 1.2 | Fast in, slight overshoot, settle |

**Default Remotion spring:** `damping: 10, stiffness: 100, mass: 1` — This bounces too much for professional use. Increase damping to 15-25 for most UI work.

### interpolate() Patterns That Look Premium

```typescript
import { interpolate, Easing } from 'remotion';

// 1. Entrance with opacity + position (offset timing)
const opacity = interpolate(frame, [0, 15], [0, 1], {
  extrapolateRight: 'clamp',
});
const translateY = interpolate(frame, [0, 25], [30, 0], {
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.cubic),
});

// 2. Scale with clamp (prevents overshoot artifacts)
const scale = interpolate(frame, [0, 20], [0.8, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.back(1.5)),  // Slight overshoot
});

// 3. Multi-step animation (A → B → C)
const progress = interpolate(frame, [0, 30, 60, 90], [0, 1, 1, 0], {
  extrapolateRight: 'clamp',
});

// 4. Stagger for list items
const items = [0, 1, 2, 3, 4];
items.map((i) => {
  const delay = i * 4; // 4 frames between each item
  const itemOpacity = interpolate(
    frame,
    [delay, delay + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
});
```

### Multi-Property Animation with Offset Timing

The key to premium Remotion animations is animating different properties with DIFFERENT timing:

```typescript
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Position resolves with spring (bouncy, physical)
const positionSpring = spring({
  frame,
  fps,
  config: { damping: 18, stiffness: 200, mass: 1 },
});

// Opacity resolves FASTER (linear, clean)
const opacity = interpolate(frame, [0, 10], [0, 1], {
  extrapolateRight: 'clamp',
});

// Scale resolves SLOWER (settles after position)
const scale = spring({
  frame: frame - 3, // 3 frame delay
  fps,
  config: { damping: 22, stiffness: 150, mass: 1.2 },
});

// Apply
<div style={{
  opacity,
  transform: `
    translateY(${interpolate(positionSpring, [0, 1], [40, 0])}px)
    scale(${interpolate(Math.max(0, scale), [0, 1], [0.9, 1])})
  `,
}}>
```

### How to Chain Animations (A finishes -> B starts with overlap)

**Method 1: Frame-based sequencing with overlap**

```typescript
const ANIMATION_A_START = 0;
const ANIMATION_A_END = 30;
const OVERLAP = 8; // B starts 8 frames before A ends
const ANIMATION_B_START = ANIMATION_A_END - OVERLAP;

// Animation A
const aProgress = spring({
  frame: frame - ANIMATION_A_START,
  fps,
  config: { damping: 20, stiffness: 200 },
});

// Animation B (starts with overlap)
const bProgress = spring({
  frame: Math.max(0, frame - ANIMATION_B_START),
  fps,
  config: { damping: 18, stiffness: 180 },
});
```

**Method 2: Using Remotion's `<Sequence>` with negative offset**

```tsx
<Sequence from={0} durationInFrames={40}>
  <AnimationA />
</Sequence>
<Sequence from={32} durationInFrames={40}>
  {/* Starts 8 frames before A ends = overlap */}
  <AnimationB />
</Sequence>
```

**Method 3: Derived animations (B uses A's progress as trigger)**

```typescript
// B starts when A is 70% complete
const aProgress = spring({ frame, fps, config: { damping: 20 } });
const bTriggerFrame = frame - 20; // Approximate when A hits 70%
const bProgress = aProgress > 0.7
  ? spring({ frame: bTriggerFrame, fps, config: { damping: 18 } })
  : 0;
```

### Remotion-Specific Best Practices

1. **Always clamp interpolations** — Use `extrapolateLeft: 'clamp', extrapolateRight: 'clamp'` to prevent values going outside your intended range. Springs can overshoot.

2. **Use spring() for physical movement, interpolate() for decorative properties** — Position and scale feel better with springs. Opacity and color feel better with interpolate + easing.

3. **Think in frames, not milliseconds** — At 30fps, 1 frame = 33ms. "4 frames of stagger" is clearer than "132ms" when working in Remotion.

4. **Test at different playback speeds** — Good animation looks good at 0.5x AND 2x speed. If it only looks good at 1x, the timing is probably off.

5. **Use `measureSpring()` to know exact duration** — `measureSpring({ fps, config })` returns the frame count until the spring settles. Use this to time sequential animations precisely.

6. **Remotion's timing editor** — Visit `remotion.dev/timing-editor` to visually experiment with spring parameters before coding.

---

## QUICK REFERENCE: THE 10 RULES

1. **Springs over transitions** — Use physics-based springs for anything that moves. CSS transitions for simple hover states only.
2. **High damping** — Default damping values are too bouncy. Increase to 15-25 for professional feel.
3. **Offset everything** — Never animate all properties at the same time. Opacity first, then position, then scale.
4. **Stagger 50-100ms** — Elements in a group should cascade, never appear simultaneously.
5. **Scale, not width/height** — Always use `transform: scale()` for size changes. It's GPU-accelerated.
6. **Ease-out for entrances, ease-in for exits** — Match the easing direction to the element's intent.
7. **Follow-through on everything** — Child elements settle 2-4 frames after their parent.
8. **Clamp your interpolations** — Prevent values from overshooting your intended range.
9. **Different durations for different sizes** — Small elements: 100-200ms. Large elements: 300-500ms.
10. **Anticipation on important actions** — Before something big happens, show a subtle wind-up.

---

## SOURCES

### Web Sources
- [Josh W. Comeau — Spring Physics Introduction](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/)
- [Josh W. Comeau — Springs in Native CSS](https://www.joshwcomeau.com/animation/linear-timing-function/)
- [Maxime Heckel — Physics Behind Spring Animations](https://blog.maximeheckel.com/posts/the-physics-behind-spring-animations/)
- [Motion.dev — Spring Documentation](https://motion.dev/docs/spring)
- [Motion.dev — React Transitions](https://motion.dev/docs/react-transitions)
- [Motion.dev — GSAP vs Motion](https://motion.dev/docs/gsap-vs-motion)
- [Remotion — spring() Documentation](https://www.remotion.dev/docs/spring)
- [Remotion — interpolate() Documentation](https://www.remotion.dev/docs/interpolate)
- [Remotion — Animating Properties](https://www.remotion.dev/docs/animating-properties)
- [IxDF — Disney's 12 Principles Applied to UI](https://ixdf.org/literature/article/ui-animation-how-to-apply-disney-s-12-principles-of-animation-to-ui-design)
- [SVGator — Offset and Delay Guide](https://www.svgator.com/blog/offset-delay-motion-design/)
- [Aninix — Mastering Stagger Techniques](https://www.aninix.com/wiki/how-to-create-a-good-stagger-in-the-ui-animation)
- [CSS-Tricks — Shape Morphing](https://css-tricks.com/books/greatest-css-tricks/shape-morphing/)
- [NN/g — Animation Duration and Motion](https://www.nngroup.com/articles/animation-duration/)
- [We Design Motion — Easing in After Effects](https://wedesignmotion.com/motion-design-how-tos/how-to-use-easing-for-smooth-animation-in-after-effects/)
- [PQINA — Animating Width/Height Without Squish](https://pqina.nl/blog/animating-width-and-height-without-the-squish-effect/)
- [nordcraft — Physics-Based Animations](https://blog.nordcraft.com/physics-based-animations-spring-to-life)

### YouTube Sources
- [Web Dev Simplified — Performant CSS Animations](https://www.youtube.com/watch?v=4PStxeSIL9I) — GPU vs CPU animation, layout/paint/composite pipeline
- [Skillshare — 12 Principles of Animation](https://www.youtube.com/watch?v=EqMi1AzbFqs) — Classic Disney principles overview
- [Tamerlan Aziev — 9 Principles of UI Animation](https://www.youtube.com/watch?v=lOaTtmGE-X8) — Practical UI-specific rules with timing values
- [DesignerUp — Complete Guide to UI Animation](https://www.youtube.com/watch?v=O6o5AtU2p10) — Tool comparison and workflow
- [School of Motion — Follow-Through in After Effects](https://www.youtube.com/watch?v=PlgntkCTr90) — Overlapping action technique
- [Jonny Burger — Apple "Wow" in Remotion](https://www.youtube.com/watch?v=I9kZ5Fji5_A) — Spring, interpolate, composable animation patterns
- [Stephan Zammit — The Right Way to Animate Text](https://www.youtube.com/watch?v=c-Q06JnT6mE) — Professional text animation with stagger
- [mclelun — Parallax Effect for 2D Animation](https://www.youtube.com/watch?v=4SlWWykmCRU) — Layer-based parallax techniques
- [Howard Wimshurst — Why Punches Lack Energy](https://www.youtube.com/watch?v=g64E-UNRqcg) — Weight, anticipation, follow-through in animation
- [Fireship — SVG Animations with CSS](https://www.youtube.com/watch?v=UTHgr6NLeEw) — Practical SVG animation techniques
