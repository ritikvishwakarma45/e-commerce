import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, UserCredential, authState } from '@angular/fire/auth';
import { from, Observable, firstValueFrom } from 'rxjs';
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

  private auth = inject(Auth);
  private db = inject(Firestore);
  private injector = inject(Injector);

  constructor() { }

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
   
            // Use runInInjectionContext for Firestore operations
            const dataToStore = await runInInjectionContext(this.injector, async () => {
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
              return dataToStore;
            });
            
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

  async getCurrentUserData(): Promise<any | null> {
    try {
      // Use authState observable which is properly integrated with Angular's injection context
      const user = await firstValueFrom(authState(this.auth));
      
      // If a user is logged in
      if (user) {
        // Use runInInjectionContext for Firestore operations
        return await runInInjectionContext(this.injector, async () => {
          // Get a reference to the user's document in the 'users' collection
          const userDocRef = doc(this.db, 'users', user.uid);
          
          // Fetch the document data using the native getDoc function, which returns a promise
          const userDocSnap = await getDoc(userDocRef);

          // If the document exists, extract the data
          if (userDocSnap.exists()) {
            const userData: any = userDocSnap.data();
            
            // Combine the data and add the isAdmin flag
            return {
              uid: user.uid,
              ...userData,
              isAdmin: userData.role === 'admin'
            };
          } else {
            // User is authenticated, but their document does not exist
            return null;
          }
        });
      } else {
        // No user is authenticated
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  login(value:any): Observable<UserCredential> {
    // signInWithEmailAndPassword returns a Promise, so we use `from` to convert it to an Observable.
    return from(signInWithEmailAndPassword(this.auth, value.email, value.password));
  }

}
