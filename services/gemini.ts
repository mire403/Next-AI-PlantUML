import { GoogleGenAI } from "@google/genai";
import { GenerationResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are a Senior Software Architect and PlantUML expert.
Your goal is to generate syntactically correct, professional PlantUML code based on user requirements.

RULES:
1. Output the PlantUML code inside a Markdown code block labeled 'plantuml'.
2. The code MUST start with @startuml and end with @enduml.
3. After the code block, provide a brief "Architectural Analysis" in CHINESE (中文) covering:
   - 需求覆盖 (Requirement Coverage)
   - 结构改进 (Structural Improvements)
   - 命名规范 (Naming Conventions)
4. If the user provides an image, analyze it as a sketch/diagram and convert it to PlantUML.
5. Use modern PlantUML features (themes, skinparams) to make it look professional (e.g., 'skinparam monochrome true' or 'skinparam shadowing false').
6. Unless specified otherwise, use Chinese for labels and notes in the diagram.
`;

const REVIEW_INSTRUCTION = `
You are a Senior UI/UX Designer and Information Architect specializing in Technical Diagrams.
Your goal is to critique a RENDERED PlantUML diagram image.

Analyze the visual layout, not just the code logic. Focus on:
1. **Readability**: Are lines crossing too much? Is the flow confused?
2. **Layout**: Are nodes too clustered? Should distinct modules be separated by packages?
3. **Aesthetics**: Suggestions for colors, grouping, or skinparams (e.g., 'linetype ortho', 'nodesep').

Output Format (in Chinese):
- **视觉评分**: (1-10)
- **主要问题**: (Brief list)
- **优化建议**: (Specific actionable items, e.g., "Add 'skinparam linetype ortho' to reduce messy diagonals" or "Group X and Y into a rectangle").
`;

export const generateUML = async (
  prompt: string, 
  imageBase64?: string
): Promise<GenerationResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Select model based on input type (Text vs Multimodal)
  // gemini-3-flash-preview is excellent for text reasoning.
  // gemini-2.5-flash-image is specific for image tasks, but 3-flash is generally capable.
  // We'll use gemini-3-flash-preview for strict text, and gemini-2.5-flash-image if image is present to ensure vision capabilities.
  const modelName = imageBase64 ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview';

  try {
    const parts: any[] = [];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Assuming PNG for simplicity, Gemini handles most standard image types
          data: imageBase64
        }
      });
    }

    parts.push({
      text: prompt
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for consistent code generation
      }
    });

    const text = response.text || "";
    
    // Parse the response to separate code and explanation
    const codeBlockRegex = /```(?:plantuml)?\s*([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);

    let code = "";
    let explanation = text;

    if (match && match[1]) {
      code = match[1].trim();
      // Remove the code block from the explanation to avoid duplication
      explanation = text.replace(match[0], '').trim();
    } else if (text.includes("@startuml") && text.includes("@enduml")) {
      // Fallback extraction if code blocks aren't used perfectly
      const startIndex = text.indexOf("@startuml");
      const endIndex = text.indexOf("@enduml") + "@enduml".length;
      code = text.substring(startIndex, endIndex);
      explanation = text.replace(code, '').trim();
    }

    return {
      code,
      explanation
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "UML 生成失败。");
  }
};

/**
 * Performs a visual review of the generated diagram.
 */
export const generateVisualReview = async (
  diagramImageBase64: string,
  currentCode: string
): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Must use a vision-capable model
      contents: {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: diagramImageBase64
            }
          },
          {
            text: `Based on this rendered diagram image and the following source code, provide a visual design critique.\n\nSource Code:\n${currentCode}`
          }
        ]
      },
      config: {
        systemInstruction: REVIEW_INSTRUCTION,
        temperature: 0.4,
      }
    });

    return response.text || "无法生成评审结果。";
  } catch (error: any) {
    console.error("Review API Error:", error);
    throw new Error(error.message || "评审失败。");
  }
};