import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth } from '../lib/firebase';
import { db, handleFirestoreError, OperationType } from '../lib/firestore';
import { Budget, Goal, Subscription, Transaction, UserProfile } from '../types';

export class CloudSyncService {
  /**
   * Ensure user document exists in Firestore
   */
  static async syncUserProfile(
    userId: string,
    profileData: Partial<UserProfile>,
    email?: string | null,
    phoneNumber?: string | null,
    displayName?: string | null,
    photoURL?: string | null
  ): Promise<UserProfile> {
    if (!auth.currentUser) {
      return {
        ...profileData,
        name: profileData.name || displayName || 'Friend',
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        avatarUrl: photoURL || undefined,
      } as UserProfile;
    }

    const userDocRef = doc(db, 'users', userId);
    try {
      const docSnap = await getDoc(userDocRef);
      const now = new Date().toISOString();

      if (docSnap.exists()) {
        const existing = docSnap.data() as UserProfile;
        // Merge updates
        const merged: UserProfile = {
          ...existing,
          ...profileData,
          name: profileData.name || existing.name || displayName || 'Friend',
          email: email || existing.email || undefined,
          phoneNumber: phoneNumber || existing.phoneNumber || undefined,
          avatarUrl: photoURL || existing.avatarUrl || undefined,
        };
        await updateDoc(userDocRef, {
          ...merged,
          updatedAt: now,
        });
        return merged;
      } else {
        // Create initial profile
        const newProfile: UserProfile = {
          name: displayName || profileData.name || 'Friend',
          email: email || '',
          phoneNumber: phoneNumber || undefined,
          avatarUrl: photoURL || undefined,
          currency: profileData.currency || 'INR',
          currencySymbol: profileData.currencySymbol || '₹',
          monthlyTargetBudget: profileData.monthlyTargetBudget || profileData.monthlyBudget || 30000,
          monthlyIncome: profileData.monthlyIncome || 45000,
          monthlyBudget: profileData.monthlyBudget || 30000,
          savingsTarget: profileData.savingsTarget || 15000,
          savingStreak: profileData.savingStreak || 1,
          lastActiveDate: profileData.lastActiveDate || now.split('T')[0],
          theme: profileData.theme || 'dark',
          darkMode: profileData.darkMode ?? true,
          notificationsEnabled: profileData.notificationsEnabled ?? true,
          language: profileData.language || 'en',
          onboardingCompleted: true,
        };
        await setDoc(userDocRef, {
          ...newProfile,
          uid: userId,
          createdAt: now,
          updatedAt: now,
        });
        return newProfile;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  }

  /**
   * Upload local items to cloud for a new user if cloud is empty
   */
  static async initializeUserDataIfEmpty(
    userId: string,
    localTransactions: Transaction[],
    localBudgets: Budget[],
    localGoals: Goal[],
    localSubscriptions: Subscription[]
  ): Promise<void> {
    if (!auth.currentUser) return;
    const txColRef = collection(db, 'users', userId, 'transactions');
    try {
      const snap = await getDocs(txColRef);
      if (snap.empty && localTransactions.length > 0) {
        // Cloud is empty, seed with initial local data in batch
        const batch = writeBatch(db);

        localTransactions.slice(0, 50).forEach((t) => {
          const ref = doc(db, 'users', userId, 'transactions', t.id);
          batch.set(ref, { ...t, userId });
        });

        localBudgets.forEach((b) => {
          const ref = doc(db, 'users', userId, 'budgets', b.id);
          batch.set(ref, { ...b, userId });
        });

        localGoals.forEach((g) => {
          const ref = doc(db, 'users', userId, 'goals', g.id);
          batch.set(ref, { ...g, userId });
        });

        localSubscriptions.forEach((s) => {
          const ref = doc(db, 'users', userId, 'subscriptions', s.id);
          batch.set(ref, { ...s, userId });
        });

        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/transactions`);
    }
  }

  /**
   * Subscribe to real-time transactions
   */
  static subscribeTransactions(
    userId: string,
    onData: (txs: Transaction[]) => void
  ): () => void {
    if (!auth.currentUser) return () => {};
    const path = `users/${userId}/transactions`;
    const colRef = collection(db, 'users', userId, 'transactions');

    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: Transaction[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as Transaction);
        });
        // Sort descending by date
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  /**
   * Save or update transaction in cloud
   */
  static async saveTransaction(userId: string, tx: Transaction): Promise<void> {
    if (!auth.currentUser) return;
    const path = `users/${userId}/transactions/${tx.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'transactions', tx.id), {
        ...tx,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Delete transaction from cloud
   */
  static async deleteTransaction(userId: string, txId: string): Promise<void> {
    if (!auth.currentUser) return;
    const path = `users/${userId}/transactions/${txId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'transactions', txId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Save or update budget in cloud
   */
  static async saveBudget(userId: string, budget: Budget): Promise<void> {
    if (!auth.currentUser) return;
    const path = `users/${userId}/budgets/${budget.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'budgets', budget.id), {
        ...budget,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Delete budget from cloud
   */
  static async deleteBudget(userId: string, budgetId: string): Promise<void> {
    if (!auth.currentUser) return;
    const path = `users/${userId}/budgets/${budgetId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'budgets', budgetId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Save or update goal in cloud
   */
  static async saveGoal(userId: string, goal: Goal): Promise<void> {
    if (!auth.currentUser) return;
    const path = `users/${userId}/goals/${goal.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'goals', goal.id), {
        ...goal,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Delete goal from cloud
   */
  static async deleteGoal(userId: string, goalId: string): Promise<void> {
    if (!auth.currentUser) return;
    const path = `users/${userId}/goals/${goalId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'goals', goalId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Save subscription in cloud
   */
  static async saveSubscription(userId: string, sub: Subscription): Promise<void> {
    if (!auth.currentUser) return;
    const path = `users/${userId}/subscriptions/${sub.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'subscriptions', sub.id), {
        ...sub,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Delete subscription from cloud
   */
  static async deleteSubscription(userId: string, subId: string): Promise<void> {
    if (!auth.currentUser) return;
    const path = `users/${userId}/subscriptions/${subId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'subscriptions', subId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}
