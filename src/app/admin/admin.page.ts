import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  addOutline, 
  peopleOutline, 
  bagOutline, 
  pricetagsOutline,
  statsChartOutline,
  settingsOutline,
  cubeOutline,
  listOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonFab,
    IonFabButton
  ]
})
export class AdminPage implements OnInit {

  constructor(private router: Router) {
    addIcons({
      addOutline,
      peopleOutline,
      bagOutline,
      pricetagsOutline,
      statsChartOutline,
      settingsOutline,
      cubeOutline,
      listOutline
    });
  }

  ngOnInit() {}

  navigateToProducts() {
    this.router.navigate(['/admin/products']);
  }

  navigateToCategories() {
    this.router.navigate(['/admin/categories']);
  }

  navigateToAddProduct() {
    this.router.navigate(['/admin/products/add']);
  }

  navigateToAddItem() {
    this.router.navigate(['/admin/items/add']);
  }

  navigateToItems() {
    this.router.navigate(['/admin/items']);
  }
}
