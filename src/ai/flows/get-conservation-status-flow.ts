
'use server';
/**
 * @fileOverview A flow to fetch the conservation status of a species from the IUCN Red List API v4.
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

// IUCN Red List categories (Codes)
const ConservationStatusCategorySchema = z.enum([
  "EX", "EW", "CR", "EN", "VU", "NT", "LC", "DD", "NE"
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
      console.warn("IUCN_REDLIST_API_TOKEN not set in environment variables. Skipping API call.");
      return { status: null, errorMessage: "IUCN API token not configured. Please set IUCN_REDLIST_API_TOKEN in your .env or .env.local file." };
    }

    if (!input.scientificName || input.scientificName.trim() === "") {
        return { status: null, errorMessage: "Scientific name is required." };
    }
    
    const API_BASE_URL = "http://apiv3.iucnredlist.org/api/v4"; 

    try {
      // Step 1: Get assessment IDs for the species
      // Example: http://apiv3.iucnredlist.org/api/v4/taxa/scientific_name/Loxodonta%20africana?token=YOUR_TOKEN
      const taxaUrl = `${API_BASE_URL}/taxa/scientific_name/${encodeURIComponent(input.scientificName)}?token=${apiKey}`;
      console.log(`Fetching taxa info from: ${taxaUrl}`);
      const taxaResponse = await fetch(taxaUrl);

      if (!taxaResponse.ok) {
        if (taxaResponse.status === 404) {
          return { status: null, errorMessage: `Species not found on IUCN Red List (v4 taxa): ${input.scientificName}` };
        }
        const errorText = await taxaResponse.text();
        throw new Error(`IUCN API (taxa) request failed with status ${taxaResponse.status}: ${errorText}`);
      }

      const taxaData = await taxaResponse.json();

      if (!taxaData || !taxaData.result || taxaData.result.length === 0) {
        return { status: null, errorMessage: `No assessment entries found for ${input.scientificName} on IUCN Red List (v4).` };
      }

      // Find the latest global assessment ID
      // Each item in taxaData.result can have 'assessment_id', 'year_published', 'scope'.
      // We are interested in scope: "Global" and the latest 'year_published'.
      const globalAssessments = taxaData.result.filter((a: any) => a.scope === 'Global');
      
      if (globalAssessments.length === 0) {
         return { status: null, errorMessage: `No global assessments found for ${input.scientificName} on IUCN Red List (v4).` };
      }
      
      // Sort by year_published, descending, to get the latest.
      globalAssessments.sort((a: any, b: any) => {
        const yearA = parseInt(a.year_published, 10);
        const yearB = parseInt(b.year_published, 10);
        if (isNaN(yearA) && isNaN(yearB)) return 0;
        if (isNaN(yearA)) return 1; // Put NaNs last
        if (isNaN(yearB)) return -1; // Put NaNs last
        return yearB - yearA;
      });
      
      const latestGlobalAssessment = globalAssessments[0];
      const latestAssessmentId = latestGlobalAssessment.assessment_id;

      if (!latestAssessmentId) {
         return { status: null, errorMessage: `Could not determine latest global assessment ID for ${input.scientificName}.` };
      }
      console.log(`Latest global assessment ID for ${input.scientificName}: ${latestAssessmentId}`);

      // Step 2: Get details for the latest assessment
      // Example: http://apiv3.iucnredlist.org/api/v4/assessment/22395464?token=YOUR_TOKEN
      const assessmentUrl = `${API_BASE_URL}/assessment/${latestAssessmentId}?token=${apiKey}`;
      console.log(`Fetching assessment details from: ${assessmentUrl}`);
      const assessmentResponse = await fetch(assessmentUrl);

      if (!assessmentResponse.ok) {
        const errorText = await assessmentResponse.text();
        throw new Error(`IUCN API (assessment) request for ID ${latestAssessmentId} failed with status ${assessmentResponse.status}: ${errorText}`);
      }
      const assessmentData = await assessmentResponse.json();
      
      // The category should be in 'redlistCategory' field of the assessment data
      const category = assessmentData.redlistCategory; 

      if (category && ConservationStatusCategorySchema.safeParse(category).success) {
        console.log(`Successfully fetched status for ${input.scientificName}: ${category}`);
        return { status: category as z.infer<typeof ConservationStatusCategorySchema>, errorMessage: undefined };
      } else {
        console.warn(`Received unknown or missing category from IUCN v4: '${category}' for ${input.scientificName}, assessment ID ${latestAssessmentId}. Full assessment data:`, assessmentData);
        return { status: null, errorMessage: `Unknown or missing category from IUCN v4: '${category || 'Not provided'}'` };
      }

    } catch (error) {
      console.error(`Error fetching conservation status from IUCN v4 for ${input.scientificName}:`, error);
      let message = 'An unexpected error occurred while fetching conservation status (v4).';
      if (error instanceof Error) {
        message = error.message;
      }
      return { status: null, errorMessage: message };
    }
  }
);
