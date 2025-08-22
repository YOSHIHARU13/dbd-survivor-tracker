// components/BattleForm.js - 日付入力改善版
import React, { useEffect } from 'react';
import { KILLERS, STAGES } from '../utils/constants';
import { styles, colors } from '../styles/commonStyles';

const BattleForm = ({
  battleDate,
  setBattleDate,
  killer,
  setKiller,
  killerLevel,
  setKillerLevel,
  stage,
  setStage,
  selfRating,
  setSelfRating,
  memo,
  setMemo,
  myStatus,
  setMyStatus,
  others,
  setOthers,
  othersStatus,
  setOthersStatus,
  onSubmit,
  userSettings
}) => {

  // 初回レンダリング時に今日の日付を自動設定
  useEffect(() => {
    if (!battleDate) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD形式
      setBattleDate(formattedDate);
    }
  }, [battleDate, setBattleDate]);

  const handleOtherChange = (index, value) => {
    const newOthers = [...others];
    newOthers[index] = value;
    setOthers(newOthers);
  };

  const handleOthersStatusChange = (index, status) => {
    setOthersStatus(prev => ({ ...prev, [index]: status }));
  };

  // フレンドリストから選択肢を生成
  const getSurvivorOptions = () => {
    const defaultOptions = ['野良'];
    const friends = userSettings?.friends || [];
    return [...defaultOptions, ...friends];
  };

  const survivorOptions = getSurvivorOptions();

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={styles.label}>戦闘日付</label>
        <div style={{ position: 'relative' }}>
          <input
            type="date"
            value={battleDate}
            onChange={(e) => setBattleDate(e.target.value)}
            style={{
              ...styles.input,
              cursor: 'pointer',
              padding: '12px',
              fontSize: '16px'
            }}
            required
          />
          {/* クリック領域を広げるためのオーバーレイ */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
            onClick={(e) => {
              // 既にinput要素がクリックされている場合は何もしない
              if (e.target.tagName === 'INPUT') return;
              // input要素をクリックしてカレンダーを開く
              e.currentTarget.previousElementSibling.focus();
              e.currentTarget.previousElementSibling.click();
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={styles.label}>キラー</label>
        <select
          value={killer}
          onChange={(e) => setKiller(e.target.value)}
          style={styles.select}
          required
        >
          <option value="">キラーを選択</option>
          {KILLERS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={styles.label}>キラーレベル</label>
        <input
          type="number"
          min="0"
          max="50"
          value={killerLevel}
          onChange={(e) => setKillerLevel(e.target.value)}
          style={styles.input}
          placeholder="0-50"
          required
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={styles.label}>ステージ</label>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          style={styles.select}
          required
        >
          <option value="">ステージを選択</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={styles.label}>自己評価</label>
        <select
          value={selfRating}
          onChange={(e) => setSelfRating(e.target.value)}
          style={styles.select}
        >
          <option value="S">S（最高）</option>
          <option value="A">A（良い）</option>
          <option value="B">B（普通）</option>
          <option value="C">C（悪い）</option>
          <option value="D">D（最悪）</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={styles.label}>自分の状態</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="radio"
              value="逃"
              checked={myStatus === "逃"}
              onChange={(e) => setMyStatus(e.target.value)}
            />
            🟢 脱出
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="radio"
              value="死"
              checked={myStatus === "死"}
              onChange={(e) => setMyStatus(e.target.value)}
            />
            🔴 死亡
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={styles.label}>他のサバイバー</label>
        {others.map((other, index) => (
          <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={other}
              onChange={(e) => handleOtherChange(index, e.target.value)}
              style={{ ...styles.select, flex: 1 }}
            >
              {survivorOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '5px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.9rem' }}>
                <input
                  type="radio"
                  value="逃"
                  checked={othersStatus[index] === "逃"}
                  onChange={() => handleOthersStatusChange(index, "逃")}
                />
                🟢
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.9rem' }}>
                <input
                  type="radio"
                  value="死"
                  checked={othersStatus[index] === "死"}
                  onChange={() => handleOthersStatusChange(index, "死")}
                />
                🔴
              </label>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={styles.label}>メモ（任意）</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          style={{
            ...styles.input,
            minHeight: '80px',
            resize: 'vertical'
          }}
          placeholder="試合の感想や反省点など..."
        />
      </div>

      <button type="submit" style={styles.button}>
        戦績を追加
      </button>
    </form>
  );
};

export default BattleForm;
