
import { GoogleGenAI, Type } from "@google/genai";
import type { BddScenario } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const BDD_SCENARIO_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      scenario: {
        type: Type.STRING,
        description: 'A concise, descriptive title for the BDD test scenario, starting with "Scenario:".',
      },
      steps: {
        type: Type.ARRAY,
        description: 'An array of strings, where each string is a single step in Gherkin format (e.g., "Given ...", "When ...", "Then ...", "And ...").',
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ["scenario", "steps"],
  },
};

export const generateBddScenarios = async (documentText: string): Promise<BddScenario[]> => {
  const systemInstruction = `
You are an expert QA Engineer specializing in Behavior-Driven Development (BDD).
Your task is to analyze the provided design document or user story and generate comprehensive test scenarios in Gherkin format.
The scenarios should cover positive paths, negative paths, and edge cases mentioned or implied in the document.
Focus on user actions and system responses.
Ensure the output is strictly a JSON array matching the provided schema.
Do not add any introductory text, markdown formatting, or explanations outside of the JSON structure.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: documentText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: BDD_SCENARIO_SCHEMA,
        temperature: 0.3,
      }
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the AI model.");
    }

    const scenarios: BddScenario[] = JSON.parse(jsonText);
    return scenarios;

  } catch (error) {
    console.error("Error generating BDD scenarios:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("The AI returned an invalid JSON format. Please try again.");
    }
    throw new Error("Failed to communicate with the GenAI service.");
  }
};
