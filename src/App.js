// App.js - ログイン状態永続化版
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import BattleForm from './components/BattleForm';
import StatsDisplay from './components/StatsDisplay';
import FriendSettings from './components/FriendSettings';
import { apiService } from './services/api';
import { userSettingsService } from './services/userSettings';
import { styles, colors } from './styles/commonStyles';

function App() {
  // 認証状態
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // 初期化中フラグ
  
  // ユーザー設定
  const [userSettings, setUserSettings] = useState(null);
  const [showFriendSettings, setShowFriendSettings] = useState(false);
  
  // フォーム状態
  const [battleDate, setBattleDate] = useState("");
  const [killer, setKiller] = useState("");
  const [killerLevel, setKillerLevel] = useState("");
  const [stage, setStage] = useState("");
  const [memo, setMemo] = useState("");
  const [myStatus, setMyStatus] = useState("逃");
  const [others, setOthers] = useState(["野良", "野良", "野良"]); // デフォルトを野良に変更
  const [selfRating, setSelfRating] = useState("B");
  const [othersStatus, setOthersStatus] = useState({ 0: "逃", 1: "逃", 2: "逃" });
  
  // データ状態
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState("today");
  const [killerFilter, setKillerFilter] = useState("");
  const [showStats, setShowStats] = useState(false);

  // 初期化：ローカルストレージからログイン状態を復元
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const savedUser = localStorage.getItem('dbd_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          console.log('💾 保存されたユーザー情報を復元:', userData);
          
          setUser(userData);
          setIsLoggedIn(true);
          
          // データ読み込み
          await Promise.all([
            loadUserResults(userData.uid),
            loadUserSettings(userData.uid)
          ]);
        }
      } catch (error) {
        console.warn('ユーザー情報復元エラー:', error);
        // エラー時は保存データを削除
        localStorage.removeItem('dbd_user');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  // データ読み込み
  const loadUserResults = React.useCallback(async (userId) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const data = await apiService.loadUserResults(userId);
      setResults(data);
      console.log("✅ データ読み込み成功:", data.length, "件");
    } catch (error) {
      console.warn("データ読み込みエラー:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ユーザー設定読み込み
  const loadUserSettings = React.useCallback(async (userId) => {
    try {
      const settings = await userSettingsService.getUserSettings(userId);
      setUserSettings(settings);
      setOthers(settings.defaultSurvivors || ["野良", "野良", "野良"]);
      console.log("✅ ユーザー設定読み込み成功:", settings);
    } catch (error) {
      console.warn("ユーザー設定読み込みエラー:", error);
      // エラー時はデフォルト設定
      setOthers(["野良", "野良", "野良"]);
    }
  }, []);

  // ログイン処理
  const handleLogin = React.useCallback((userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    
    // ローカルストレージに保存
    localStorage.setItem('dbd_user', JSON.stringify(userData));
    console.log('💾 ユーザー情報を保存:', userData);
    
    // 戦績データとユーザー設定を並行して読み込み
    setTimeout(() => {
      Promise.all([
        loadUserResults(userData.uid),
        loadUserSettings(userData.uid)
      ]).catch(err => {
        console.warn("初回データ読み込みに失敗:", err);
      });
    }, 100);
  }, [loadUserResults, loadUserSettings]);

  // ログアウト処理
  const handleLogout = React.useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    setResults([]);
    setUserSettings(null);
    setOthers(["野良", "野良", "野良"]); // リセット
    
    // ローカルストレージからも削除
    localStorage.removeItem('dbd_user');
    console.log('💾 ユーザー情報を削除してログアウト');
  }, []);

  // フレンド設定更新
  const handleSettingsUpdated = React.useCallback((newSettings) => {
    setUserSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
    setOthers(newSettings.defaultSurvivors || ["野良", "野良", "野良"]);
    setShowFriendSettings(false);
  }, []);

  // 戦績追加処理
  const addResult = React.useCallback(async () => {
    if (!battleDate || !killer || !stage || killerLevel === "") {
      alert("必須項目を入力してください");
      return;
    }

    const level = parseInt(killerLevel);
    if (isNaN(level) || level < 0 || level > 50) {
      alert("キラーレベルは0～50で入力してください");
      return;
    }

    const survivorStatus = { 自分: myStatus };
    others.forEach((name, i) => {
      survivorStatus[`枠${i + 1} (${name})`] = othersStatus[i];
    });

    const newResult = {
      battleDate, killer, killerLevel: level, stage, selfRating, memo, survivorStatus,
      timestamp: new Date().toLocaleString(),
      userId: user?.uid || 'anonymous'
    };

    try {
      await apiService.createResult(newResult);
      setMemo("");
      alert("戦績が追加されました！");
      
      // データ再読み込み
      if (user?.uid) {
        loadUserResults(user.uid);
      }
    } catch (error) {
      alert("保存に失敗しました");
    }
  }, [battleDate, killer, killerLevel, stage, selfRating, memo, myStatus, others, othersStatus, user?.uid, loadUserResults]);

  // 全データ削除
  const clearAllData = React.useCallback(async () => {
    if (!window.confirm("本当に全てのデータを削除しますか？")) return;
    
    try {
      await apiService.deleteAllResults(user?.uid);
      setResults([]);
      alert("全データを削除しました");
    } catch (error) {
      alert("削除中にエラーが発生しました");
    }
  }, [user?.uid]);

  // 初期化中の表示
  if (isInitializing) {
    return (
      <div style={{
        ...styles.container,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: colors.primary, fontSize: '1.2rem' }}>🔄 読み込み中...</p>
          <p style={{ color: colors.textMuted }}>ログイン状態を確認しています</p>
        </div>
      </div>
    );
  }

  // ログイン前の表示
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <p style={{ color: colors.primary, margin: 0 }}>
            👤 {user?.type === 'google' ? `${user?.email} (Google)` : user?.email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowFriendSettings(true)}
            style={{
              ...styles.button, 
              backgroundColor: colors.primary, 
              padding: '8px 16px', 
              fontSize: '0.9rem', 
              width: 'auto'
            }}
          >
            ⚙️ フレンド設定
          </button>
          <button 
            onClick={handleLogout} 
            style={{
              ...styles.button, 
              backgroundColor: colors.textDark, 
              padding: '8px 16px', 
              fontSize: '0.9rem', 
              width: 'auto'
            }}
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* トップ画像 */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img 
          src="/top.webp" 
          alt="DBD戦績管理アプリ" 
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            boxShadow: `0 4px 8px rgba(0,0,0,0.3)`
          }}
        />
      </div>

      <h1 style={styles.heading}>DBD戦績管理アプリ</h1>

      {/* フレンド設定が読み込まれているかの表示 */}
      {userSettings && userSettings.friends && userSettings.friends.length > 0 && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '10px', 
          backgroundColor: colors.backgroundLight, 
          borderRadius: '6px',
          fontSize: '0.9rem',
          color: colors.textMuted
        }}>
          👥 登録フレンド: {userSettings.friends.join(', ')}
        </div>
      )}

      {/* 戦績入力フォーム */}
      <BattleForm
        battleDate={battleDate}
        setBattleDate={setBattleDate}
        killer={killer}
        setKiller={setKiller}
        killerLevel={killerLevel}
        setKillerLevel={setKillerLevel}
        stage={stage}
        setStage={setStage}
        selfRating={selfRating}
        setSelfRating={setSelfRating}
        memo={memo}
        setMemo={setMemo}
        myStatus={myStatus}
        setMyStatus={setMyStatus}
        others={others}
        setOthers={setOthers}
        othersStatus={othersStatus}
        setOthersStatus={setOthersStatus}
        onSubmit={addResult}
        userSettings={userSettings} // フレンドリストを渡す
      />

      {/* 統計表示 */}
      <StatsDisplay
        results={results}
        period={period}
        setPeriod={setPeriod}
        killerFilter={killerFilter}
        setKillerFilter={setKillerFilter}
        showStats={showStats}
        setShowStats={setShowStats}
        isLoading={isLoading}
        onClearAllData={clearAllData}
      />

      {/* フレンド設定モーダル */}
      {showFriendSettings && (
        <FriendSettings
          user={user}
          onClose={() => setShowFriendSettings(false)}
          onSettingsUpdated={handleSettingsUpdated}
        />
      )}
    </div>
  );
}

export default App;
