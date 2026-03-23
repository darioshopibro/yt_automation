/**
 * Generate Illustrations for Video Nodes using NanoBanana (Google Gemini)
 *
 * Takes the output from analyze-transcript.ts and generates
 * custom illustrations for each node using AI image generation.
 *
 * Usage:
 *   npx ts-node generate-illustrations.ts --input transcript-analysis.json
 *   npx ts-node generate-illustrations.ts --input transcript-analysis.json --output analysis-with-images.json
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Style configuration - locked for consistency
// Background matches the dark video/node background for seamless integration
const STYLE_CONFIG = {
  aesthetic: "flat design tech infographic illustration on dark background",
  colorPalette: {
    primary: "#3B82F6",    // Blue
    secondary: "#10B981",  // Green
    accent: "#F59E0B",     // Orange
    background: "#0F0F1A", // Dark background - matches video/node BG
    highlight: "#FFFFFF",  // White for contrast elements
  },
  visualStyle: [
    "minimalist",
    "clean lines",
    "simple geometric shapes",
    "glowing edges",
    "flat colors with subtle glow effects",
    "educational",
    "professional",
    "dark theme",
  ],
  technical: {
    aspectRatio: "1:1",
    size: "512x512",
  },
};

interface IllustrationPrompt {
  concept: string;
  visualDescription: string;
  educationalGoal: string;
}

interface NodeItem {
  label: string;
  icon: string;
  wordIndexStart?: number;
  wordIndexEnd?: number;
  illustrationPrompt?: IllustrationPrompt;
  imageUrl?: string;
}

interface SectionBox {
  id: string;
  title: string;
  subtitle?: string;
  type: "sectionBox";
  nodes: NodeItem[];
  wordIndexStart: number;
  wordIndexEnd: number;
}

interface StickyNote {
  id: string;
  title: string;
  step?: number;
  type: "stickyNote";
  sections: SectionBox[];
  wordIndexStart: number;
  wordIndexEnd: number;
}

interface AnalysisResult {
  hierarchyType: "flat" | "sticky";
  totalWords: number;
  segments: (StickyNote | SectionBox)[];
  cameraKeyframes: {
    segmentId: string;
    wordIndex: number;
    description: string;
  }[];
  errors?: string[];
  warnings?: string[];
}

/**
 * Build prompt for Gemini image generation
 */
function buildImagePrompt(node: NodeItem): string {
  const illustrationPrompt = node.illustrationPrompt;

  if (!illustrationPrompt) {
    // Fallback for nodes without illustrationPrompt
    return `Create a simple flat design icon representing "${node.label}".
Style: ${STYLE_CONFIG.visualStyle.join(", ")}.
Colors: Use ${STYLE_CONFIG.colorPalette.primary} as primary color on ${STYLE_CONFIG.colorPalette.background} background.
No text, no gradients, simple geometric shapes only.`;
  }

  return `Create a tech infographic illustration for an educational video.

CONCEPT: ${illustrationPrompt.concept}

VISUAL ELEMENTS: ${illustrationPrompt.visualDescription}

EDUCATIONAL GOAL: ${illustrationPrompt.educationalGoal}

STYLE REQUIREMENTS (MUST FOLLOW EXACTLY):
- Aesthetic: ${STYLE_CONFIG.aesthetic}
- Visual style: ${STYLE_CONFIG.visualStyle.join(", ")}
- BACKGROUND: MUST be solid dark color ${STYLE_CONFIG.colorPalette.background} (very dark blue-black)
- Primary color for elements: ${STYLE_CONFIG.colorPalette.primary} (bright blue)
- Secondary color: ${STYLE_CONFIG.colorPalette.secondary} (green)
- Accent color: ${STYLE_CONFIG.colorPalette.accent} (orange)
- Use ${STYLE_CONFIG.colorPalette.highlight} (white) for highlights and glowing edges
- Add subtle glow effects on important elements
- NO text or labels in the image
- Simple geometric shapes with clean edges
- Professional tech/developer aesthetic
- The illustration should EXPLAIN the concept visually

OUTPUT: Square aspect ratio (1:1), dark solid background (#0F0F1A), suitable for video overlay.`;
}

/**
 * Generate image using Google Imagen 4.0 API
 */
async function generateImageWithGemini(
  prompt: string,
  nodeId: string
): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not set in .env file");
    return null;
  }

  try {
    // Using Imagen 4.0 Fast for image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt,
            },
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Imagen API error for ${nodeId}:`, errorText);
      return null;
    }

    const data = await response.json();

    // Extract image from response
    if (data.predictions?.[0]?.bytesBase64Encoded) {
      const imageBuffer = Buffer.from(data.predictions[0].bytesBase64Encoded, "base64");
      const outputDir = path.resolve(__dirname, "../output/illustrations");

      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const imagePath = path.join(outputDir, `${nodeId}.png`);
      fs.writeFileSync(imagePath, imageBuffer);

      console.log(`  ✓ Generated: ${imagePath}`);
      return imagePath;
    }

    console.error(`No image in response for ${nodeId}`);
    return null;
  } catch (error) {
    console.error(`Error generating image for ${nodeId}:`, error);
    return null;
  }
}

/**
 * Process all nodes in the analysis and generate illustrations
 */
async function processAnalysis(analysis: AnalysisResult): Promise<AnalysisResult> {
  console.log("\n🎨 Generating illustrations for nodes...\n");

  let nodeCount = 0;
  let successCount = 0;

  // Helper function to process nodes
  async function processNodes(nodes: NodeItem[], prefix: string): Promise<void> {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeId = `${prefix}_node_${i}`;
      nodeCount++;

      console.log(`Processing: ${node.label} (${nodeId})`);

      const prompt = buildImagePrompt(node);
      const imagePath = await generateImageWithGemini(prompt, nodeId);

      if (imagePath) {
        node.imageUrl = imagePath;
        successCount++;
      }

      // Rate limiting - wait 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Process all segments
  for (const segment of analysis.segments) {
    if (segment.type === "stickyNote") {
      // Process sections within sticky note
      for (const section of segment.sections) {
        await processNodes(section.nodes, `${segment.id}_${section.id}`);
      }
    } else if (segment.type === "sectionBox") {
      // Process nodes directly
      await processNodes(segment.nodes, segment.id);
    }
  }

  console.log(`\n✅ Generated ${successCount}/${nodeCount} illustrations\n`);

  return analysis;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let inputPath = "./transcript-analysis.json";
  let outputPath = "./transcript-analysis-with-images.json";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--input" && args[i + 1]) {
      inputPath = args[i + 1];
      i++;
    } else if (args[i] === "--output" && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    }
  }

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    console.error("\nUsage:");
    console.error(
      "  npx ts-node generate-illustrations.ts --input transcript-analysis.json"
    );
    process.exit(1);
  }

  // Check API key
  if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY not found in .env file");
    console.error("Please add your Gemini API key to .env file");
    process.exit(1);
  }

  console.log("🚀 NanoBanana Illustration Generator");
  console.log("====================================");
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputPath}`);
  console.log(`API Key: ${GEMINI_API_KEY.substring(0, 10)}...`);

  // Read input JSON
  const inputJson = fs.readFileSync(inputPath, "utf-8");
  const analysis: AnalysisResult = JSON.parse(inputJson);

  // Process and generate illustrations
  const updatedAnalysis = await processAnalysis(analysis);

  // Save output
  fs.writeFileSync(outputPath, JSON.stringify(updatedAnalysis, null, 2));
  console.log(`💾 Saved to: ${outputPath}`);
}

main().catch(console.error);

export { generateImageWithGemini, buildImagePrompt, STYLE_CONFIG };
