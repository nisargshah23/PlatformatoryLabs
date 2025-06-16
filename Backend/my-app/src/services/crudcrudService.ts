import axios from 'axios';
import { CRUDCRUD_CONFIG } from '../config/crudcrud';

export class CrudcrudService {
  private static baseUrl: string;
  private static apiKey: string;

  static initialize(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = `${CRUDCRUD_CONFIG.API_URL}/${apiKey}/${CRUDCRUD_CONFIG.COLLECTIONS.USERS}`;
  }

  static async createUser(userData: any) {
    const response = await axios.post(this.baseUrl, userData);
    return response.data;
  }

  static async getUserById(id: string) {
    const response = await axios.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  static async getUserByEmail(email: string) {
    const response = await axios.get(this.baseUrl);
    const users = response.data;
    return users.find((user: any) => user.email === email);
  }

  static async getAllUsers() {
    const response = await axios.get(this.baseUrl);
    return response.data;
  }

  static async updateUser(id: string, updateData: any) {
    try {
      console.log('Updating user with ID:', id);
      console.log('Update data:', updateData);
      
      const response = await axios.put(`${this.baseUrl}/${id}`, updateData);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Crudcrud update error:', error || error);
      throw error;
    }
  }

  static async deleteUser(id: string) {
    await axios.delete(`${this.baseUrl}/${id}`);
  }
}