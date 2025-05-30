const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TENANT_ID_KEY = 'tenant_id';

export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: { accessToken: string; refreshToken: string }) => {
  localStorage.setItem(TOKEN_KEY, token.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, token.refreshToken);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TENANT_ID_KEY);
};

export const getTenantId = () => {
  return localStorage.getItem(TENANT_ID_KEY);
};

export const setTenantId = (tenantId: string) => {
  localStorage.setItem(TENANT_ID_KEY, tenantId);
}; 