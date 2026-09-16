import { Injectable } from '@angular/core';
import axios from 'axios';

// 1. Interfaces TypeScript (Paso 2 de tu entregable)
export interface Account {
  id?: number;
  name: string;
  email: string;
  role: 'manager' | 'staff';
}

export interface InventoryItem {
  id?: number;
  sku: string;
  item_title: string;
  category: string;
  stock_qty: number;
  unit_cost: number;
  is_available?: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'http://localhost:8000'; // URL de tu backend PHP

  // 2. Operaciones CRUD básicas (Paso 3 de tu entregable)

  // READ (Consultar registros)
  async getItems(): Promise<InventoryItem[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/items.php`);
      if (response.data && response.data.result === 'success') {
        return response.data.items;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener el inventario:', error);
      return [];
    }
  }

  // CREATE (Registrar un nuevo artículo)
  async createItem(item: InventoryItem): Promise<boolean> {
    try {
      const response = await axios.post(`${this.apiUrl}/create_item.php`, item);
      return response.data && response.data.result === 'success';
    } catch (error) {
      console.error('Error al crear el elemento:', error);
      return false;
    }
  }

  // UPDATE (Modificar un artículo existente)
  async updateItem(id: number, item: InventoryItem): Promise<boolean> {
    try {
      const response = await axios.put(`${this.apiUrl}/update_item.php?id=${id}`, item);
      return response.data && response.data.result === 'success';
    } catch (error) {
      console.error('Error al actualizar el elemento:', error);
      return false;
    }
  }

  // DELETE (Dar de baja un artículo)
  async deleteItem(id: number): Promise<boolean> {
    try {
      const response = await axios.delete(`${this.apiUrl}/delete_item.php?id=${id}`);
      return response.data && response.data.result === 'success';
    } catch (error) {
      console.error('Error al eliminar el elemento:', error);
      return false;
    }
  }
}