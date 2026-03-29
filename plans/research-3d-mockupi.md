# Research: Best High-Quality Device Mockups for Programmatic Video Generation in Remotion

## Executive Summary

After thorough research (7 web searches, 2 YouTube searches with transcripts), the **clear winner** for your use case is: **Remotion + React Three Fiber + GLB/GLTF 3D Models** with Remotion's built-in `@remotion/three` package. This gives you full programmatic control, professional 3D quality, and is purpose-built for your pipeline.

---

## Approach Comparison & Ranking

### 1. @remotion/three + React Three Fiber + GLB Models (RECOMMENDED)
**Score: 9.5/10**

Remotion already has a **purpose-built template** (`remotion-dev/template-three`) that features a 3D phone with video inside. Key capabilities:

- **`useVideoTexture()`** - Maps any video onto a 3D surface (screen replacement)
- **`useOffthreadVideoTexture()`** - Frame-exact rendering for production (not just preview)
- **`<ThreeCanvas>`** - Syncs React Three Fiber with Remotion's frame system
- **Load `.glb`/`.gltf` models** via `useGLTF()` from drei
- Full control: rotation, perspective, lighting, shadows, reflections
- Animate camera, device position, screen content - all frame-synced

**Where to get 3D models:**
- **Sketchfab** - Free iPhone/MacBook GLB models
- **CGTrader** - iPhone 16 in GLTF format (free)
- **Free3D** - 40+ free iPhone models, 80+ phone models
- **3DTrixs** - Phone models optimized for web (OBJ, FBX, GLB, GLTF)
- **Codrops device-mockup.glb** - Ready-to-use device mockup file

**Pros:**
- 100% programmatic - perfect for automated pipeline
- Professional quality with PBR materials, reflections, shadows
- Frame-exact rendering for production videos
- Full React ecosystem - compose with your existing Remotion components
- No external API dependency or cost per render
- Supports phone, laptop, tablet - any device with a GLB model

**Cons:**
- Need to source/create quality GLB models
- More setup than drag-and-drop tools
- 3D rendering is heavier than 2D

---

### 2. Spline + Remotion Export
**Score: 8/10**

Spline is a web-based 3D design tool that can export directly to React Three Fiber code. Remotion has official Spline integration docs.

**Workflow:**
1. Design 3D phone/device scene in Spline's visual editor
2. Export as React Three Fiber code OR as GLB
3. Import into Remotion, animate with useCurrentFrame()

**Pros:**
- Visual 3D editor - no Blender needed
- Direct R3F export (`@splinetool/r3f-spline`)
- Can design custom device models visually
- Supports animations, materials, lighting in the editor
- Export to GLB/GLTF, FBX, USDZ, OBJ

**Cons:**
- "Code (Experimental)" export for R3F - may have quirks
- Less fine-grained control than hand-coded R3F
- Dependency on Spline's export format
- Free tier has limitations

---

### 3. Rotato (Best Non-Programmatic Tool)
**Score: 7/10 for your use case**

Rotato is the industry standard for 3D device mockup videos. Used heavily by indie developers and agencies.

**Key features:**
- 30+ pre-made 3D devices (iPhone, MacBook, iPad, etc.)
- Actual 3D rendering pipeline - not templates
- Up to 4K video export
- 9x faster than After Effects for simple mockups
- Drag-and-drop screen replacement
- One-time license (not subscription)

**Limitations for your pipeline:**
- **Mac only** - no Linux/cloud rendering
- **Not programmatic** - GUI-based, can't automate in a pipeline
- No API for batch rendering
- Would require manual intervention per video

**Verdict:** Best quality for manual work, but **NOT suitable for automated Remotion pipeline**.

---

### 4. DeviceFrames
**Score: 6/10**

Web-based 3D device mockup generator with animation support.

- Keyframe-based animation editor
- Ultra HD exports (PNG, JPG, WebM, MP4)
- iPhone, iPad, MacBook, Android devices
- Intuitive 3D editor

**Limitations:** Web-based GUI tool, not programmatic. No API for automation.

---

### 5. CSS/SVG Device Frames (Basic Approach)
**Score: 3/10**

Basic 2D device frames using CSS borders, SVG overlays, or PNG frames.

**Pros:** Simple, fast rendering, no 3D overhead
**Cons:** Looks flat and unprofessional. No depth, no reflections, no perspective. This is what you explicitly want to AVOID.

---

## Technical Implementation Plan for Remotion

### Architecture

