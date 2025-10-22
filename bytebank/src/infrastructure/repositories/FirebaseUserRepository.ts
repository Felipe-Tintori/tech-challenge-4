import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth, db } from '../../services/firebaseConfig';
import { User, AuthCredentials, RegisterData } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { AsyncStorageKeys } from '../../enum/asyncStorage';

export class FirebaseUserRepository implements IUserRepository {
  
  async login(credentials: AuthCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Busca dados adicionais do Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();
      
      // Cria entidade de domínio
      const user = new User(
        firebaseUser.uid,
        userData?.name || firebaseUser.displayName || '',
        firebaseUser.email || '',
        userData?.profileImage || firebaseUser.photoURL || undefined,
        userData?.createdAt?.toDate() || new Date(),
        userData?.updatedAt?.toDate() || new Date()
      );
      
      return user;
    } catch (error: any) {
      throw error; // Será tratado pelo UseCase
    }
  }

  async register(data: RegisterData): Promise<User> {
    try {
      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Cria entidade de domínio
      const user = new User(
        firebaseUser.uid,
        data.name,
        data.email
      );
      
      // Salva dados adicionais no Firestore
      const userData: any = {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      // Só adiciona profileImage se não for undefined
      if (user.profileImage !== undefined) {
        userData.profileImage = user.profileImage;
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      return user;
    } catch (error: any) {
      throw error; // Será tratado pelo UseCase
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        
        if (!firebaseUser) {
          resolve(null);
          return;
        }

        try {
          // Busca dados adicionais do Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          
          const user = new User(
            firebaseUser.uid,
            userData?.name || firebaseUser.displayName || '',
            firebaseUser.email || '',
            userData?.profileImage || firebaseUser.photoURL || undefined,
            userData?.createdAt?.toDate() || new Date(),
            userData?.updatedAt?.toDate() || new Date()
          );
          
          resolve(user);
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          resolve(null);
        }
      });
    });
  }

  async loadUserFromStorage(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(AsyncStorageKeys.USER_DATA);
      
      if (!userData) {
        return null;
      }

      const parsed = JSON.parse(userData);
      
      return new User(
        parsed.id,
        parsed.name,
        parsed.email,
        parsed.profileImage,
        new Date(parsed.createdAt),
        new Date(parsed.updatedAt)
      );
    } catch (error) {
      console.error('Erro ao carregar usuário do storage:', error);
      return null;
    }
  }

  async saveUserToStorage(user: User): Promise<void> {
    try {
      const userData = JSON.stringify(user.toPlainObject());
      await AsyncStorage.setItem(AsyncStorageKeys.USER_DATA, userData);
      
      // Salva token se disponível
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        await AsyncStorage.setItem(AsyncStorageKeys.FIREBASE_TOKEN, token);
      }
    } catch (error) {
      console.error('Erro ao salvar usuário no storage:', error);
      throw error;
    }
  }

  async removeUserFromStorage(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        AsyncStorageKeys.USER_DATA,
        AsyncStorageKeys.FIREBASE_TOKEN
      ]);
    } catch (error) {
      console.error('Erro ao remover usuário do storage:', error);
      throw error;
    }
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, 'users', userId), updateData);
      
      // Busca dados atualizados
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('Usuário não encontrado após atualização');
      }
      
      return new User(
        userId,
        userData.name,
        userData.email,
        userData.profileImage,
        userData.createdAt?.toDate(),
        userData.updatedAt?.toDate()
      );
    } catch (error: any) {
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // Deleta documento do Firestore
      await deleteDoc(doc(db, 'users', userId));
      
      // Deleta usuário do Firebase Auth
      if (auth.currentUser && auth.currentUser.uid === userId) {
        await auth.currentUser.delete();
      }
    } catch (error: any) {
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(!!user);
      });
    });
  }

  async getAuthToken(): Promise<string | null> {
    try {
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
      
      // Tenta buscar do storage
      return await AsyncStorage.getItem(AsyncStorageKeys.FIREBASE_TOKEN);
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }
}