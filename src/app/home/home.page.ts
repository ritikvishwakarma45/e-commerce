import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {
  authService = inject(AuthService)
  router = inject(Router)


  constructor() {}

  ngOnInit(){
    this.authService.getCurrentUserData().then(user=>{
      if(!user) this.router.navigate(['/login'])
        
    })
  }
}
