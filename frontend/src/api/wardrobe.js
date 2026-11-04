import api from './client';

/**
 * List clothing items with optional filters and pagination
 * GET /api/v1/wardrobe/items
 */
export const listItemsApi = async (params = {}) => {
  const response = await api.get('/wardrobe/items', { params });
  return response.data;
};

/**
 * Retrieve a single clothing item by ID
 * GET /api/v1/wardrobe/items/{id}
 */
export const getItemApi = async (id) => {
  const response = await api.get(`/wardrobe/items/${id}`);
  return response.data;
};

/**
 * Create a new clothing item (multipart/form-data)
 * POST /api/v1/wardrobe/items
 */
export const createItemApi = async (formData) => {
  const response = await api.post('/wardrobe/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Update an existing clothing item (multipart/form-data)
 * PUT /api/v1/wardrobe/items/{id}
 */
export const updateItemApi = async (id, formData) => {
  const response = await api.put(`/wardrobe/items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete a clothing item
 * DELETE /api/v1/wardrobe/items/{id}
 */
export const deleteItemApi = async (id) => {
  const response = await api.delete(`/wardrobe/items/${id}`);
  return response.data;
};

/**
 * Mark item as worn today
 * POST /api/v1/wardrobe/items/{id}/worn
 */
export const markItemWornApi = async (id) => {
  const response = await api.post(`/wardrobe/items/${id}/worn`);
  return response.data;
};
