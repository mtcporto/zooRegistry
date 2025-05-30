
'use server';
/**
 * @fileOverview A flow to fetch the conservation status and taxonomic info of a species from the IUCN Red List API v4.
 *
 * - getConservationStatusAndTaxonomy - A function that attempts to fetch the data.
 * - GetIUCNDataInput - The input type for the function.
 * - GetIUCNDataOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetIUCNDataInputSchema = z.object({
  scientificName: z.string().describe('The scientific name of the species to look up (e.g., "Panthera leo").'),
});
export type GetIUCNDataInput = z.infer<typeof GetIUCNDataInputSchema>;

const ConservationStatusCategorySchema = z.enum([
  "EX", "EW", "CR", "EN", "VU", "NT", "LC", "DD", "NE"
]).nullable();

const GetIUCNDataOutputSchema = z.object({
  status: ConservationStatusCategorySchema.describe('The IUCN conservation status category code (e.g., VU, EN, LC) or null if not found/error.'),
  kingdomName: z.string().nullable().describe('Kingdom name from IUCN.'),
  phylumName: z.string().nullable().describe('Phylum name from IUCN.'),
  className: z.string().nullable().describe('Class name from IUCN.'),
  orderName: z.string().nullable().describe('Order name from IUCN.'),
  familyName: z.string().nullable().describe('Family name from IUCN.'),
  commonNames: z.string().nullable().describe('Concatenated common names from IUCN (English preferred).'),
  errorMessage: z.string().optional().describe('An error message if the status could not be fetched.'),
});
export type GetIUCNDataOutput = z.infer<typeof GetIUCNDataOutputSchema>;

export async function getConservationStatusAndTaxonomy(input: GetIUCNDataInput): Promise<GetIUCNDataOutput> {
  return getIUCNDataFlow(input);
}

const getIUCNDataFlow = ai.defineFlow(
  {
    name: 'getIUCNDataFlow',
    inputSchema: GetIUCNDataInputSchema,
    outputSchema: GetIUCNDataOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.IUCN_REDLIST_API_TOKEN;

    if (!apiKey) {
      console.warn("IUCN_REDLIST_API_TOKEN not set in environment variables. Skipping API call.");
      return { 
        status: null, 
        kingdomName: null, phylumName: null, className: null, orderName: null, familyName: null, commonNames: null,
        errorMessage: "IUCN API token not configured. Please set IUCN_REDLIST_API_TOKEN in your .env or .env.local file." 
      };
    }

    if (!input.scientificName || input.scientificName.trim() === "") {
        return { 
            status: null, 
            kingdomName: null, phylumName: null, className: null, orderName: null, familyName: null, commonNames: null,
            errorMessage: "Scientific name is required." 
        };
    }

    const nameParts = input.scientificName.trim().split(/\s+/);
    if (nameParts.length < 2) {
      return { 
        status: null, 
        kingdomName: null, phylumName: null, className: null, orderName: null, familyName: null, commonNames: null,
        errorMessage: "Scientific name should include at least genus and species (e.g., 'Panthera leo')." 
      };
    }
    const genusName = nameParts[0];
    const speciesName = nameParts[1];
    // const infraName = nameParts.length > 2 ? nameParts.slice(2).join(" ") : undefined; // Optional for trinomials

    const API_BASE_URL = "https://api.iucnredlist.org/api/v4"; 
    // const url = `${API_BASE_URL}/taxa/scientific_name/${encodeURIComponent(input.scientificName)}?token=${apiKey}`; // Old URL
    let url = `${API_BASE_URL}/taxa/scientific_name?genus_name=${encodeURIComponent(genusName)}&species_name=${encodeURIComponent(speciesName)}&token=${apiKey}`;
    // if (infraName) {
    //   url += `&infra_name=${encodeURIComponent(infraName)}`;
    // }


    console.log(`Fetching IUCN data from: ${API_BASE_URL}/taxa/scientific_name?genus_name=${genusName}&species_name=${speciesName}... (token omitted)`);

    try {
      const response = await fetch(url, { headers: { 'Authorization': apiKey, 'Accept': 'application/json' } });

      if (!response.ok) {
        if (response.status === 404) {
          return { 
            status: null, 
            kingdomName: null, phylumName: null, className: null, orderName: null, familyName: null, commonNames: null,
            errorMessage: `Species not found on IUCN Red List: ${input.scientificName}` 
          };
        }
        const errorText = await response.text();
        console.error(`IUCN API request failed for ${input.scientificName} with status ${response.status}: ${errorText}`);
        throw new Error(`IUCN API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data || !data.taxon || !data.assessments || data.assessments.length === 0) {
        return { 
            status: null, 
            kingdomName: null, phylumName: null, className: null, orderName: null, familyName: null, commonNames: null,
            errorMessage: `No assessment entries found for ${input.scientificName} on IUCN Red List.` 
        };
      }
      
      const taxonInfo = data.taxon;
      let latestAssessment = null;

      // Try to find the assessment marked as "latest: true" and "scope: Global"
      const latestGlobalTrue = data.assessments.find((a: any) => 
        a.latest === true && a.scopes && a.scopes.some((s: any) => s.code === "1" || s.description?.en?.toLowerCase() === 'global')
      );

      if (latestGlobalTrue) {
        latestAssessment = latestGlobalTrue;
      } else {
        // Fallback: find the most recent global assessment by year_published
        const globalAssessments = data.assessments.filter((a: any) => 
          a.scopes && a.scopes.some((s: any) => s.code === "1" || s.description?.en?.toLowerCase() === 'global')
        );
        
        if (globalAssessments.length > 0) {
          globalAssessments.sort((a: any, b: any) => parseInt(b.year_published, 10) - parseInt(a.year_published, 10));
          latestAssessment = globalAssessments[0];
        }
      }
      
      if (!latestAssessment) {
         return { 
            status: null, 
            kingdomName: taxonInfo.kingdom_name || null,
            phylumName: taxonInfo.phylum_name || null,
            className: taxonInfo.class_name || null,
            orderName: taxonInfo.order_name || null,
            familyName: taxonInfo.family_name || null,
            commonNames: taxonInfo.common_names?.find((cn:any) => cn.main)?.name || taxonInfo.common_names?.[0]?.name || null,
            errorMessage: `No suitable (latest global) assessment found for ${input.scientificName}. Taxon data retrieved.` 
        };
      }

      const category = latestAssessment.red_list_category_code;
      const parsedCategory = ConservationStatusCategorySchema.safeParse(category);

      const extractedCommonNames = taxonInfo.common_names
        ?.filter((cn: any) => cn.language === 'eng' || cn.main) // Prefer English or main
        .map((cn: any) => cn.name)
        .join(', ');

      if (parsedCategory.success) {
        console.log(`Successfully fetched IUCN data for ${input.scientificName}: Status ${category}, Class ${taxonInfo.class_name}`);
        return { 
            status: parsedCategory.data, 
            kingdomName: taxonInfo.kingdom_name || null,
            phylumName: taxonInfo.phylum_name || null,
            className: taxonInfo.class_name || null,
            orderName: taxonInfo.order_name || null,
            familyName: taxonInfo.family_name || null,
            commonNames: extractedCommonNames || null,
            errorMessage: undefined 
        };
      } else {
        console.warn(`Received unknown or missing category from IUCN: '${category}' for ${input.scientificName}. Assessment ID ${latestAssessment.assessment_id}.`);
        return { 
            status: null, 
            kingdomName: taxonInfo.kingdom_name || null,
            phylumName: taxonInfo.phylum_name || null,
            className: taxonInfo.class_name || null,
            orderName: taxonInfo.order_name || null,
            familyName: taxonInfo.family_name || null,
            commonNames: extractedCommonNames || null,
            errorMessage: `Unknown or missing category from IUCN: '${category || 'Not provided'}'` 
        };
      }

    } catch (error) {
      console.error(`Error fetching IUCN data for ${input.scientificName}:`, error);
      let message = 'An unexpected error occurred while fetching IUCN data.';
      if (error instanceof Error) {
        message = error.message;
      }
      return { 
        status: null, 
        kingdomName: null, phylumName: null, className: null, orderName: null, familyName: null, commonNames: null,
        errorMessage: message 
      };
    }
  }
);
