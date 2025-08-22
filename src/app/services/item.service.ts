import { inject, Injectable } from '@angular/core';
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
import { Item, ItemFormData } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private firestore = inject(Firestore);
  private itemsCollection = collection(this.firestore, 'items');
  private categoriesCollection = collection(this.firestore, 'categories');

  constructor() {
    // Constructor is now empty since we're using inject() at class level
  }

  // Item CRUD Operations
  addItem(itemData: ItemFormData, categoryId: string): Observable<string> {
    const item: Omit<Item, 'id'> = {
      ...itemData,
      categoryId: categoryId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return from(addDoc(this.itemsCollection, item)).pipe(
      map((docRef: DocumentReference) => docRef.id),
      catchError(error => {
        console.error('Error adding item:', error);
        return throwError(() => new Error('Failed to add item. Please try again.'));
      })
    );
  }

  editItem(id: string, itemData: Partial<ItemFormData>): Observable<void> {
    const itemDoc = doc(this.firestore, 'items', id);
    const updateData = {
      ...itemData,
      updatedAt: new Date()
    };

    return from(updateDoc(itemDoc, updateData)).pipe(
      catchError(error => {
        console.error('Error updating item:', error);
        return throwError(() => new Error('Failed to update item. Please try again.'));
      })
    );
  }

  deleteItem(id: string): Observable<void> {
    const itemDoc = doc(this.firestore, 'items', id);
    
    return from(deleteDoc(itemDoc)).pipe(
      catchError(error => {
        console.error('Error deleting item:', error);
        return throwError(() => new Error('Failed to delete item. Please try again.'));
      })
    );
  }

  getItemsByCategory(categoryId: string): Observable<Item[]> {
    const itemsByCategoryQuery = query(
      this.itemsCollection,
      where('categoryId', '==', categoryId),
      orderBy('name', 'asc')
    );
    
    return from(getDocs(itemsByCategoryQuery)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Item));
      }),
      catchError(error => {
        console.error('Error fetching items by category:', error);
        return throwError(() => new Error('Failed to fetch items by category.'));
      })
    );
  }

  getAllItems(): Observable<Item[]> {
    const itemsQuery = query(this.itemsCollection, orderBy('createdAt', 'desc'));
    
    return from(getDocs(itemsQuery)).pipe(
      map(snapshot => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Item));
        return items;
      }),
      catchError(error => {
        console.error('Error fetching items:', error);
        return throwError(() => new Error('Failed to fetch items. Please try again.'));
      })
    );
  }

  getItemsWithCategories(): Observable<Item[]> {
    return combineLatest([
      this.getAllItems(),
      this.getCategories()
    ]).pipe(
      map(([items, categories]) => {
        return items.map(item => {
          const category = categories.find(cat => cat.id === item.categoryId);
          return {
            ...item,
            categoryName: category?.name || 'Uncategorized'
          };
        });
      }),
      catchError(error => {
        console.error('Error fetching items with categories:', error);
        return throwError(() => new Error('Failed to fetch items with categories.'));
      })
    );
  }

  getItemById(id: string): Observable<Item | null> {
    const itemDoc = doc(this.firestore, 'items', id);
    
    return from(getDoc(itemDoc)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Item;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching item:', error);
        return throwError(() => new Error('Failed to fetch item details.'));
      })
    );
  }

  getActiveItemsByCategory(categoryId: string): Observable<Item[]> {
    const activeItemsQuery = query(
      this.itemsCollection,
      where('categoryId', '==', categoryId),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    
    return from(getDocs(activeItemsQuery)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Item));
      }),
      catchError(error => {
        console.error('Error fetching active items by category:', error);
        return throwError(() => new Error('Failed to fetch active items.'));
      })
    );
  }

  getItemsByIds(itemIds: string[]): Observable<Item[]> {
    if (!itemIds || itemIds.length === 0) {
      return from([[]]);
    }

    const itemPromises = itemIds.map(id => {
      const itemDoc = doc(this.firestore, 'items', id);
      return getDoc(itemDoc);
    });

    return from(Promise.all(itemPromises)).pipe(
      map(snapshots => {
        return snapshots
          .filter(snap => snap.exists())
          .map(snap => ({ id: snap.id, ...snap.data() } as Item));
      }),
      catchError(error => {
        console.error('Error fetching items by IDs:', error);
        return throwError(() => new Error('Failed to fetch items.'));
      })
    );
  }

  // Helper method to get categories (used internally)
  private getCategories(): Observable<any[]> {
    const categoriesQuery = query(this.categoriesCollection, orderBy('name', 'asc'));
    
    return from(getDocs(categoriesQuery)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      })
    );
  }

  // Search items
  searchItems(searchTerm: string): Observable<Item[]> {
    return this.getItemsWithCategories().pipe(
      map(items => {
        const term = searchTerm.toLowerCase();
        return items.filter(item =>
          item.name.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.categoryName?.toLowerCase().includes(term)
        );
      })
    );
  }
}
