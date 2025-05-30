
'use server';
/**
 * @fileOverview A flow to fetch an animal image URL from the Pexels API.
 *
 * - getAnimalImage - A function that attempts to fetch an image URL for a given animal name.
 * - GetAnimalImageInput - The input type for the getAnimalImage function.
 * - GetAnimalImageOutput - The return type for the getAnimalImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetAnimalImageInputSchema = z.object({
  animalName: z.string().describe('The common name or scientific name of the animal to search for (e.g., "Lion", "Panthera leo").'),
});
export type GetAnimalImageInput = z.infer<typeof GetAnimalImageInputSchema>;

const GetAnimalImageOutputSchema = z.object({
  imageUrl: z.string().url().nullable().describe('The URL of the first matching image found on Pexels, or null if not found/error.'),
  errorMessage: z.string().optional().describe('An error message if the image could not be fetched.'),
});
export type GetAnimalImageOutput = z.infer<typeof GetAnimalImageOutputSchema>;

export async function getAnimalImage(input: GetAnimalImageInput): Promise<GetAnimalImageOutput> {
  console.log('[PEXELS_FLOW_ENTRY] getAnimalImage called with input:', JSON.stringify(input));
  return getAnimalImageFlow(input);
}

const getAnimalImageFlow = ai.defineFlow(
  {
    name: 'getAnimalImageFlow',
    inputSchema: GetAnimalImageInputSchema,
    outputSchema: GetAnimalImageOutputSchema,
  },
  async (input) => {
    console.log(`[PEXELS_FLOW] Flow started for animalName: "${input.animalName}"`);
    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
      const errorMsg = "PEXELS_API_KEY not set in environment variables. Skipping Pexels API call.";
      console.warn(`[PEXELS_FLOW] ${errorMsg}`);
      return { imageUrl: null, errorMessage: "Pexels API key not configured. Please set PEXELS_API_KEY in your .env or .env.local file." };
    }
    console.log(`[PEXELS_FLOW] PEXELS_API_KEY is present.`);

    if (!input.animalName || input.animalName.trim() === "") {
      const errorMsg = "Animal name is required for Pexels search.";
      console.log(`[PEXELS_FLOW] ${errorMsg}`);
      return { imageUrl: null, errorMessage: errorMsg };
    }
    console.log(`[PEXELS_FLOW] Animal name provided: "${input.animalName}"`);

    const PEXELS_API_BASE_URL = "https://api.pexels.com/v1/search";
    const query = encodeURIComponent(input.animalName);
    const url = `${PEXELS_API_BASE_URL}?query=${query}&per_page=1&orientation=landscape`;

    console.log(`[PEXELS_FLOW] Fetching from URL: ${PEXELS_API_BASE_URL}?query=${query}&per_page=1&orientation=landscape (API key omitted from log for safety)`);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: apiKey,
        },
      });

      console.log(`[PEXELS_FLOW] Pexels API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        const errorMsg = `Pexels API request failed with status ${response.status}: ${errorText}`;
        console.error(`[PEXELS_FLOW] ${errorMsg}`);
        return { imageUrl: null, errorMessage: `Pexels API request failed: ${response.statusText}. Details: ${errorText}` };
      }

      const data = await response.json();
      console.log(`[PEXELS_FLOW] Pexels API response data (first photo object if exists):`, data.photos && data.photos.length > 0 ? data.photos[0] : "No photos array or empty.");


      if (data.photos && data.photos.length > 0 && data.photos[0].src && data.photos[0].src.large) {
        const imageUrl = data.photos[0].src.large; 
        console.log(`[PEXELS_FLOW] Successfully fetched image for ${input.animalName}: ${imageUrl}`);
        return { imageUrl, errorMessage: undefined };
      } else {
        const infoMsg = `No photos found on Pexels for query: ${input.animalName}. Response data.photos: ${JSON.stringify(data.photos)}`;
        console.log(`[PEXELS_FLOW] ${infoMsg}`);
        return { imageUrl: null, errorMessage: `No photos found on Pexels for "${input.animalName}".` };
      }

    } catch (error) {
      let message = 'An unexpected error occurred while fetching image from Pexels.';
      if (error instanceof Error) {
        message = error.message;
      }
      console.error(`[PEXELS_FLOW] Error fetching image from Pexels for ${input.animalName}:`, error);
      return { imageUrl: null, errorMessage: message };
    }
  }
);
