import client from './client';

/**
 * Request AI-generated outfit recommendations
 * POST /api/v1/outfits/suggest
 */
export async function suggestOutfitsApi({
  occasion,
  city,
  temp_c,
  style,
  anchor_item_id,
  count = 4,
  exclude_outfit_ids = [],
}) {
  const payload = {
    occasion,
    count,
    exclude_outfit_ids,
  };
  if (city) payload.city = city;
  if (temp_c !== undefined && temp_c !== null && temp_c !== '') {
    payload.temp_c = parseFloat(temp_c);
  }
  if (style) payload.style = style;
  if (anchor_item_id) payload.anchor_item_id = parseInt(anchor_item_id, 10);

  const response = await client.post('/outfits/suggest', payload, {
    timeout: 60000,
  });
  return response.data;
}

/**
 * Fetch a single saved outfit by ID
 * GET /api/v1/outfits/{id}
 */
export async function getOutfitApi(outfitId) {
  const response = await client.get(`/outfits/${outfitId}`);
  return response.data;
}

/**
 * Submit feedback on an outfit: like | dislike | save | unsave | worn
 * POST /api/v1/outfits/{id}/feedback
 */
export async function submitFeedbackApi(outfitId, action) {
  const response = await client.post(`/outfits/${outfitId}/feedback`, { action });
  return response.data;
}

/**
 * List saved, liked, or history outfits with pagination
 * GET /api/v1/outfits/saved?type=saved|liked|history&page=1&limit=10
 */
export async function getSavedOutfitsApi({ type = 'saved', page = 1, limit = 10 } = {}) {
  const response = await client.get('/outfits/saved', {
    params: { type, page, limit },
  });
  return response.data;
}
