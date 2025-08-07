// components/FriendSettings.js
import React, { useState, useEffect } from 'react';
import { userSettingsService } from '../services/userSettings';
import { colors } from '../styles/commonStyles';

const FriendSettings = ({ user, onClose, onSettingsUpdated }) => {
  const [friends, setFriends] = useState([]);
  const [newFriendName, setNewFriendName] = useState('');
  const [defaultSurvivors, setDefaultSurvivors] = useState(['野良', '野良', '野良']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 設定読み込み
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await userSettingsService.getUserSettings(user.uid);
        setFriends(settings.friends || []);
        setDefaultSurvivors(settings.defaultSurvivors || ['野良', '野良', '野良']);
      } catch (error) {
        console.error('設定読み込みエラー:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      loadSettings();
    }
  }, [user?.uid]);

  // フレンド追加
  const addFriend = () => {
    if (!newFriendName.trim()) {
      alert('フレンド名を入力してください');
      return;
    }
    if (friends.length >= 10) {
      alert('フレンドは最大10人まで登録できます');
      return;
    }
    if (friends.includes(newFriendName.trim())) {
      alert('同じ名前のフレンドが既に登録されています');
      return;
    }

    setFriends([...friends, newFriendName.trim()]);
    setNewFriendName('');
  };

  // フレンド削除
  const removeFriend = (index) => {
    setFriends(friends.filter((_, i) => i !== index));
  };

  // デフォルトサバイバー変更
  const updateDefaultSurvivor = (index, value) => {
    const newDefaults = [...defaultSurvivors];
    newDefaults[index] = value;
    setDefaultSurvivors(newDefaults);
  };

  // 設定保存
  const saveSettings = async () => {
    setSaving(true);
    try {
      await userSettingsService.updateAllSettings(user.uid, {
        friends,
        defaultSurvivors
      });
      
      alert('設定を保存しました！');
      onSettingsUpdated({ friends, defaultSurvivors });
    } catch (error) {
      alert('設定の保存に失敗しました');
      console.error('保存エラー:', error);
    } finally {
      setSaving(false);
    }
  };

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: colors.background,
      padding: '30px',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      position: 'relative'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: colors.textMuted
    },
    input: {
      width: '100%',
      padding: '8px',
      margin: '5px 0',
      borderRadius: '4px',
      border: `1px solid ${colors.secondary}`,
      backgroundColor: colors.backgroundLight,
      color: colors.text,
      boxSizing: 'border-box'
    },
    button: {
      padding: '8px 16px',
      margin: '5px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px'
    },
    primaryButton: {
      backgroundColor: colors.primary,
      color: colors.background
    },
    dangerButton: {
      backgroundColor: '#dc3545',
      color: 'white'
    },
    friendItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px',
      margin: '5px 0',
      backgroundColor: colors.backgroundLight,
      borderRadius: '4px'
    }
  };

  if (loading) {
    return (
      <div style={modalStyles.overlay}>
        <div style={modalStyles.modal}>
          <p>設定を読み込み中...</p>
        </div>
      </div>
    );
  }

  // 利用可能な選択肢を生成
  const availableOptions = ['野良', ...friends];

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={{ color: colors.primary, margin: 0 }}>フレンド設定</h2>
          <button 
            onClick={onClose} 
            style={modalStyles.closeButton}
          >
            ×
          </button>
        </div>

        {/* フレンド管理 */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: colors.primary }}>フレンドリスト ({friends.length}/10)</h3>
          
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <input
              type="text"
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              placeholder="フレンド名を入力"
              style={{ ...modalStyles.input, marginRight: '10px' }}
              onKeyPress={(e) => e.key === 'Enter' && addFriend()}
            />
            <button
              onClick={addFriend}
              disabled={friends.length >= 10}
              style={{
                ...modalStyles.button,
                ...modalStyles.primaryButton,
                opacity: friends.length >= 10 ? 0.5 : 1
              }}
            >
              追加
            </button>
          </div>

          <div>
            {friends.map((friend, index) => (
              <div key={index} style={modalStyles.friendItem}>
                <span>{friend}</span>
                <button
                  onClick={() => removeFriend(index)}
                  style={{
                    ...modalStyles.button,
                    ...modalStyles.dangerButton
                  }}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* デフォルト設定 */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: colors.primary }}>デフォルトサバイバー選択</h3>
          <p style={{ color: colors.textMuted, fontSize: '14px' }}>
            戦績入力時の初期選択です
          </p>
          
          {[0, 1, 2].map((index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <label style={{ color: colors.text }}>
                枠{index + 1}:
              </label>
              <select
                value={defaultSurvivors[index]}
                onChange={(e) => updateDefaultSurvivor(index, e.target.value)}
                style={modalStyles.input}
              >
                {availableOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* 保存・キャンセルボタン */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              ...modalStyles.button,
              backgroundColor: colors.textMuted,
              color: colors.background
            }}
          >
            キャンセル
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            style={{
              ...modalStyles.button,
              ...modalStyles.primaryButton,
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? '保存中...' : '設定を保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendSettings;