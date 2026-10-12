import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Fetch all sneakers with optional filters
export const getAllSneakers = async (page, limit, brands, sortOrder, searchQuery = '') => {
  try {
    const response = await api.get('/sneakers', {
      params: { page, limit, brands, sortOrder, search: searchQuery }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sneakers:', error);
    throw error;
  }
};

// Fetch a sneaker by its ID
export const getSneakerById = async (id) => {
  try {
    const response = await api.get(`/sneakers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search sneakers by term
export const searchSneakers = async (term) => {
  try {
    const response = await api.get('/sneakers/search', {
      params: { term }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch the featured sneaker
export const getFeaturedSneaker = async () => {
  try {
    const response = await api.get('/sneakers/featured');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured sneaker:', error);
    throw error;
  }
};
