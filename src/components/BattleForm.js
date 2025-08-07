// components/BattleForm.js
import React from 'react';
import { KILLERS, STAGES, RATINGS } from '../utils/constants';
import { styles } from '../styles/commonStyles';

const BattleForm = ({
  battleDate, setBattleDate,
  killer, setKiller,
  killerLevel, setKillerLevel,
  stage, setStage,
  selfRating, setSelfRating,
  memo, setMemo,
  myStatus, setMyStatus,
  others, setOthers,
  othersStatus, setOthersStatus,
  onSubmit,
  userSettings // 新しく追加
}) => {
  
  // フレンドリストから選択肢を生成
  const getSurvivorOptions = () => {
    const options = ['野良']; // 野良は常に選択可能
    
    if (userSettings && userSettings.friends) {
      options.push(...userSettings.friends);
    }
    
    return options;
  };

  const survivorOptions = getSurvivorOptions();

  const handleOtherSelectChange = (index, value) => {
    setOthers(prev => {
      const newOthers = [...prev];
      newOthers[index] = value;
      return newOthers;
    });
  };

  const handleOtherStatusChange = (frameIndex, value) => {
    setOthersStatus(prev => ({ ...prev, [frameIndex]: value }));
  };

  return (
    <>
      {/* 入力フォーム */}
      <label style={styles.label}>対戦日付</label>
      <input
        type="date"
        value={battleDate}
        onChange={(e) => setBattleDate(e.target.value)}
        style={styles.input}
      />

      <label style={styles.label}>キラー</label>
      <select
        value={killer}
        onChange={(e) => setKiller(e.target.value)}
        style={styles.select}
      >
        <option value="">-- 選択してください --</option>
        {KILLERS.map((k) => <option key={k} value={k}>{k}</option>)}
      </select>

      <label style={styles.label}>キラーレベル</label>
      <input
        type="number"
        min="0"
        max="50"
        value={killerLevel}
        onChange={(e) => setKillerLevel(e.target.value)}
        style={styles.input}
        placeholder="0～50"
      />

      <label style={styles.label}>ステージ</label>
      <select
        value={stage}
        onChange={(e) => setStage(e.target.value)}
        style={styles.select}
      >
        <option value="">-- 選択してください --</option>
        {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <label style={styles.label}>自己評価</label>
      <select
        value={selfRating}
        onChange={(e) => setSelfRating(e.target.value)}
        style={styles.select}
      >
        {RATINGS.map(rating => <option key={rating} value={rating}>{rating}</option>)}
      </select>

      <label style={styles.label}>課題</label>
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        style={styles.memoInput}
        placeholder="自由にメモを入力できます"
      />

      {/* 自分の生存状況 */}
      <label style={styles.label}>自分の生存状況</label>
      <div style={styles.radioGroup}>
        {["逃", "負"].map(status => (
          <label key={status} style={{
            ...styles.radioLabel, 
            ...(myStatus === status ? styles.radioLabelChecked : {})
          }}>
            <input
              type="radio"
              name="myStatus"
              value={status}
              checked={myStatus === status}
              onChange={() => setMyStatus(status)}
            />
            {status}
          </label>
        ))}
      </div>

      {/* 他3枠のサバイバー */}
      <label style={styles.label}>その他のサバイバー選択と生存状況</label>
      {userSettings && userSettings.friends && userSettings.friends.length > 0 && (
        <div style={{
          marginBottom: '10px',
          padding: '8px',
          backgroundColor: styles.backgroundLight,
          borderRadius: '4px',
          fontSize: '0.9rem',
          color: styles.textMuted
        }}>
          💡 フレンド設定で登録した仲間を選択できます
        </div>
      )}
      
      {[0, 1, 2].map((idx) => (
        <div key={idx} style={{ marginBottom: "16px" }}>
          <select
            style={styles.select}
            value={others[idx]}
            onChange={(e) => handleOtherSelectChange(idx, e.target.value)}
          >
            {survivorOptions.map((option) => {
              // 同じフレンドが複数選択されることを防ぐ（野良は除く）
              const isDisabled = option !== "野良" && 
                               others.includes(option) && 
                               option !== others[idx];
              
              return (
                <option
                  key={option}
                  value={option}
                  disabled={isDisabled}
                >
                  {option}
                  {isDisabled ? ' (選択済み)' : ''}
                </option>
              );
            })}
          </select>
          <div style={styles.radioGroup}>
            {["逃", "負"].map(status => (
              <label key={status} style={{
                ...styles.radioLabel,
                ...(othersStatus[idx] === status ? styles.radioLabelChecked : {})
              }}>
                <input
                  type="radio"
                  name={`otherStatus-${idx}`}
                  value={status}
                  checked={othersStatus[idx] === status}
                  onChange={() => handleOtherStatusChange(idx, status)}
                />
                {status}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button style={styles.button} onClick={onSubmit}>
        戦績を追加
      </button>
    </>
  );
};

export default BattleForm;