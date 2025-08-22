import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
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
  ToastController,
  IonButtons,
  IonBackButton,
  IonNote,
  IonList
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  saveOutline, 
  closeOutline,
  arrowBackOutline,
  imageOutline,
  addOutline,
  trashOutline
} from 'ionicons/icons';
import { ItemService } from '../../../services/item.service';
import { ProductItemService } from '../../../services/product-item.service';
import { Item, Category, ItemFormData } from '../../../models/product.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.page.html',
  styleUrls: ['./item-form.page.scss'],
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
    IonNote,
    IonList
  ]
})
export class ItemFormPage implements OnInit, OnDestroy {
  itemForm: FormGroup;
  categories: Category[] = [];
  isEditMode: boolean = false;
  itemId: string | null = null;
  isLoading: boolean = false;
  isSaving: boolean = false;
  preselectedCategoryId: string | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private productService: ProductItemService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {
    addIcons({
      saveOutline,
      closeOutline,
      arrowBackOutline,
      imageOutline,
      addOutline,
      trashOutline
    });

    this.itemForm = this.createForm();
  }

  ngOnInit() {
    this.loadCategories();
    this.checkEditMode();
    this.checkPreselectedCategory();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      categoryId: ['', [Validators.required]],
      price: [null, [Validators.min(0.01), Validators.max(999999)]],
      imageUrl: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)]],
      isActive: [true],
      specifications: this.fb.array([])
    });
  }

  get specificationsArray(): FormArray {
    return this.itemForm.get('specifications') as FormArray;
  }

  createSpecificationGroup(): FormGroup {
    return this.fb.group({
      key: ['', [Validators.required, Validators.minLength(1)]],
      value: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  addSpecification() {
    this.specificationsArray.push(this.createSpecificationGroup());
  }

  removeSpecification(index: number) {
    this.specificationsArray.removeAt(index);
  }

  loadCategories() {
    const subscription = this.productService.getActiveCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        if (this.preselectedCategoryId) {
          this.itemForm.patchValue({ categoryId: this.preselectedCategoryId });
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showToastMessage('Failed to load categories', 'danger');
      }
    });
    this.subscriptions.add(subscription);
  }

  checkPreselectedCategory() {
    this.preselectedCategoryId = this.route.snapshot.queryParamMap.get('categoryId');
  }

  checkEditMode() {
    this.itemId = this.route.snapshot.paramMap.get('id');
    if (this.itemId) {
      this.isEditMode = true;
      this.loadItem();
    }
  }

  loadItem() {
    if (!this.itemId) return;
    
    this.isLoading = true;
    const subscription = this.itemService.getItemById(this.itemId).subscribe({
      next: (item) => {
        if (item) {
          this.itemForm.patchValue({
            name: item.name,
            description: item.description || '',
            categoryId: item.categoryId,
            price: item.price || null,
            imageUrl: item.imageUrl || '',
            isActive: item.isActive
          });

          // Load specifications
          if (item.specifications) {
            Object.entries(item.specifications).forEach(([key, value]) => {
              const specGroup = this.createSpecificationGroup();
              specGroup.patchValue({ key, value });
              this.specificationsArray.push(specGroup);
            });
          }
        } else {
          this.showToastMessage('Item not found', 'danger');
          this.router.navigate(['/admin/items']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading item:', error);
        this.showToastMessage('Failed to load item', 'danger');
        this.isLoading = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  async onSubmit() {
    if (this.itemForm.valid) {
      this.isSaving = true;
      const formData = this.prepareFormData();

      if (this.isEditMode && this.itemId) {
        this.updateItem(formData);
      } else {
        this.createItem(formData);
      }
    } else {
      this.markFormGroupTouched();
      this.showToastMessage('Please fix the form errors', 'warning');
    }
  }

  prepareFormData(): ItemFormData {
    const formValue = this.itemForm.value;
    
    // Convert specifications array to object
    const specifications: { [key: string]: string } = {};
    if (formValue.specifications && formValue.specifications.length > 0) {
      formValue.specifications.forEach((spec: any) => {
        if (spec.key && spec.value) {
          specifications[spec.key] = spec.value;
        }
      });
    }

    return {
      name: formValue.name,
      description: formValue.description || undefined,
      categoryId: formValue.categoryId,
      price: formValue.price || undefined,
      imageUrl: formValue.imageUrl || undefined,
      specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
      isActive: formValue.isActive
    };
  }

  createItem(formData: ItemFormData) {
    const subscription = this.itemService.addItem(formData, formData.categoryId).subscribe({
      next: (itemId) => {
        this.showToastMessage('Item created successfully', 'success');
        this.isSaving = false;
        this.navigateBack();
      },
      error: (error) => {
        console.error('Error creating item:', error);
        this.showToastMessage(error.message || 'Failed to create item', 'danger');
        this.isSaving = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  updateItem(formData: ItemFormData) {
    if (!this.itemId) return;

    const subscription = this.itemService.editItem(this.itemId, formData).subscribe({
      next: () => {
        this.showToastMessage('Item updated successfully', 'success');
        this.isSaving = false;
        this.navigateBack();
      },
      error: (error) => {
        console.error('Error updating item:', error);
        this.showToastMessage(error.message || 'Failed to update item', 'danger');
        this.isSaving = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  markFormGroupTouched() {
    Object.keys(this.itemForm.controls).forEach(key => {
      const control = this.itemForm.get(key);
      control?.markAsTouched();
    });

    // Mark specification controls as touched
    (this.specificationsArray as FormArray).controls.forEach(group => {
      Object.keys((group as FormGroup).controls).forEach(key => {
        group.get(key)?.markAsTouched();
      });
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.itemForm.get(fieldName);
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
      name: 'Item Name',
      description: 'Description',
      categoryId: 'Category',
      price: 'Price',
      imageUrl: 'Image URL'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.itemForm.get(fieldName);
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
    this.navigateBack();
  }

  navigateBack() {
    if (this.preselectedCategoryId) {
      this.router.navigate(['/admin/items/category', this.preselectedCategoryId]);
    } else {
      this.router.navigate(['/admin/items']);
    }
  }
}
