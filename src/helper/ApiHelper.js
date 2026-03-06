import axios from 'axios';
// Create an instance of axios
 const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const axiosInstance = axios.create({
  baseURL:  `${BASE_URL}/api/v1/user`,
  headers: {    
    'Content-Type': 'application/json',
    
  },
});


  const callApi = async (method, url, data = null, headers = {}) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      headers,
    });
    return response.data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error; 
  }
};

export default callApi;
