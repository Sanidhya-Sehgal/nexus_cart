import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchShopifyProducts = async () => {
  const response = await api.get('/shopify/products');
  return response.data;
};

export const syncProduct = async (product: any) => {
  const response = await api.post('/sync', { product });
  return response.data;
};

export const fetchSyncHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};
