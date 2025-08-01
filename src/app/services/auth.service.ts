import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile, UserCredential } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { 
  Firestore, 
  doc, 
  setDoc, 
  DocumentReference, 
  docData,
  getDoc
} from '@angular/fire/firestore';

// import { getDoc, doc, Firestore } from 'firebase/firestore';
// import { getAuth, onAuthStateChanged, Auth, User } from 'firebase/auth';

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

  async getCurrentUserDataAndDoc(): Promise<any | null> {
  // Return a promise that resolves only once the auth state is known.
  return new Promise((resolve) => {
    // This listener will be called immediately with the current state and then whenever the state changes.
    // We only need the first emission, so we unsubscribe immediately after.
    const unsubscribe = onAuthStateChanged(this.auth, async (user: any | null) => {
      unsubscribe(); // Clean up the listener after the first check

      // If a user is logged in
      if (user) {
        try {
          // Get a reference to the user's document in the 'users' collection
          const userDocRef = doc(this.db, 'users', user.uid);
          
          // Fetch the document data using the native getDoc function, which returns a promise
          const userDocSnap = await getDoc(userDocRef);

          // If the document exists, extract the data
          if (userDocSnap.exists()) {
            const userData:any = userDocSnap.data();
            
            // Combine the data and add the isAdmin flag
            const currentUser = {
              uid: user.uid,
              ...userData,
              isAdmin: userData.role === 'admin'
            };
            resolve(currentUser);
          } else {
            // User is authenticated, but their document does not exist
            resolve(null);
          }
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error);
          resolve(null);
        }
      } else {
        // No user is authenticated
        resolve(null);
      }
    });
  });
}
}
