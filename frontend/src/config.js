const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://brownson-acec.vercel.app'
    : 'http://localhost:4000';

export default API_BASE_URL;