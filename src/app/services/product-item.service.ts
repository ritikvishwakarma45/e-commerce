import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  where,
  DocumentReference,
  CollectionReference
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, throwError, combineLatest } from 'rxjs';
import { Product, Category, ProductFormData, Item } from '../models/product.model';
import { ItemService } from './item.service';

@Injectable({
  providedIn: 'root'
})
export class ProductItemService {
  private productsCollection: CollectionReference;
  private categoriesCollection: CollectionReference;

  constructor(private firestore: Firestore, private itemService: ItemService) {
    this.productsCollection = collection(this.firestore, 'products');
    this.categoriesCollection = collection(this.firestore, 'categories');
  }

  // Product CRUD Operations
  addProduct(productData: ProductFormData): Observable<string> {
    const product: Omit<Product, 'id'> = {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return from(addDoc(this.productsCollection, product)).pipe(
      map((docRef: DocumentReference) => docRef.id),
      catchError(error => {
        console.error('Error adding product:', error);
        return throwError(() => new Error('Failed to add product. Please try again.'));
      })
    );
  }

  editProduct(id: string, productData: Partial<ProductFormData>): Observable<void> {
    const productDoc = doc(this.firestore, 'products', id);
    const updateData = {
      ...productData,
      updatedAt: new Date()
    };

    return from(updateDoc(productDoc, updateData)).pipe(
      catchError(error => {
        console.error('Error updating product:', error);
        return throwError(() => new Error('Failed to update product. Please try again.'));
      })
    );
  }

  deleteProduct(id: string): Observable<void> {
    const productDoc = doc(this.firestore, 'products', id);
    
    return from(deleteDoc(productDoc)).pipe(
      catchError(error => {
        console.error('Error deleting product:', error);
        return throwError(() => new Error('Failed to delete product. Please try again.'));
      })
    );
  }

  getProducts(): Observable<Product[]> {
    const productsQuery = query(this.productsCollection, orderBy('createdAt', 'desc'));
    
    return from(getDocs(productsQuery)).pipe(
      map(snapshot => {
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        return products;
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        return throwError(() => new Error('Failed to fetch products. Please try again.'));
      })
    );
  }

  getProductsWithCategories(): Observable<Product[]> {
    return combineLatest([
      this.getProducts(),
      this.getCategories()
    ]).pipe(
      map(([products, categories]) => {
        return products.map(product => {
          const category = categories.find(cat => cat.id === product.categoryId);
          return {
            ...product,
            categoryName: category?.name || 'Uncategorized'
          };
        });
      }),
      catchError(error => {
        console.error('Error fetching products with categories:', error);
        return throwError(() => new Error('Failed to fetch products with categories.'));
      })
    );
  }

  getProductsWithCategoriesAndItems(): Observable<Product[]> {
    return combineLatest([
      this.getProducts(),
      this.getCategories(),
      this.itemService.getAllItems()
    ]).pipe(
      map(([products, categories, items]) => {
        return products.map(product => {
          const category = categories.find(cat => cat.id === product.categoryId);
          const productItems = product.itemIds ? 
            items.filter(item => product.itemIds!.includes(item.id!)) : [];
          
          return {
            ...product,
            categoryName: category?.name || 'Uncategorized',
            items: productItems
          };
        });
      }),
      catchError(error => {
        console.error('Error fetching products with categories and items:', error);
        return throwError(() => new Error('Failed to fetch products with categories and items.'));
      })
    );
  }

  getProductById(id: string): Observable<Product | null> {
    const productDoc = doc(this.firestore, 'products', id);
    
    return from(getDoc(productDoc)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Product;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching product:', error);
        return throwError(() => new Error('Failed to fetch product details.'));
      })
    );
  }

  // Category CRUD Operations
  addCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Observable<string> {
    const category: Omit<Category, 'id'> = {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return from(addDoc(this.categoriesCollection, category)).pipe(
      map((docRef: DocumentReference) => docRef.id),
      catchError(error => {
        console.error('Error adding category:', error);
        return throwError(() => new Error('Failed to add category. Please try again.'));
      })
    );
  }

  getCategories(): Observable<Category[]> {
    const categoriesQuery = query(this.categoriesCollection, orderBy('name', 'asc'));
    
    return from(getDocs(categoriesQuery)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Category));
      }),
      catchError(error => {
        console.error('Error fetching categories:', error);
        return throwError(() => new Error('Failed to fetch categories. Please try again.'));
      })
    );
  }

  getActiveCategories(): Observable<Category[]> {
    const activeCategoriesQuery = query(
      this.categoriesCollection, 
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    
    return from(getDocs(activeCategoriesQuery)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Category));
      }),
      catchError(error => {
        console.error('Error fetching active categories:', error);
        return throwError(() => new Error('Failed to fetch categories.'));
      })
    );
  }

  updateCategory(id: string, categoryData: Partial<Category>): Observable<void> {
    const categoryDoc = doc(this.firestore, 'categories', id);
    const updateData = {
      ...categoryData,
      updatedAt: new Date()
    };

    return from(updateDoc(categoryDoc, updateData)).pipe(
      catchError(error => {
        console.error('Error updating category:', error);
        return throwError(() => new Error('Failed to update category. Please try again.'));
      })
    );
  }

  deleteCategory(id: string): Observable<void> {
    const categoryDoc = doc(this.firestore, 'categories', id);
    
    return from(deleteDoc(categoryDoc)).pipe(
      catchError(error => {
        console.error('Error deleting category:', error);
        return throwError(() => new Error('Failed to delete category. Please try again.'));
      })
    );
  }

  // Utility methods
  getProductsByCategory(categoryId: string): Observable<Product[]> {
    const productsByCategoryQuery = query(
      this.productsCollection,
      where('categoryId', '==', categoryId),
      orderBy('name', 'asc')
    );
    
    return from(getDocs(productsByCategoryQuery)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
      }),
      catchError(error => {
        console.error('Error fetching products by category:', error);
        return throwError(() => new Error('Failed to fetch products by category.'));
      })
    );
  }
}
