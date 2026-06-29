import { api } from './api';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
}

export const authService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/Auth/me');
    return response.data;
  },
};
