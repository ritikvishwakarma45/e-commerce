import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage {
  // authService = inject(AuthService)
  // router = inject(Router)
  
  selectedCategory: string = 'honey';

  featuredProducts = [
    {
      id: 1,
      name: 'Premium Wildflower Honey',
      price: '$24.99',
      originalPrice: '$29.99',
      image: 'assets/products/wildflower-honey.jpg',
      rating: 4.8,
      discount: '17% OFF',
      badge: 'BESTSELLER'
    },
    {
      id: 2,
      name: 'Organic Manuka Honey',
      price: '$45.99',
      originalPrice: '$55.99',
      image: 'assets/products/manuka-honey.jpg',
      rating: 4.9,
      discount: '18% OFF',
      badge: 'PREMIUM'
    },
    {
      id: 3,
      name: 'Raw Acacia Honey',
      price: '$19.99',
      originalPrice: '$24.99',
      image: 'assets/products/acacia-honey.jpg',
      rating: 4.7,
      discount: '20% OFF',
      badge: 'ORGANIC'
    },
    {
      id: 4,
      name: 'Honey Gift Set',
      price: '$39.99',
      originalPrice: '$49.99',
      image: 'assets/products/honey-gift-set.jpg',
      rating: 4.6,
      discount: '20% OFF',
      badge: 'GIFT SET'
    }
  ];

  constructor() {
    register();
  }

  ngOnInit(){
    // this.authService.getCurrentUserData().then(user=>{
    //   if(!user) this.router.navigate(['/login'])
        
    // })
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    console.log('Selected category:', this.selectedCategory);
    // Add logic here to filter products based on selected category
  }
}
