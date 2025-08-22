export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  imageUrl?: string;
  stock: number;
  sku: string;
  isActive: boolean;
  itemIds?: string[];
  items?: Item[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  itemCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id?: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  price?: number;
  imageUrl?: string;
  specifications?: { [key: string]: string };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  stock: number;
  sku: string;
  isActive: boolean;
  itemIds?: string[];
}

export interface ItemFormData {
  name: string;
  description?: string;
  categoryId: string;
  price?: number;
  imageUrl?: string;
  specifications?: { [key: string]: string };
  isActive: boolean;
}
