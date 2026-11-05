import client from './client';

/**
 * Fetch wardrobe analytics and wear statistics
 * GET /api/v1/insights/summary
 */
export async function getInsightsSummaryApi() {
  const response = await client.get('/insights/summary');
  return response.data;
}
