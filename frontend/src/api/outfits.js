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

  const response = await client.post('/outfits/suggest', payload);
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
