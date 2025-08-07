// services/api.js - デバッグ版
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

// Firestoreのコレクション名
const COLLECTION_NAME = 'battleResults';

// 戦績関連API
export const battleApi = {
  // 戦績一覧取得（デバッグ版）
  getResults: async (userId = null) => {
    try {
      console.log('🔍 データ取得開始, userId:', userId);
      
      // まずは全データを取得（orderByなし）
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const results = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 ドキュメント:', doc.id, data);
        
        // userIdでフィルタリング（フロントエンド側で）
        if (!userId || data.userId === userId) {
          results.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      console.log('✅ 取得完了:', results.length, '件');
      return results;
      
    } catch (error) {
      console.error('❌ 取得エラー詳細:', error);
      console.error('エラーコード:', error.code);
      console.error('エラーメッセージ:', error.message);
      throw new Error(`戦績の取得に失敗しました: ${error.message}`);
    }
  },

  // 戦績追加
  createResult: async (resultData) => {
    try {
      console.log('💾 保存開始:', resultData);
      
      const docData = {
        ...resultData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
      console.log('✅ 戦績を保存:', docRef.id);
      
      return {
        id: docRef.id,
        ...docData,
        success: true
      };
    } catch (error) {
      console.error('戦績保存エラー:', error);
      throw new Error('戦績の保存に失敗しました');
    }
  },

  // 全戦績削除
  deleteAllResults: async (userId = null) => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const deletePromises = [];
      
      querySnapshot.forEach((document) => {
        const data = document.data();
        if (!userId || data.userId === userId) {
          deletePromises.push(deleteDoc(doc(db, COLLECTION_NAME, document.id)));
        }
      });
      
      await Promise.all(deletePromises);
      console.log('✅ 全戦績を削除:', deletePromises.length, '件');
      
      return { success: true, deletedCount: deletePromises.length };
    } catch (error) {
      console.error('全戦績削除エラー:', error);
      throw new Error('戦績の全削除に失敗しました');
    }
  }
};

// 簡易版API関数（現在のApp.jsで使用中）
export const apiService = {
  loadUserResults: async (userId) => {
    console.log('🚀 loadUserResults 開始, userId:', userId);
    if (!userId) {
      console.log('⚠️ userIdなし');
      return [];
    }
    try {
      const results = await battleApi.getResults(userId);
      console.log('📊 最終結果:', results);
      return results;
    } catch (error) {
      console.warn("データ読み込みエラー:", error);
      return [];
    }
  },

  createResult: async (resultData) => {
    try {
      return await battleApi.createResult(resultData);
    } catch (error) {
      console.warn("データ保存エラー:", error);
      throw error;
    }
  },

  deleteAllResults: async (userId) => {
    try {
      return await battleApi.deleteAllResults(userId);
    } catch (error) {
      console.error("削除エラー:", error);
      throw error;
    }
  }
};

export default battleApi;