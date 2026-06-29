import { api } from './api';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export const authService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/Auth/me');
    return response.data;
  },
  uploadAvatar: async (file: File): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/Auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
