
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
  animalName: z.string().describe('The common name of the animal to search for (e.g., "Lion", "Tiger").'),
});
export type GetAnimalImageInput = z.infer<typeof GetAnimalImageInputSchema>;

const GetAnimalImageOutputSchema = z.object({
  imageUrl: z.string().url().nullable().describe('The URL of the first matching image found on Pexels, or null if not found/error.'),
  errorMessage: z.string().optional().describe('An error message if the image could not be fetched.'),
});
export type GetAnimalImageOutput = z.infer<typeof GetAnimalImageOutputSchema>;

export async function getAnimalImage(input: GetAnimalImageInput): Promise<GetAnimalImageOutput> {
  return getAnimalImageFlow(input);
}

const getAnimalImageFlow = ai.defineFlow(
  {
    name: 'getAnimalImageFlow',
    inputSchema: GetAnimalImageInputSchema,
    outputSchema: GetAnimalImageOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
      console.warn("PEXELS_API_KEY not set in environment variables. Skipping Pexels API call.");
      return { imageUrl: null, errorMessage: "Pexels API key not configured. Please set PEXELS_API_KEY in your .env or .env.local file." };
    }

    if (!input.animalName || input.animalName.trim() === "") {
      return { imageUrl: null, errorMessage: "Animal name is required for Pexels search." };
    }

    const PEXELS_API_BASE_URL = "https://api.pexels.com/v1/search";
    const query = encodeURIComponent(input.animalName);
    // We'll fetch only 1 image, and try to get a landscape one if possible for consistency.
    const url = `${PEXELS_API_BASE_URL}?query=${query}&per_page=1&orientation=landscape`;

    // Log URL without sensitive key for debugging, only if not in production
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Fetching image from Pexels: ${PEXELS_API_BASE_URL}?query=${query}&per_page=1&orientation=landscape`);
    }

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Pexels API request failed with status ${response.status}: ${errorText}`);
        return { imageUrl: null, errorMessage: `Pexels API request failed: ${response.statusText}` };
      }

      const data = await response.json();

      if (data.photos && data.photos.length > 0) {
        // Pexels typically provides multiple sizes. 'src.large' or 'src.original' are good choices.
        // 'src.medium' or 'src.landscape' might also be suitable depending on display needs.
        const imageUrl = data.photos[0].src.large; 
        console.log(`Successfully fetched image for ${input.animalName} from Pexels: ${imageUrl}`);
        return { imageUrl, errorMessage: undefined };
      } else {
        console.log(`No photos found on Pexels for query: ${input.animalName}`);
        return { imageUrl: null, errorMessage: `No photos found on Pexels for "${input.animalName}".` };
      }

    } catch (error) {
      console.error(`Error fetching image from Pexels for ${input.animalName}:`, error);
      let message = 'An unexpected error occurred while fetching image from Pexels.';
      if (error instanceof Error) {
        message = error.message;
      }
      return { imageUrl: null, errorMessage: message };
    }
  }
);
