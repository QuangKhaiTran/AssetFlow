'use server';

/**
 * @fileOverview An AI agent that analyzes asset data and predicts maintenance needs.
 *
 * - getPredictiveMaintenanceSchedule - A function that generates a predictive maintenance schedule based on asset data.
 * - PredictiveMaintenanceScheduleInput - The input type for the getPredictiveMaintenanceSchedule function.
 * - PredictiveMaintenanceScheduleOutput - The return type for the getPredictiveMaintenanceSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveMaintenanceScheduleInputSchema = z.object({
  assetData: z
    .string()
    .describe(
      'A comprehensive dataset containing historical asset information, including usage statistics, maintenance logs, and reported issues.'
    ),
  inventoryData: z
    .string()
    .describe(
      'Detailed inventory data, listing all assets, their quantities, and current status (e.g., in use, under repair, broken, disposed of).'
    ),
  reportedProblems: z
    .string()
    .describe(
      'A record of all reported problems related to assets, including descriptions, frequency, and resolution details.'
    ),
});
export type PredictiveMaintenanceScheduleInput = z.infer<
  typeof PredictiveMaintenanceScheduleInputSchema
>;

const PredictiveMaintenanceScheduleOutputSchema = z.object({
  maintenanceSchedule: z
    .string()
    .describe(
      'A detailed maintenance schedule outlining proactive maintenance tasks for each asset, including frequency, procedures, and priority based on predicted needs.'
    ),
  riskAssessment: z
    .string()
    .describe(
      'An assessment of potential risks associated with each asset, including the likelihood of failure and potential impact on operations if maintenance is not performed.'
    ),
  recommendations: z
    .string()
    .describe(
      'Specific recommendations for optimizing maintenance strategies, including suggested changes to maintenance intervals, procedures, or resource allocation.'
    ),
});
export type PredictiveMaintenanceScheduleOutput = z.infer<
  typeof PredictiveMaintenanceScheduleOutputSchema
>;

export async function getPredictiveMaintenanceSchedule(
  input: PredictiveMaintenanceScheduleInput
): Promise<PredictiveMaintenanceScheduleOutput> {
  return predictiveMaintenanceScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveMaintenanceSchedulePrompt',
  input: {schema: PredictiveMaintenanceScheduleInputSchema},
  output: {schema: PredictiveMaintenanceScheduleOutputSchema},
  prompt: `You are an AI assistant designed to analyze asset data and generate predictive maintenance schedules.

  Based on the provided asset data, inventory data, and reported problems, your goal is to proactively identify potential maintenance needs, minimize downtime, and optimize maintenance strategies.

  Consider the following factors when generating the maintenance schedule:
  - Historical asset usage and performance
  - Frequency and severity of reported problems
  - Current asset status and availability
  - Potential risks associated with asset failure

  Asset Data: {{{assetData}}}
  Inventory Data: {{{inventoryData}}}
  Reported Problems: {{{reportedProblems}}}

  Output the predictive maintenance schedule, risk assessment, and recommendations in a clear and concise format.
  Include specific maintenance tasks, frequency, priority, and potential impact on operations.
  Be specific, professional, and actionable with your analysis.
  Do not be conversational.
  Strictly adhere to the output schema.`,
});

const predictiveMaintenanceScheduleFlow = ai.defineFlow(
  {
    name: 'predictiveMaintenanceScheduleFlow',
    inputSchema: PredictiveMaintenanceScheduleInputSchema,
    outputSchema: PredictiveMaintenanceScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
