import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonInput,
  IonTextarea,
  IonCheckbox,
  IonBadge,
  IonFab,
  IonFabButton,
  IonModal,
  IonSpinner,
  IonToast,
  AlertController,
  ToastController,
  IonButtons,
  IonBackButton,
  ModalController,
  IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, 
  createOutline, 
  trashOutline,
  saveOutline,
  closeOutline,
  arrowBackOutline,
  listOutline
} from 'ionicons/icons';
import { ProductItemService } from '../../services/product-item.service';
import { ItemService } from '../../services/item.service';
import { Category } from '../../models/product.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonInput,
    IonTextarea,
    IonCheckbox,
    IonBadge,
    IonFab,
    IonFabButton,
    IonModal,
    IonSpinner,
    IonButtons,
    IonBackButton,
    IonNote
  ]
})
export class CategoriesPage implements OnInit, OnDestroy {
  categories: Category[] = [];
  categoryForm: FormGroup;
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  editingCategoryId: string | null = null;
  isSaving: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private productService: ProductItemService,
    private itemService: ItemService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
      saveOutline,
      closeOutline,
      arrowBackOutline,
      listOutline
    });

    this.categoryForm = this.createForm();
  }

  ngOnInit() {
    this.loadCategories();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(200)]],
      isActive: [true]
    });
  }

  loadCategories() {
    this.isLoading = true;
    const subscription = this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadItemCounts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showToastMessage('Failed to load categories', 'danger');
        this.isLoading = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  loadItemCounts() {
    this.categories.forEach(category => {
      if (category.id) {
        const subscription = this.itemService.getItemsByCategory(category.id).subscribe({
          next: (items) => {
            category.itemCount = items.length;
          },
          error: (error) => {
            console.error('Error loading item count for category:', error);
          }
        });
        this.subscriptions.add(subscription);
      }
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.editingCategoryId = null;
    this.categoryForm.reset({ isActive: true });
    this.isModalOpen = true;
  }

  openEditModal(category: Category) {
    this.isEditMode = true;
    this.editingCategoryId = category.id || null;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.categoryForm.reset();
    this.isEditMode = false;
    this.editingCategoryId = null;
  }

  async onSubmit() {
    if (this.categoryForm.valid) {
      this.isSaving = true;
      const formData = this.categoryForm.value;

      if (this.isEditMode && this.editingCategoryId) {
        this.updateCategory(formData);
      } else {
        this.createCategory(formData);
      }
    } else {
      this.markFormGroupTouched();
      this.showToastMessage('Please fix the form errors', 'warning');
    }
  }

  createCategory(formData: any) {
    const subscription = this.productService.addCategory(formData).subscribe({
      next: (categoryId) => {
        this.showToastMessage('Category created successfully', 'success');
        this.isSaving = false;
        this.closeModal();
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.showToastMessage(error.message || 'Failed to create category', 'danger');
        this.isSaving = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  updateCategory(formData: any) {
    if (!this.editingCategoryId) return;

    const subscription = this.productService.updateCategory(this.editingCategoryId, formData).subscribe({
      next: () => {
        this.showToastMessage('Category updated successfully', 'success');
        this.isSaving = false;
        this.closeModal();
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.showToastMessage(error.message || 'Failed to update category', 'danger');
        this.isSaving = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  async deleteCategory(category: Category) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.confirmDelete(category);
          }
        }
      ]
    });

    await alert.present();
  }

  confirmDelete(category: Category) {
    if (!category.id) return;
    
    const subscription = this.productService.deleteCategory(category.id).subscribe({
      next: () => {
        this.showToastMessage('Category deleted successfully', 'success');
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.showToastMessage('Failed to delete category', 'danger');
      }
    });
    this.subscriptions.add(subscription);
  }

  markFormGroupTouched() {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} is too short`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} is too long`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Category Name',
      description: 'Description'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
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

  viewCategoryItems(category: Category) {
    if (category.id) {
      this.router.navigate(['/admin/items/category', category.id]);
    }
  }

  addItemToCategory(category: Category) {
    if (category.id) {
      this.router.navigate(['/admin/items/add'], { 
        queryParams: { categoryId: category.id } 
      });
    }
  }
}
