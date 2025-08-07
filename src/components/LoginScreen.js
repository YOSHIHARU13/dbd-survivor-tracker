// components/LoginScreen.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { colors } from '../styles/commonStyles';

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
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
        type: isSignUp ? 'signup' : 'login' 
      });
    } catch (error) {
      console.error('認証エラー:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('このメールアドレスは既に使用されています');
          break;
        case 'auth/weak-password':
          setError('パスワードが弱すぎます');
          break;
        case 'auth/user-not-found':
          setError('ユーザーが見つかりません');
          break;
        case 'auth/wrong-password':
          setError('パスワードが間違っています');
          break;
        case 'auth/invalid-email':
          setError('メールアドレスの形式が正しくありません');
          break;
        default:
          setError('認証に失敗しました: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      onLogin({
        email: user.email,
        uid: user.uid,
        type: 'google'
      });
    } catch (error) {
      console.error('Google認証エラー:', error);
      setError('Google認証に失敗しました: ' + error.message);
    } finally {
      setLoading(false);
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
      fontWeight: '600'
    },
    primaryButton: {
      backgroundColor: colors.primary,
      color: colors.background
    },
    googleButton: {
      backgroundColor: colors.google,
      color: '#fff'
    }
  };

  return (
    <div style={loginStyles.container}>
      <h1 style={{color: colors.primary, fontSize: '2rem', marginBottom: '30px'}}>
        DBD戦績管理
      </h1>
      <p style={{color: colors.textMuted, marginBottom: '30px'}}>
        戦績を確実に保存するため、アカウント作成が必要です
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
        style={{...loginStyles.button, ...loginStyles.primaryButton}}
      >
        {loading ? '処理中...' : isSignUp ? 'アカウント作成' : 'ログイン'}
      </button>

      <div style={{margin: '20px 0', color: colors.textMuted}}>
        {isSignUp ? 'アカウントをお持ちの方は' : 'アカウントをお持ちでない方は'}
        <span 
          style={{color: colors.primary, cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px'}} 
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'ログイン' : 'アカウント作成'}
        </span>
      </div>

      <button 
        onClick={handleGoogleLogin}
        disabled={loading}
        style={{...loginStyles.button, ...loginStyles.googleButton}}
      >
        📧 Googleで簡単登録
      </button>

      <div style={{marginTop: '20px', padding: '15px', backgroundColor: colors.backgroundLight, borderRadius: '6px', fontSize: '0.9rem', color: colors.textMuted}}>
        <h4 style={{color: colors.primary, margin: '0 0 10px 0'}}>✅ アカウント作成のメリット</h4>
        <ul style={{textAlign: 'left', margin: 0, paddingLeft: '20px'}}>
          <li>戦績の永続保存</li>
          <li>デバイス間でのデータ同期</li>
          <li>詳細な統計分析</li>
          <li>将来のAI機能利用</li>
        </ul>
      </div>
    </div>
  );
};

export default LoginScreen;