import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  arrowBackOutline
} from 'ionicons/icons';
import { ProductItemService } from '../../services/product-item.service';
import { Product, Item } from '../../models/product.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
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
export class ProductsPage implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  showAlert: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: string = 'success';
  productToDelete: Product | null = null;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private productService: ProductItemService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
      searchOutline,
      refreshOutline,
      arrowBackOutline
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadProducts() {
    this.isLoading = true;
    const subscription = this.productService.getProductsWithCategoriesAndItems().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...products];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.showToastMessage('Failed to load products', 'danger');
        this.isLoading = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  searchProducts(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    if (this.searchTerm.trim() === '') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm) ||
        product.description.toLowerCase().includes(this.searchTerm) ||
        product.categoryName?.toLowerCase().includes(this.searchTerm) ||
        product.sku.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  async deleteProduct(product: Product) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.confirmDelete(product);
          }
        },
        {
          text: 'Edit',
          handler: () => {
            this.editProduct(product);
          }
        }
      ]
    });

    await alert.present();
  }

  confirmDelete(product: Product) {
    if (!product.id) return;
    
    const subscription = this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.showToastMessage('Product deleted successfully', 'success');
        this.loadProducts(); // Reload the list
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.showToastMessage('Failed to delete product', 'danger');
      }
    });
    this.subscriptions.add(subscription);
  }

  editProduct(product: Product) {
    this.router.navigate(['/admin/products/edit', product.id]);
  }

  addProduct() {
    this.router.navigate(['/admin/products/add']);
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
    this.loadProducts();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getStockColor(stock: number): string {
    if (stock === 0) return 'danger';
    if (stock < 10) return 'warning';
    return 'success';
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}