```
Your Pipeline
  |
  v
Remotion Composition
  |
  v
<ThreeCanvas>
  |-- Environment (lighting, HDRI)
  |-- GLB Device Model (phone/laptop/tablet)
  |     |-- Screen mesh -> useVideoTexture() or useOffthreadVideoTexture()
  |-- ContactShadows
  |-- Camera (animated with useCurrentFrame)
</ThreeCanvas>
```

### Key Packages Needed

```json
{
  "@remotion/three": "latest",
  "@react-three/fiber": "^8",
  "@react-three/drei": "latest",
  "three": "^0.160"
}
```

### Core Code Pattern

```tsx
import { ThreeCanvas, useVideoTexture } from "@remotion/three";
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

const PhoneMockup = ({ videoSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Load 3D phone model
  const { scene, nodes } = useGLTF("/models/iphone.glb");

  // Map video onto screen
  const videoTexture = useVideoTexture(videoSrc);

  // Animate rotation
  const rotation = interpolate(frame, [0, fps * 3], [0, Math.PI * 0.3]);

  return (
    <group rotation={[0.1, rotation, 0]}>
      <primitive object={scene} />
      {/* Apply video texture to screen mesh */}
      <mesh geometry={nodes.Screen.geometry}>
        <meshBasicMaterial map={videoTexture} />
      </mesh>
    </group>
  );
};
```

### Enhancement Techniques (from YouTube research)

From the After Effects tutorials (which reveal the STANDARD for professional mockups):

1. **Multiple angle showcase** - Rotate device to show different angles
2. **Depth of field** - Blur background devices, sharp foreground
3. **Environment lighting** - Use HDRI environments for realistic reflections
4. **Contact shadows** - Soft shadows beneath devices
5. **Floating animation** - Subtle up/down bob for premium feel
6. **Glass/screen reflection** - MeshTransmissionMaterial for realistic glass
7. **Multiple device carousel** - Array of phones in circular arrangement

All of these are achievable in React Three Fiber within Remotion.

---

## Where to Get Professional Quality GLB Models

| Source | Quality | Price | Format |
|--------|---------|-------|--------|
| Sketchfab | High | Free + Paid | GLB/GLTF |
| CGTrader | High | Free + Paid | GLTF, FBX, BLEND |
| Spline (design your own) | Custom | Free tier | GLB, R3F code |
| Apple Design Resources | Official | Free | Need conversion |
| Codrops device-mockup.glb | Good | Free | GLB |
| Free3D | Medium-High | Free | Various |

---

## Recommended Approach for Your Pipeline

### Phase 1: Quick Win
1. Clone `remotion-dev/template-three`
2. Swap in a high-quality iPhone GLB from Sketchfab/CGTrader
3. Use `useVideoTexture()` for screen content
4. Add basic rotation + floating animation

### Phase 2: Professional Polish
1. Add HDRI environment for realistic reflections
2. Add ContactShadows and depth of field
3. Create reusable `<DeviceMockup>` component with props:
   - `device`: "iphone" | "macbook" | "ipad"
   - `videoSrc`: path to screen content
   - `animation`: "rotate" | "float" | "perspective" | "carousel"
   - `angle`: camera angle preset
4. Support multiple devices (phone + laptop side by side)

### Phase 3: Pipeline Integration
1. Make device mockup a "visual type" in your visual router
2. Auto-select device based on content (mobile app = phone, web app = laptop)
3. Parametric control via JSON (angle, timing, device color)

---

## Key Remotion Resources

- Template: https://github.com/remotion-dev/template-three
- GLB example: https://github.com/remotion-dev/glb-example
- GLTF example: https://github.com/remotion-dev/remotion-three-gltf-example
- useVideoTexture docs: https://www.remotion.dev/docs/use-video-texture
- useOffthreadVideoTexture docs: https://www.remotion.dev/docs/use-offthread-video-texture
- ThreeCanvas docs: https://www.remotion.dev/docs/three-canvas
- Spline integration: https://www.remotion.dev/docs/spline
- Video as Three.js texture: https://www.remotion.dev/docs/videos/as-threejs-texture
- Remotion 3D rules (from remotion-dev/skills): https://github.com/remotion-dev/skills/blob/main/skills/remotion/rules/3d.md

---

## Bottom Line

**Do NOT use Rotato/DeviceFrames/Mockuuups Studio** - they are GUI tools that cannot be automated.

**USE: @remotion/three + React Three Fiber + high-quality GLB models from Sketchfab/CGTrader.** This is the only approach that gives you:
- Professional 3D quality (PBR materials, reflections, shadows)
- Full programmatic control (JSON-driven, automated pipeline)
- Frame-exact video rendering
- Native Remotion integration (useCurrentFrame, interpolate)
- No per-render cost or external API dependency

The technology stack is mature, well-documented, and Remotion provides official templates specifically for this use case.
