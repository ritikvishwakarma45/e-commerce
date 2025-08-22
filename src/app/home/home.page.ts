import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, FormsModule],
})
export class HomePage {
  // authService = inject(AuthService)
  // router = inject(Router)
  
  selectedCategory: string = 'honey';

  constructor() {}

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
