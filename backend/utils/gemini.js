
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Gemini configuration
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

let ai = null;

// Initialize Gemini client only when needed
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from backend .env");
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }

  return ai;
};

// Wait helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry temporary Gemini service-unavailable errors
const generateContentWithRetry = async (params, maxRetries = 2) => {
  let attempt = 0;

  while (true) {
    try {
      const client = getAIClient();

      return await client.models.generateContent(params);
    } catch (error) {
      const isTemporaryUnavailable = error?.status === 503;

      if (!isTemporaryUnavailable || attempt >= maxRetries) {
        throw error;
      }

      const delay = 1000 * 2 ** attempt;

      attempt++;

      console.warn(
        `Gemini temporarily unavailable. Retrying (${attempt}/${maxRetries}) in ${delay / 1000} seconds...`
      );

      await sleep(delay);
    }
  }
};

// Parse JSON response from Gemini
const parseJsonResponse = (text, responseName) => {
  if (!text || typeof text !== "string") {
    throw new Error(`Gemini returned an empty ${responseName} response`);
  }

  let jsonText = text.trim();

  // Remove markdown code fences if present
  jsonText = jsonText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error(`Invalid JSON returned for ${responseName}:`, error);
    throw new Error(`Gemini returned invalid JSON for ${responseName}`);
  }
};

// Generate JSON content using Gemini
const generateJson = async (prompt, responseName) => {
  const response = await generateContentWithRetry({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return parseJsonResponse(response.text, responseName);
};

// Create a user-friendly error while preserving HTTP status
const createGeminiError = (error, fallbackMessage) => {
  let message = fallbackMessage;

  if (error?.status === 503) {
    message = "Gemini is temporarily overloaded. Please try again shortly.";
  } else if (error?.message?.includes("GEMINI_API_KEY")) {
    message = error.message;
  }

  const newError = new Error(message, { cause: error });
  newError.status = error?.status === 503 ? 503 : 500;

  return newError;
};

/**
 * Generate AI Recipe
 */
export const generateRecipe = async ({
  ingredients,
  dietaryRestrictions = [],
  cuisineType = "any",
  servings = 4,
  cookingTime = "medium",
}) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error("At least one ingredient is required");
  }

  const dietaryInfo =
    dietaryRestrictions.length > 0
      ? `Dietary restrictions: ${dietaryRestrictions.join(", ")}`
      : "No dietary restrictions";

  const timeGuide = {
    quick: "under 30 minutes",
    medium: "30-60 minutes",
    long: "over 60 minutes",
  };

  const prompt = `
You are a professional chef and recipe generator.

Generate a detailed, practical recipe using the following requirements.

Available ingredients: ${ingredients.join(", ")}

${dietaryInfo}

Cuisine type: ${cuisineType}
Servings: ${servings}
Cooking time: ${timeGuide[cookingTime] || "any"}

Return ONLY a valid JSON object with this exact structure:

{
  "name": "Recipe name",
  "description": "Brief description",
  "cuisineType": "${cuisineType}",
  "difficulty": "easy",
  "prepTime": 15,
  "cookTime": 25,
  "servings": ${servings},
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": 2,
      "unit": "cups"
    }
  ],
  "instructions": [
    "First cooking step",
    "Second cooking step"
  ],
  "dietaryTags": ["vegetarian"],
  "nutrition": {
    "calories": 250,
    "protein": 10,
    "carbs": 30,
    "fats": 8,
    "fiber": 5
  },
  "cookingTips": [
    "Cooking tip 1",
    "Cooking tip 2"
  ]
}

Important requirements:
- Return valid JSON only. Do not include markdown.
- Use numeric values for quantities and nutrition.
- Instructions must be an array of strings.
- Include all necessary ingredients and precise quantities.
- Respect all dietary restrictions.
- Use available ingredients effectively.
- Nutrition values should be reasonable estimates.
- Do not claim that the recipe is suitable for an allergy unless all ingredients have been checked.
`;

  try {
    const recipe = await generateJson(prompt, "recipe");

    // Basic response validation
    if (
      !recipe ||
      typeof recipe !== "object" ||
      !recipe.name ||
      !Array.isArray(recipe.ingredients) ||
      !Array.isArray(recipe.instructions) ||
      !recipe.nutrition
    ) {
      throw new Error("Generated recipe is missing required fields");
    }

    return recipe;
  } catch (error) {
    console.error("Gemini recipe generation error:", error);

    throw createGeminiError(
      error,
      "Failed to generate recipe. Please try again."
    );
  }
};

/**
 * Generate Pantry Recipe Suggestions
 */
export const generatePantrySuggestions = async (
  pantryItems,
  expiringItems = []
) => {
  const ingredients = pantryItems.map((item) => item.name).join(", ");

  const expiringText =
    expiringItems.length > 0
      ? `\nPriority ingredients (expiring soon): ${expiringItems.join(", ")}`
      : "";

  const prompt = `
You are a professional chef.

Available pantry ingredients:
${ingredients}
${expiringText}

Suggest 3 creative recipe ideas using the available ingredients.

Prioritize ingredients that are expiring soon.

Return ONLY a valid JSON array of strings:

[
  "Recipe idea 1",
  "Recipe idea 2",
  "Recipe idea 3"
]

Each suggestion should be a short, appetizing description.
`;

  try {
    const suggestions = await generateJson(
      prompt,
      "pantry suggestions"
    );

    if (
      !Array.isArray(suggestions) ||
      !suggestions.every((item) => typeof item === "string")
    ) {
      throw new Error("Invalid pantry suggestions response");
    }

    return suggestions;
  } catch (error) {
    console.error("Gemini pantry suggestions error:", error);

    throw createGeminiError(
      error,
      "Failed to generate pantry suggestions."
    );
  }
};

/**
 * Generate Cooking Tips
 */
export const generateCookingTips = async (recipe) => {
  const prompt = `
You are a professional chef.

Recipe name: ${recipe.name}

Ingredients:
${recipe.ingredients?.map((item) => item.name).join(", ") || "N/A"}

Provide 3-5 useful cooking tips to improve this recipe.

Return ONLY a valid JSON array of strings:

[
  "Cooking tip 1",
  "Cooking tip 2",
  "Cooking tip 3"
]
`;

  try {
    const tips = await generateJson(prompt, "cooking tips");

    if (
      !Array.isArray(tips) ||
      !tips.every((item) => typeof item === "string")
    ) {
      throw new Error("Invalid cooking tips response");
    }

    return tips;
  } catch (error) {
    console.error("Gemini cooking tips error:", error);

    // Fallback response
    return ["Cook with love and patience!"];
  }
};

// Default exports
export default {
  generateRecipe,
  generatePantrySuggestions,
  generateCookingTips,
};
