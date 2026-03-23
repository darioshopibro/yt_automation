/**
 * Quick test for Gemini/Imagen Image Generation API
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testImagenGeneration() {
  console.log("🧪 Testing Imagen 3 Image Generation API\n");
  console.log(`API Key: ${GEMINI_API_KEY?.substring(0, 15)}...`);

  if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found in .env");
    process.exit(1);
  }

  const testPrompt = `A simple tech illustration of a database storing vector embeddings.
A cylinder database shape with floating dots inside representing vectors.
Dark background color #0F0F1A, primary color #3B82F6 (bright blue).
Subtle glow effects, simple geometric shapes, no text, professional tech aesthetic.
Square aspect ratio.`;

  // Try different Imagen models
  const models = [
    "imagen-4.0-fast-generate-001",
    "imagen-4.0-generate-001",
    "imagen-4.0-ultra-generate-001",
  ];

  for (const modelName of models) {
    console.log(`\n📤 Trying model: ${modelName}...`);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instances: [
              {
                prompt: testPrompt,
              },
            ],
            parameters: {
              sampleCount: 1,
              aspectRatio: "1:1",
            },
          }),
        }
      );

      console.log(`   Status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();

        if (data.predictions?.[0]?.bytesBase64Encoded) {
          const imageBuffer = Buffer.from(data.predictions[0].bytesBase64Encoded, "base64");
          const outputDir = path.resolve(__dirname, "../output");

          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          const imagePath = path.join(outputDir, "test-imagen.png");
          fs.writeFileSync(imagePath, imageBuffer);

          console.log(`   ✅ SUCCESS! Image saved to: ${imagePath}`);
          console.log(`   Size: ${imageBuffer.length} bytes`);
          return;
        }

        console.log("   Response:", JSON.stringify(data).substring(0, 300));
      } else {
        const errorText = await response.text();
        console.log(`   Error: ${errorText.substring(0, 200)}`);
      }
    } catch (error: any) {
      console.log(`   Error: ${error.message}`);
    }
  }

  // Also try listing imagen models
  console.log("\n📋 Checking for imagen models...");
  try {
    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    const models = await listResponse.json();
    const imagenModels = models.models?.filter((m: any) =>
      m.name.includes("imagen") || m.supportedGenerationMethods?.includes("predict")
    );

    if (imagenModels?.length > 0) {
      console.log("\nImagen-related models found:");
      imagenModels.forEach((m: any) => {
        console.log(`  - ${m.name}`);
      });
    } else {
      console.log("\n⚠️ No imagen models found in your API key's access.");
      console.log("Image generation may require:");
      console.log("  1. Enabling Imagen API in Google Cloud Console");
      console.log("  2. Using Vertex AI instead of AI Studio");
      console.log("  3. Or using an alternative like FAL.ai for image generation");
    }
  } catch (e) {
    console.error("Could not list models");
  }
}

testImagenGeneration();
