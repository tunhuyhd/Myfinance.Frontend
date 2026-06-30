import { api } from './api';
import { UserProfile } from './auth.service';

export const adminService = {
  getUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get('/Admin/users');
    return response.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/Admin/users/${id}`);
  },
};
