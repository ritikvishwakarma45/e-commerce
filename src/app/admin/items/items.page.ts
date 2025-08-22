import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonSearchbar,
  IonLabel,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonFab,
  IonFabButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  AlertController,
  ToastController,
  IonButtons,
  IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, 
  createOutline, 
  trashOutline,
  searchOutline,
  refreshOutline,
  arrowBackOutline,
  pricetagOutline
} from 'ionicons/icons';
import { ItemService } from '../../services/item.service';
import { ProductItemService } from '../../services/product-item.service';
import { Item, Category } from '../../models/product.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonLabel,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonGrid,
    IonRow,
    IonCol,
    IonChip,
    IonButtons,
    IonBackButton
  ]
})
export class ItemsPage implements OnInit, OnDestroy {
  items: Item[] = [];
  filteredItems: Item[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  categoryId: string | null = null;
  category: Category | null = null;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private itemService: ItemService,
    private productService: ProductItemService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
      searchOutline,
      refreshOutline,
      arrowBackOutline,
      pricetagOutline
    });
  }

  ngOnInit() {
    this.categoryId = this.route.snapshot.paramMap.get('categoryId');
    if (this.categoryId) {
      this.loadCategory();
      this.loadItemsByCategory();
    } else {
      this.loadAllItems();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadCategory() {
    if (!this.categoryId) return;
    
    const subscription = this.productService.getCategories().subscribe({
      next: (categories) => {
        this.category = categories.find(cat => cat.id === this.categoryId) || null;
      },
      error: (error) => {
        console.error('Error loading category:', error);
      }
    });
    this.subscriptions.add(subscription);
  }

  loadItemsByCategory() {
    if (!this.categoryId) return;
    
    this.isLoading = true;
    const subscription = this.itemService.getItemsByCategory(this.categoryId).subscribe({
      next: (items) => {
        this.items = items;
        this.filteredItems = items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.showToastMessage('Failed to load items', 'danger');
        this.isLoading = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  loadAllItems() {
    this.isLoading = true;
    const subscription = this.itemService.getItemsWithCategories().subscribe({
      next: (items) => {
        this.items = items;
        this.filteredItems = items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.showToastMessage('Failed to load items', 'danger');
        this.isLoading = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  searchItems(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    if (this.searchTerm.trim() === '') {
      this.filteredItems = this.items;
    } else {
      this.filteredItems = this.items.filter(item =>
        item.name.toLowerCase().includes(this.searchTerm) ||
        item.description?.toLowerCase().includes(this.searchTerm) ||
        item.categoryName?.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  async deleteItem(item: Item) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.confirmDelete(item);
          }
        }
      ]
    });

    await alert.present();
  }

  confirmDelete(item: Item) {
    if (!item.id) return;
    
    const subscription = this.itemService.deleteItem(item.id).subscribe({
      next: () => {
        this.showToastMessage('Item deleted successfully', 'success');
        if (this.categoryId) {
          this.loadItemsByCategory();
        } else {
          this.loadAllItems();
        }
      },
      error: (error) => {
        console.error('Error deleting item:', error);
        this.showToastMessage('Failed to delete item', 'danger');
      }
    });
    this.subscriptions.add(subscription);
  }

  editItem(item: Item) {
    this.router.navigate(['/admin/items/edit', item.id]);
  }

  addItem() {
    if (this.categoryId) {
      this.router.navigate(['/admin/items/add'], { 
        queryParams: { categoryId: this.categoryId } 
      });
    } else {
      this.router.navigate(['/admin/items/add']);
    }
  }

  async showToastMessage(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  doRefresh(event: any) {
    if (this.categoryId) {
      this.loadItemsByCategory();
    } else {
      this.loadAllItems();
    }
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  formatPrice(price?: number): string {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getPageTitle(): string {
    if (this.category) {
      return `${this.category.name} Items`;
    }
    return 'All Items';
  }

  getBackUrl(): string {
    if (this.categoryId) {
      return '/admin/categories';
    }
    return '/admin';
  }

  getSpecificationKeys(specifications?: { [key: string]: string }): string[] {
    return specifications ? Object.keys(specifications) : [];
  }

  getSpecificationValue(specifications: { [key: string]: string } | undefined, key: string): string {
    return specifications ? specifications[key] : '';
  }
}
