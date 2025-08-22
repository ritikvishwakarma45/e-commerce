import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonSpinner,
  IonToast,
  ToastController,
  IonButtons,
  IonBackButton,
  IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  saveOutline, 
  closeOutline,
  arrowBackOutline,
  imageOutline
} from 'ionicons/icons';
import { ProductItemService } from '../../../services/product-item.service';
import { ItemService } from '../../../services/item.service';
import { Product, Category, ProductFormData, Item } from '../../../models/product.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.page.html',
  styleUrls: ['./product-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonSpinner,
    IonButtons,
    IonBackButton,
    IonNote
  ]
})
export class ProductFormPage implements OnInit, OnDestroy {
  productForm: FormGroup;
  categories: Category[] = [];
  availableItems: Item[] = [];
  isEditMode: boolean = false;
  productId: string | null = null;
  isLoading: boolean = false;
  isSaving: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: string = 'success';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private productService: ProductItemService,
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {
    addIcons({
      saveOutline,
      closeOutline,
      arrowBackOutline,
      imageOutline
    });

    this.productForm = this.createForm();
  }

  ngOnInit() {
    this.loadCategories();
    this.checkEditMode();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      imageUrl: [''],
      itemIds: [[]],
      isActive: [true]
    });
  }

  loadCategories() {
    const subscription = this.productService.getActiveCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadAvailableItems();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showToastMessage('Failed to load categories', 'danger');
      }
    });
    this.subscriptions.add(subscription);
  }

  loadAvailableItems() {
    const subscription = this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.availableItems = items.filter(item => item.isActive);
      },
      error: (error) => {
        console.error('Error loading items:', error);
      }
    });
    this.subscriptions.add(subscription);
  }

  onCategoryChange() {
    const categoryId = this.productForm.get('categoryId')?.value;
    if (categoryId) {
      const subscription = this.itemService.getItemsByCategory(categoryId).subscribe({
        next: (items) => {
          this.availableItems = items.filter(item => item.isActive);
        },
        error: (error) => {
          console.error('Error loading category items:', error);
        }
      });
      this.subscriptions.add(subscription);
    }
  }

  checkEditMode() {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct();
    }
  }

  loadProduct() {
    if (!this.productId) return;
    
    this.isLoading = true;
    const subscription = this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        if (product) {
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl || '',
            stock: product.stock,
            sku: product.sku,
            isActive: product.isActive
          });
        } else {
          this.showToastMessage('Product not found', 'danger');
          this.router.navigate(['/admin/products']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.showToastMessage('Failed to load product', 'danger');
        this.isLoading = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  async onSubmit() {
    if (this.productForm.valid) {
      this.isSaving = true;
      const formData: ProductFormData = this.productForm.value;

      if (this.isEditMode && this.productId) {
        this.updateProduct(formData);
      } else {
        this.createProduct(formData);
      }
    } else {
      this.markFormGroupTouched();
      this.showToastMessage('Please fix the form errors', 'warning');
    }
  }

  createProduct(formData: ProductFormData) {
    const subscription = this.productService.addProduct(formData).subscribe({
      next: (productId) => {
        this.showToastMessage('Product created successfully', 'success');
        this.isSaving = false;
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.showToastMessage(error.message || 'Failed to create product', 'danger');
        this.isSaving = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  updateProduct(formData: ProductFormData) {
    if (!this.productId) return;

    const subscription = this.productService.editProduct(this.productId, formData).subscribe({
      next: () => {
        this.showToastMessage('Product updated successfully', 'success');
        this.isSaving = false;
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.showToastMessage(error.message || 'Failed to update product', 'danger');
        this.isSaving = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  markFormGroupTouched() {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} is too short`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} is too long`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be greater than ${field.errors['min'].min}`;
      if (field.errors['max']) return `${this.getFieldLabel(fieldName)} must be less than ${field.errors['max'].max}`;
      if (field.errors['pattern']) return `Please enter a valid ${this.getFieldLabel(fieldName).toLowerCase()}`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Product Name',
      description: 'Description',
      price: 'Price',
      categoryId: 'Category',
      imageUrl: 'Image URL',
      stock: 'Stock',
      sku: 'SKU'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
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

  cancel() {
    this.router.navigate(['/admin/products']);
  }

  generateSKU() {
    const name = this.productForm.get('name')?.value || '';
    const timestamp = Date.now().toString().slice(-6);
    const sku = name.substring(0, 3).toUpperCase() + timestamp;
    this.productForm.patchValue({ sku });
  }
}
