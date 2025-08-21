// components/LoginScreen.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInAnonymously
} from 'firebase/auth';
import { colors } from '../styles/commonStyles';

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      const user = userCredential.user;
      onLogin({ 
        email: user.email, 
        uid: user.uid, 
        isAnonymous: false,
        type: isSignUp ? 'signup' : 'login' 
      });
    } catch (error) {
      console.error('認証エラー:', error);
      setError(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // ポップアップがブロックされる場合に備えてリダイレクト方式も考慮
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      onLogin({
        email: user.email,
        uid: user.uid,
        isAnonymous: false,
        type: 'google'
      });
    } catch (error) {
      console.error('Google認証エラー:', error);
      if (error.code === 'auth/popup-blocked') {
        setError('ポップアップがブロックされました。ブラウザのポップアップブロックを無効にして再試行してください。');
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        setError('Google認証がキャンセルされました。');
      } else {
        setError('Google認証に失敗しました。しばらく時間をおいて再試行してください。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      
      onLogin({
        email: null,
        uid: user.uid,
        isAnonymous: true,
        type: 'anonymous'
      });
    } catch (error) {
      console.error('匿名認証エラー:', error);
      setError('お試し利用の開始に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('パスワードリセット用のメールアドレスを入力してください');
      return;
    }

    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setShowForgotPassword(false);
    } catch (error) {
      console.error('パスワードリセットエラー:', error);
      if (error.code === 'auth/user-not-found') {
        setError('このメールアドレスに関連するアカウントが見つかりません');
      } else {
        setError('パスワードリセットメールの送信に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'このメールアドレスは既に使用されています';
      case 'auth/weak-password':
        return 'パスワードが弱すぎます。英数字を組み合わせた6文字以上のパスワードを設定してください';
      case 'auth/user-not-found':
        return 'ユーザーが見つかりません。メールアドレスを確認してください';
      case 'auth/wrong-password':
        return 'パスワードが間違っています';
      case 'auth/invalid-email':
        return 'メールアドレスの形式が正しくありません';
      case 'auth/user-disabled':
        return 'このアカウントは無効化されています';
      case 'auth/too-many-requests':
        return 'ログイン試行回数が多すぎます。しばらく時間をおいて再試行してください';
      case 'auth/network-request-failed':
        return 'ネットワークエラーが発生しました。インターネット接続を確認してください';
      default:
        return `認証に失敗しました: ${errorCode}`;
    }
  };

  const loginStyles = {
    container: {
      maxWidth: '400px',
      margin: '50px auto',
      padding: '40px',
      backgroundColor: colors.background,
      color: colors.text,
      borderRadius: '12px',
      boxShadow: `0 0 20px ${colors.secondary}`,
      textAlign: 'center',
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '10px 0',
      borderRadius: '6px',
      border: `1px solid ${colors.secondary}`,
      backgroundColor: colors.backgroundLight,
      color: colors.text,
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '12px',
      margin: '10px 0',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      disabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
      }
    },
    primaryButton: {
      backgroundColor: colors.primary,
      color: colors.background
    },
    googleButton: {
      backgroundColor: colors.google,
      color: '#fff'
    },
    trialButton: {
      backgroundColor: colors.secondary,
      color: colors.text,
      border: `2px dashed ${colors.primary}`
    },
    linkButton: {
      background: 'none',
      border: 'none',
      color: colors.primary,
      cursor: 'pointer',
      textDecoration: 'underline',
      fontSize: '0.9rem',
      padding: '5px'
    },
    successMessage: {
      backgroundColor: colors.backgroundLight,
      color: colors.primary,
      padding: '15px',
      borderRadius: '6px',
      marginBottom: '10px',
      border: `1px solid ${colors.primary}`
    }
  };

  if (showForgotPassword) {
    return (
      <div style={loginStyles.container}>
        <h2 style={{color: colors.primary, fontSize: '1.5rem', marginBottom: '20px'}}>
          パスワードリセット
        </h2>
        <p style={{color: colors.textMuted, marginBottom: '20px'}}>
          登録したメールアドレスを入力してください。パスワードリセットリンクをお送りします。
        </p>
        
        <input 
          type="email" 
          placeholder="メールアドレス" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={loginStyles.input} 
        />
        
        {error && <div style={{color: colors.error, marginBottom: '10px'}}>{error}</div>}
        
        <button 
          onClick={handlePasswordReset}
          disabled={loading}
          style={{
            ...loginStyles.button, 
            ...loginStyles.primaryButton,
            ...(loading ? loginStyles.button.disabled : {})
          }}
        >
          {loading ? '送信中...' : 'リセットリンクを送信'}
        </button>
        
        <button 
          onClick={() => {
            setShowForgotPassword(false);
            setError('');
            setResetEmailSent(false);
          }}
          style={loginStyles.linkButton}
        >
          ← ログイン画面に戻る
        </button>
      </div>
    );
  }

  return (
    <div style={loginStyles.container}>
      <h1 style={{color: colors.primary, fontSize: '2rem', marginBottom: '30px'}}>
        DBD戦績管理
      </h1>
      
      {resetEmailSent && (
        <div style={loginStyles.successMessage}>
          📧 パスワードリセットメールを送信しました！メールボックスをご確認ください。
        </div>
      )}
      
      <p style={{color: colors.textMuted, marginBottom: '30px'}}>
        戦績を確実に保存するため、アカウント作成をお勧めします
      </p>
      
      <input 
        type="email" 
        placeholder="メールアドレス" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        style={loginStyles.input} 
      />
      <input 
        type="password" 
        placeholder="パスワード（6文字以上）" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        style={loginStyles.input} 
      />
      
      {error && <div style={{color: colors.error, marginBottom: '10px'}}>{error}</div>}
      
      <button 
        onClick={handleEmailLogin}
        disabled={loading}
        style={{
          ...loginStyles.button, 
          ...loginStyles.primaryButton,
          ...(loading ? loginStyles.button.disabled : {})
        }}
      >
        {loading ? '処理中...' : isSignUp ? 'アカウント作成' : 'ログイン'}
      </button>

      {!isSignUp && (
        <button 
          onClick={() => setShowForgotPassword(true)}
          style={loginStyles.linkButton}
        >
          パスワードを忘れた場合
        </button>
      )}

      <div style={{margin: '20px 0', color: colors.textMuted}}>
        {isSignUp ? 'アカウントをお持ちの方は' : 'アカウントをお持ちでない方は'}
        <span 
          style={{color: colors.primary, cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px'}} 
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
            setResetEmailSent(false);
          }}
        >
          {isSignUp ? 'ログイン' : 'アカウント作成'}
        </span>
      </div>

      <button 
        onClick={handleGoogleLogin}
        disabled={loading}
        style={{
          ...loginStyles.button, 
          ...loginStyles.googleButton,
          ...(loading ? loginStyles.button.disabled : {})
        }}
      >
        📧 Googleで簡単登録
      </button>

      <div style={{margin: '20px 0', color: colors.textMuted, fontSize: '0.9rem'}}>
        または
      </div>

      <button 
        onClick={handleAnonymousLogin}
        disabled={loading}
        style={{
          ...loginStyles.button, 
          ...loginStyles.trialButton,
          ...(loading ? loginStyles.button.disabled : {})
        }}
      >
        🔄 お試しで使用する（データは保存されません）
      </button>

      <div style={{marginTop: '20px', padding: '15px', backgroundColor: colors.backgroundLight, borderRadius: '6px', fontSize: '0.9rem', color: colors.textMuted}}>
        <h4 style={{color: colors.primary, margin: '0 0 10px 0'}}>✅ アカウント作成のメリット</h4>
        <ul style={{textAlign: 'left', margin: 0, paddingLeft: '20px'}}>
          <li>戦績の永続保存</li>
          <li>デバイス間でのデータ同期</li>
          <li>詳細な統計分析</li>
          <li>将来のAI機能利用</li>
        </ul>
        
        <h4 style={{color: colors.secondary, margin: '15px 0 10px 0'}}>⚠️ お試し利用の制限</h4>
        <ul style={{textAlign: 'left', margin: 0, paddingLeft: '20px'}}>
          <li>ブラウザを閉じるとデータが消失</li>
          <li>デバイス間での同期なし</li>
          <li>統計機能の一部制限</li>
        </ul>
      </div>
    </div>
  );
};
