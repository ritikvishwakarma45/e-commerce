import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, updateProfile, UserCredential } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { 
  Firestore, 
  doc, 
  setDoc, 
  DocumentReference 
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root' // This is crucial for tree-shaking and global availability
})
export class AuthService {

  auth = inject(Auth)    // <--- Correctly injecting Auth
  db = inject(Firestore) // <--- Correctly injecting Firestore

  constructor() { }

  // ... (rest of your service methods)
  register(formValue: any): Observable<{ user: any, userData: any }> {
   return new Observable((observer) => {
     createUserWithEmailAndPassword(this.auth, formValue.email, formValue.password)
       .then(async (userCredential: UserCredential) => {
         const user = userCredential.user;
         
         try {
           // Update user profile with display name if provided
           if (formValue.name) {
             await updateProfile(user, {
               displayName: formValue.name
             });
           }
  
           // Prepare user data object for Firestore
           const userData: any = {
             ...formValue,
             uid: user.uid,
           };
           // Remove password and confirmPassword from the data to be stored
           const { password, confirmPassword, ...dataToStore } = { ...formValue, ...userData };
  
           // Save user data to Firestore users collection
           const userDocRef: DocumentReference = doc(this.db, `users/${user.uid}`);
           await setDoc(userDocRef, dataToStore);
  
           console.log('User data saved to Firestore successfully');
           
           observer.next({ user, userData: dataToStore });
           observer.complete();
           
         } catch (firestoreError) {
           console.error('Error saving user data to Firestore:', firestoreError);
           // Even if Firestore fails, we still have the authenticated user
           observer.next({ user, userData: null });
           observer.complete();
         }
         
       })
       .catch((error) => {
         console.error('Authentication error:', error);
         observer.error(error);
       });
   });
  }
}
