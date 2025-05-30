'use server';
/**
 * @fileOverview A flow to fetch the conservation status of a species from the IUCN Red List.
 *
 * - getConservationStatus - A function that attempts to fetch the conservation status.
 * - GetConservationStatusInput - The input type for the getConservationStatus function.
 * - GetConservationStatusOutput - The return type for the getConservationStatus function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetConservationStatusInputSchema = z.object({
  scientificName: z.string().describe('The scientific name of the species to look up.'),
});
export type GetConservationStatusInput = z.infer<typeof GetConservationStatusInputSchema>;

// IUCN Red List categories: https://www.iucnredlist.org/resources/categories-and-criteria
// EX: Extinct, EW: Extinct in the Wild, CR: Critically Endangered, EN: Endangered, VU: Vulnerable,
// NT: Near Threatened, LC: Least Concern, DD: Data Deficient, NE: Not Evaluated
const ConservationStatusCategorySchema = z.enum([
  "EX", "EW", "CR", "EN", "VU", "NT", "LC", "DD", "NE",
  "Extinto", "Extinto na Natureza", "Criticamente em Perigo", "Em Perigo", "Vulnerável",
  "Quase Ameaçado", "Pouco Preocupante", "Dados Insuficientes", "Não Avaliado"
]).nullable();

const GetConservationStatusOutputSchema = z.object({
  status: ConservationStatusCategorySchema.describe('The IUCN conservation status category code (e.g., VU, EN, LC) or null if not found/error.'),
  errorMessage: z.string().optional().describe('An error message if the status could not be fetched.'),
});
export type GetConservationStatusOutput = z.infer<typeof GetConservationStatusOutputSchema>;

export async function getConservationStatus(input: GetConservationStatusInput): Promise<GetConservationStatusOutput> {
  return getConservationStatusFlow(input);
}

const getConservationStatusFlow = ai.defineFlow(
  {
    name: 'getConservationStatusFlow',
    inputSchema: GetConservationStatusInputSchema,
    outputSchema: GetConservationStatusOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.IUCN_REDLIST_API_TOKEN;

    if (!apiKey) {
      console.warn("IUCN_REDLIST_API_TOKEN not set. Skipping API call.");
      // You might want to return a specific status or let it be null
      // For now, returning null and an informative message
      return { status: null, errorMessage: "IUCN API token not configured." };
    }

    if (!input.scientificName || input.scientificName.trim() === "") {
        return { status: null, errorMessage: "Scientific name is required." };
    }
    
    const url = `http://apiv3.iucnredlist.org/api/v3/species/${encodeURIComponent(input.scientificName)}?token=${apiKey}`;

    try {
      /*
      // --- UNCOMMENT THIS SECTION TO MAKE ACTUAL API CALLS ---
      // --- AND ENSURE YOU HAVE SET IUCN_REDLIST_API_TOKEN in .env.local ---

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return { status: null, errorMessage: `Species not found on IUCN Red List: ${input.scientificName}` };
        }
        throw new Error(`IUCN API request failed with status ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      if (data && data.result && data.result.length > 0) {
        // Return the category of the first result
        // You might want to add more sophisticated logic if multiple results are returned
        const category = data.result[0].category;
        if (ConservationStatusCategorySchema.safeParse(category).success) {
           return { status: category as z.infer<typeof ConservationStatusCategorySchema>, errorMessage: undefined };
        } else {
           console.warn(`Received unknown category from IUCN: ${category} for ${input.scientificName}`);
           return { status: null, errorMessage: `Unknown category from IUCN: ${category}` };
        }
      } else {
        return { status: null, errorMessage: `No results for ${input.scientificName} on IUCN Red List.` };
      }
      */

      // Placeholder until API call is uncommented
      console.log(`Simulating IUCN API call for: ${input.scientificName}. Uncomment code in get-conservation-status-flow.ts to use actual API.`);
      // For now, return null, indicating the user should check/enter manually or the API call needs to be enabled.
      return { status: null, errorMessage: "IUCN API call is currently disabled in the flow." };

    } catch (error) {
      console.error('Error fetching conservation status from IUCN:', error);
      let message = 'An unexpected error occurred while fetching conservation status.';
      if (error instanceof Error) {
        message = error.message;
      }
      return { status: null, errorMessage: message };
    }
  }
);
