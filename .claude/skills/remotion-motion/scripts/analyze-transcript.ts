/**
 * Transcript Analyzer for Remotion Motion Skill
 *
 * Uses Claude API to analyze transcript text and determine:
 * 1. Hierarchy type (flat vs sticky)
 * 2. Segment structure (stickyNotes, sectionBoxes, nodeItems)
 * 3. Icon suggestions for each node
 *
 * Usage:
 *   npx ts-node analyze-transcript.ts "Your transcript text here"
 *   npx ts-node analyze-transcript.ts --file transcript.txt
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Output types
interface NodeItem {
  label: string;
  icon: string;
  wordIndexStart?: number;
  wordIndexEnd?: number;
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

const SYSTEM_PROMPT = `You are a video animation structure analyzer. Your job is to analyze transcript text and determine the optimal visual hierarchy for an animated explainer video.

## Output Format
Return ONLY valid JSON matching this schema:
{
  "hierarchyType": "flat" | "sticky",
  "totalWords": number,
  "segments": [...],
  "cameraKeyframes": [...],
  "warnings": [...]
}

## Hierarchy Rules

### Use "flat" when:
- Text describes independent concepts (tech stack, feature list)
- No clear sequential phases
- Each concept is self-contained
- Text is short (< 100 words)

### Use "sticky" when:
- Text describes a PROCESS with distinct phases
- Phases have SUB-OPERATIONS within them
- Clear flow: Phase A → Phase B → Phase C
- Text is long enough to warrant grouping (> 100 words)

## Structure Rules

### StickyNote (only in "sticky" mode)
- Wrapper for a major phase/step
- Contains 2-4 SectionBoxes
- Maximum 3 StickyNotes per video
- Title should be 1-2 words describing the phase

### SectionBox
- Groups related operations
- Contains 2-4 NodeItems
- Title should be 1-2 words
- Subtitle is optional short description

### NodeItem
- Atomic visual element
- Label: 1-2 words max
- Icon: suggest from this list:
  terminal, search, user, cube, vector, database, zap, file, layers, merge, sparkle, cpu, check, settings, cloud, lock, key, globe, mail, calendar, chart, code, folder, image, video, music, link, star, heart, flag, bell, clock, filter, grid, list, map, mic, phone, play, power, refresh, save, send, share, shield, trash, upload, download, wifi, zoom

## Analysis Process

1. Count total words
2. Identify main topics/concepts
3. Determine if topics are SEQUENTIAL (sticky) or PARALLEL (flat)
4. Group related sentences
5. Extract key nouns for NodeItems
6. Suggest icons based on concept meaning
7. Mark word indices for timing

## Validation

Return warnings array for:
- Text too short (< 30 words): "Text may be too short for rich animation"
- Text too long (> 500 words): "Text may be too long, consider splitting"
- Too many concepts (> 12 nodes): "Many concepts detected, may be visually crowded"

## Example: RAG Pipeline (sticky)

Input: "A user sends a query. That query gets converted into an embedding. You search your vector database for chunks. That's step one, retrieve. The chunks become your context. In step two, augment. You combine context with the query into a prompt. Step three, generate. You pass that prompt to the LLM."

Output:
{
  "hierarchyType": "sticky",
  "totalWords": 62,
  "segments": [
    {
      "id": "sticky_1",
      "title": "Retrieve",
      "step": 1,
      "type": "stickyNote",
      "sections": [
        {
          "id": "section_1_1",
          "title": "Query Processing",
          "type": "sectionBox",
          "nodes": [
            { "label": "User Query", "icon": "terminal" },
            { "label": "Embedding", "icon": "cube" }
          ],
          "wordIndexStart": 0,
          "wordIndexEnd": 15
        },
        {
          "id": "section_1_2",
          "title": "Vector Search",
          "type": "sectionBox",
          "nodes": [
            { "label": "Search DB", "icon": "database" },
            { "label": "Get Chunks", "icon": "file" }
          ],
          "wordIndexStart": 16,
          "wordIndexEnd": 30
        }
      ],
      "wordIndexStart": 0,
      "wordIndexEnd": 40
    },
    {
      "id": "sticky_2",
      "title": "Augment",
      "step": 2,
      "type": "stickyNote",
      "sections": [
        {
          "id": "section_2_1",
          "title": "Combine",
          "type": "sectionBox",
          "nodes": [
            { "label": "Context", "icon": "layers" },
            { "label": "Prompt", "icon": "merge" }
          ],
          "wordIndexStart": 41,
          "wordIndexEnd": 52
        }
      ],
      "wordIndexStart": 41,
      "wordIndexEnd": 52
    },
    {
      "id": "sticky_3",
      "title": "Generate",
      "step": 3,
      "type": "stickyNote",
      "sections": [
        {
          "id": "section_3_1",
          "title": "LLM",
          "type": "sectionBox",
          "nodes": [
            { "label": "Process", "icon": "cpu" },
            { "label": "Response", "icon": "sparkle" }
          ],
          "wordIndexStart": 53,
          "wordIndexEnd": 62
        }
      ],
      "wordIndexStart": 53,
      "wordIndexEnd": 62
    }
  ],
  "cameraKeyframes": [
    { "segmentId": "sticky_1", "wordIndex": 0, "description": "Zoom to Retrieve" },
    { "segmentId": "sticky_2", "wordIndex": 41, "description": "Pan to Augment" },
    { "segmentId": "sticky_3", "wordIndex": 53, "description": "Pan to Generate" }
  ],
  "warnings": []
}

## Example: Tech Stack (flat)

Input: "This is the NemoClaw stack. OpenShell runs everything. Policy Engine handles rules. Privacy Router manages data."

Output:
{
  "hierarchyType": "flat",
  "totalWords": 18,
  "segments": [
    {
      "id": "section_1",
      "title": "OpenShell",
      "subtitle": "Runs everything",
      "type": "sectionBox",
      "nodes": [
        { "label": "Runtime", "icon": "terminal" },
        { "label": "Executor", "icon": "play" }
      ],
      "wordIndexStart": 5,
      "wordIndexEnd": 8
    },
    {
      "id": "section_2",
      "title": "Policy Engine",
      "subtitle": "Handles rules",
      "type": "sectionBox",
      "nodes": [
        { "label": "Rules", "icon": "settings" },
        { "label": "Validation", "icon": "check" }
      ],
      "wordIndexStart": 9,
      "wordIndexEnd": 13
    },
    {
      "id": "section_3",
      "title": "Privacy Router",
      "subtitle": "Manages data",
      "type": "sectionBox",
      "nodes": [
        { "label": "Privacy", "icon": "shield" },
        { "label": "Routing", "icon": "globe" }
      ],
      "wordIndexStart": 14,
      "wordIndexEnd": 18
    }
  ],
  "cameraKeyframes": [
    { "segmentId": "section_1", "wordIndex": 5, "description": "Focus OpenShell" },
    { "segmentId": "section_2", "wordIndex": 9, "description": "Pan to Policy Engine" },
    { "segmentId": "section_3", "wordIndex": 14, "description": "Pan to Privacy Router" }
  ],
  "warnings": ["Text may be too short for rich animation"]
}`;

async function analyzeTranscript(transcript: string): Promise<AnalysisResult> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable not set");
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const wordCount = transcript.split(/\s+/).length;

  // Validation
  if (wordCount < 10) {
    return {
      hierarchyType: "flat",
      totalWords: wordCount,
      segments: [],
      cameraKeyframes: [],
      errors: ["Text too short (< 10 words). Cannot create meaningful animation."]
    };
  }

  if (wordCount > 800) {
    return {
      hierarchyType: "flat",
      totalWords: wordCount,
      segments: [],
      cameraKeyframes: [],
      errors: ["Text too long (> 800 words). Please split into multiple videos."]
    };
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze this transcript and return the JSON structure:\n\n"${transcript}"`
      }
    ]
  });

  // Extract JSON from response
  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  // Parse JSON - handle markdown code blocks if present
  let jsonText = content.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const result: AnalysisResult = JSON.parse(jsonText);
  result.totalWords = wordCount;

  return result;
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage:");
    console.error('  npx ts-node analyze-transcript.ts "Your transcript text"');
    console.error("  npx ts-node analyze-transcript.ts --file transcript.txt");
    process.exit(1);
  }

  let transcript: string;

  if (args[0] === "--file" && args[1]) {
    transcript = fs.readFileSync(args[1], "utf-8");
  } else {
    transcript = args.join(" ");
  }

  console.log("Analyzing transcript...");
  console.log(`Word count: ${transcript.split(/\s+/).length}`);
  console.log("");

  try {
    const result = await analyzeTranscript(transcript);

    if (result.errors && result.errors.length > 0) {
      console.error("ERRORS:");
      result.errors.forEach(e => console.error(`  - ${e}`));
      process.exit(1);
    }

    console.log("=== ANALYSIS RESULT ===\n");
    console.log(JSON.stringify(result, null, 2));

    // Also save to file
    const outputPath = "./transcript-analysis.json";
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\nSaved to: ${outputPath}`);

  } catch (error) {
    console.error("Analysis failed:", error);
    process.exit(1);
  }
}

main();

export { analyzeTranscript, AnalysisResult, StickyNote, SectionBox, NodeItem };
