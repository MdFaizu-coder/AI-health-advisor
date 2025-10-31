
import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, Recommendations, FoodAnalysis, LifeImpact, DailyHabits } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function cleanJson(text: string) {
    const cleaned = text.replace(/^```json\s*|```\s*$/g, '');
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse JSON:", cleaned);
        throw new Error("Received malformed JSON from API.");
    }
}

export async function getRecommendations(profile: UserProfile): Promise<Recommendations> {
  const prompt = `
    Based on the following user profile, generate personalized health, diet, and workout recommendations.
    User Profile:
    - Age: ${profile.age}
    - Gender: ${profile.gender}
    - Weight: ${profile.weight} kg
    - Height: ${profile.height} cm
    - Medical Conditions: ${profile.conditions}
    - Preferred Cuisines: ${profile.cuisinePreferences || 'None specified'}
    - Dietary Restrictions: ${profile.dietaryRestrictions || 'None specified'}

    The diet plan should strongly consider the user's cuisine preferences and strictly adhere to any dietary restrictions.
    Provide the response in a structured JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diet: {
            type: Type.OBJECT,
            properties: {
              planName: { type: Type.STRING },
              description: { type: Type.STRING },
              dailyCalories: { type: Type.NUMBER },
              macronutrients: {
                type: Type.OBJECT,
                properties: {
                  protein: { type: Type.STRING },
                  carbohydrates: { type: Type.STRING },
                  fats: { type: Type.STRING },
                },
              },
              sampleMeals: {
                type: Type.OBJECT,
                properties: {
                  breakfast: { type: Type.STRING },
                  lunch: { type: Type.STRING },
                  dinner: { type: Type.STRING },
                },
              },
            },
          },
          medicineInfo: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                purpose: { type: Type.STRING },
                generalAdvice: { type: Type.STRING },
              },
            },
          },
          workouts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                duration: { type: Type.STRING },
                frequency: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });

  return cleanJson(response.text);
}


export async function analyzeFoodImage(imageBase64: string, mimeType: string, profile: UserProfile): Promise<FoodAnalysis> {
    const textPart = {
        text: `Analyze the following image of a meal. Identify the food items, estimate the nutritional content (calories, protein, carbs, fats, main vitamins), and determine if it's suitable for a person with the following profile: Age ${profile.age}, Gender ${profile.gender}, Weight ${profile.weight}kg, Height ${profile.height}cm, Conditions: ${profile.conditions}. Provide a clear reason for the suitability assessment. If the food is deemed unsuitable, you MUST provide: 1. A specific, actionable suggestion on how to modify the meal to make it healthier (e.g., 'bake instead of frying the chicken and use a side salad instead of fries'). The suggestion should be a single, concise sentence. 2. A list of 1-2 healthier, nutritionally similar alternative meals that align with the user's health profile. Respond in a structured JSON format.`
    };

    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType: mimeType,
        },
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [textPart, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    foodItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                    nutritionalInfo: {
                        type: Type.OBJECT,
                        properties: {
                            calories: { type: Type.NUMBER },
                            protein: { type: Type.NUMBER },
                            carbohydrates: { type: Type.NUMBER },
                            fats: { type: Type.NUMBER },
                            vitamins: { type: Type.ARRAY, items: { type: Type.STRING } },
                        }
                    },
                    suitability: {
                        type: Type.OBJECT,
                        properties: {
                            isSuitable: { type: Type.BOOLEAN },
                            reason: { type: Type.STRING },
                            modification: { type: Type.STRING, description: "Suggestion on how to modify the meal to make it healthier. Only provided if unsuitable." },
                            alternatives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of healthier alternative meals. Only provided if unsuitable." }
                        }
                    }
                }
            }
        }
    });

    return cleanJson(response.text);
}


export async function predictLifeImpact(profile: UserProfile, habits: DailyHabits): Promise<LifeImpact> {
    const prompt = `
      Predict the long-term health impact for a user with the following profile and habits.
      Profile:
      - Age: ${profile.age}, Gender: ${profile.gender}, Weight: ${profile.weight}kg, Height: ${profile.height}cm, Conditions: ${profile.conditions}
      Habits:
      - Exercise: ${habits.exerciseFrequency}
      - Sleep: ${habits.sleepHours} hours/night
      - Diet Quality: ${habits.dietQuality}

      Provide a life impact score (0-100), identify key risk factors and positive factors with their impact level (High, Medium, Low) and advice, and give a brief summary. Respond in a structured JSON format.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    riskFactors: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                factor: { type: Type.STRING },
                                impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                                advice: { type: Type.STRING }
                            }
                        }
                    },
                    positiveFactors: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                factor: { type: Type.STRING },
                                impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                                advice: { type: Type.STRING }
                            }
                        }
                    },
                    summary: { type: Type.STRING }
                }
            }
        }
    });

    return cleanJson(response.text);
}