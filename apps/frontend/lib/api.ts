export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
// SOCKET_URL: prefer explicit NEXT_PUBLIC_API_BASE_URL if provided, otherwise connect
// directly to backend during development to avoid proxying issues with socket.io
export const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
