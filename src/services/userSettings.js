// services/userSettings.js
import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';

// Firestoreのコレクション名
const COLLECTION_NAME = 'userSettings';

// デフォルト設定
const DEFAULT_SETTINGS = {
  friends: [], // フレンドリスト（最大10人）
  defaultSurvivors: ['野良', '野良', '野良'], // デフォルトの3人選択
  createdAt: new Date(),
  updatedAt: new Date()
};

export const userSettingsService = {
  // ユーザー設定を取得
  getUserSettings: async (userId) => {
    try {
      console.log('🔍 ユーザー設定取得開始:', userId);
      
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const settings = docSnap.data();
        console.log('✅ ユーザー設定取得成功:', settings);
        return settings;
      } else {
        // 初回の場合はデフォルト設定を作成
        console.log('📝 初回設定作成中...');
        const newSettings = { 
          ...DEFAULT_SETTINGS, 
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(docRef, newSettings);
        console.log('✅ デフォルト設定作成完了');
        return newSettings;
      }
    } catch (error) {
      console.error('❌ ユーザー設定取得エラー:', error);
      // エラー時はデフォルト設定を返す
      return { ...DEFAULT_SETTINGS, userId };
    }
  },

  // フレンドリストを更新
  updateFriends: async (userId, friends) => {
    try {
      console.log('💾 フレンドリスト更新開始:', { userId, friends });
      
      // 最大10人まで制限
      const limitedFriends = friends.slice(0, 10);
      
      const docRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        friends: limitedFriends,
        updatedAt: new Date()
      });
      
      console.log('✅ フレンドリスト更新完了');
      return { success: true };
    } catch (error) {
      console.error('❌ フレンドリスト更新エラー:', error);
      throw new Error('フレンドリストの更新に失敗しました');
    }
  },

  // デフォルトサバイバー選択を更新
  updateDefaultSurvivors: async (userId, defaultSurvivors) => {
    try {
      console.log('💾 デフォルトサバイバー更新開始:', { userId, defaultSurvivors });
      
      const docRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        defaultSurvivors,
        updatedAt: new Date()
      });
      
      console.log('✅ デフォルトサバイバー更新完了');
      return { success: true };
    } catch (error) {
      console.error('❌ デフォルトサバイバー更新エラー:', error);
      throw new Error('デフォルト設定の更新に失敗しました');
    }
  },

  // 全設定を更新
  updateAllSettings: async (userId, settings) => {
    try {
      console.log('💾 全設定更新開始:', { userId, settings });
      
      const docRef = doc(db, COLLECTION_NAME, userId);
      const updateData = {
        ...settings,
        userId,
        updatedAt: new Date()
      };
      
      await setDoc(docRef, updateData, { merge: true });
      console.log('✅ 全設定更新完了');
      return { success: true };
    } catch (error) {
      console.error('❌ 全設定更新エラー:', error);
      throw new Error('設定の更新に失敗しました');
    }
  }
};