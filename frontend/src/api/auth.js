import api from './client';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const registerApi = async ({ name, email, password }) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

/**
 * Authenticate user credentials
 * POST /api/v1/auth/login
 */
export const loginApi = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Retrieve current user profile
 * GET /api/v1/auth/me
 */
export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Update current user profile (name)
 * PATCH /api/v1/auth/me
 */
export const updateUserApi = async ({ name }) => {
  const response = await api.patch('/auth/me', { name });
  return response.data;
};

/**
 * Change current user password
 * PUT /api/v1/auth/change-password
 */
export const changePasswordApi = async ({ old_password, new_password }) => {
  const response = await api.put('/auth/change-password', { old_password, new_password });
  return response.data;
};

/**
 * Delete account
 * DELETE /api/v1/auth/me
 */
export const deleteAccountApi = async () => {
  const response = await api.delete('/auth/me');
  return response.data;
};
