import api from './client';

/**
 * Retrieve planned outfits, optionally filtered by date range.
 * GET /api/v1/planner?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */
export const getPlannedOutfitsApi = async ({ start_date, end_date } = {}) => {
  const params = {};
  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;

  const response = await api.get('/planner', { params });
  return response.data;
};

/**
 * Schedule an outfit for a date.
 * POST /api/v1/planner
 */
export const scheduleOutfitApi = async ({ outfit_id, planned_date, notes }) => {
  const response = await api.post('/planner', {
    outfit_id,
    planned_date,
    notes,
  });
  return response.data;
};

/**
 * Remove a scheduled outfit entry.
 * DELETE /api/v1/planner/{id}
 */
export const unscheduleOutfitApi = async (planned_id) => {
  const response = await api.delete(`/planner/${planned_id}`);
  return response.data;
};
