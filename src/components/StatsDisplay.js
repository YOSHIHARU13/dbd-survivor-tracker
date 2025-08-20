// components/StatsDisplay.js
import React from 'react';
import { KILLERS } from '../utils/constants';
import { styles, colors } from '../styles/commonStyles';
import AIAnalysis from './AIAnalysis';

const StatsDisplay = ({
  results,
  period,
  setPeriod,
  killerFilter,
  setKillerFilter,
  showStats,
  setShowStats,
  isLoading,
  onClearAllData
}) => {

  // フィルタリング
  const filteredResults = results.filter((r) => {
    if (!r.battleDate) return false;
    const rDate = new Date(r.battleDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === "today" && rDate.toDateString() !== today.toDateString()) return false;
    if (period === "week" && (today - rDate) > 7 * 24 * 60 * 60 * 1000) return false;
    if (killerFilter && r.killer !== killerFilter) return false;
    return true;
  });

  // 統計計算
  const killerStats = {};
  filteredResults.forEach((r) => {
    if (!killerStats[r.killer]) {
      killerStats[r.killer] = { totalGames: 0, totalEscapes: 0 };
    }
    killerStats[r.killer].totalGames++;
    killerStats[r.killer].totalEscapes += Object.values(r.survivorStatus).filter((v) => v === "逃").length;
  });

  const dateStats = {};
  filteredResults.forEach((r) => {
    if (!dateStats[r.battleDate]) {
      dateStats[r.battleDate] = { 
        totalGames: 0, 
        totalEscapes: 0, 
        perPerson: {}, 
        games: [] // 各試合の詳細を保存
      };
    }
    dateStats[r.battleDate].totalGames++;
    
    // 試合詳細を保存
    dateStats[r.battleDate].games.push(r);
    
    Object.keys(r.survivorStatus).forEach((person) => {
      let actualName = person;
      if (person.includes('(') && person.includes(')')) {
        actualName = person.match(/\(([^)]+)\)/)?.[1] || person;
      }
      
      if (!dateStats[r.battleDate].perPerson[actualName]) {
        dateStats[r.battleDate].perPerson[actualName] = { games: 0, escapes: 0 };
      }
      dateStats[r.battleDate].perPerson[actualName].games++;
      if (r.survivorStatus[person] === "逃") {
        dateStats[r.battleDate].perPerson[actualName].escapes++;
      }
    });
    dateStats[r.battleDate].totalEscapes += Object.values(r.survivorStatus).filter((v) => v === "逃").length;
  });

  return (
    <div style={{ marginTop: "30px" }}>
      <label style={styles.label}>期間</label>
      <select value={period} onChange={(e) => setPeriod(e.target.value)} style={styles.select}>
        <option value="today">今日</option>
        <option value="week">1週間</option>
        <option value="all">全期間</option>
      </select>

      <label style={styles.label}>キラー絞り込み</label>
      <select value={killerFilter} onChange={(e) => setKillerFilter(e.target.value)} style={styles.select}>
        <option value="">全キラー</option>
        {KILLERS.map((k) => <option key={k} value={k}>{k}</option>)}
      </select>

      <button
        style={{ ...styles.button, marginTop: "8px" }}
        onClick={() => setShowStats(!showStats)}
        disabled={isLoading}
      >
        {isLoading ? "読み込み中..." : showStats ? "一覧を隠す" : "一覧を表示"}
      </button>

      <button
        style={{
          ...styles.button,
          marginTop: "8px",
          marginLeft: "10px",
          backgroundColor: "#dc3545"
        }}
        onClick={onClearAllData}
      >
        全データ削除
      </button>

      {/* AI分析コンポーネント（1つだけ） */}
      {filteredResults.length > 0 && (
        <AIAnalysis results={filteredResults} />
      )}

      {showStats && (
        <>
          {/* 戦績詳細一覧（新規追加） */}
          <h2 style={{ color: colors.primary, marginTop: "30px" }}>■ 戦績詳細一覧</h2>
          {filteredResults.length === 0 ? (
            <p>試合データがありません</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>日付</th>
                    <th style={styles.th}>キラー</th>
                    <th style={styles.th}>レベル</th>
                    <th style={styles.th}>ステージ</th>
                    <th style={styles.th}>自分</th>
                    <th style={styles.th}>自己評価</th>
                    <th style={styles.th}>チーム脱出</th>
                    <th style={styles.th}>メモ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, index) => {
                    const myStatus = result.survivorStatus?.['自分'] || '不明';
                    const teamEscapes = Object.values(result.survivorStatus || {}).filter(s => s === '逃').length;
                    
                    return (
                      <tr key={index} style={{
                        backgroundColor: myStatus === '逃' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                      }}>
                        <td style={styles.td}>{result.battleDate}</td>
                        <td style={styles.td}>{result.killer}</td>
                        <td style={styles.td}>{result.killerLevel || '-'}</td>
                        <td style={styles.td}>{result.stage}</td>
                        <td style={{
                          ...styles.td,
                          fontWeight: 'bold',
                          color: myStatus === '逃' ? '#4CAF50' : '#F44336'
                        }}>
                          {myStatus === '逃' ? '🟢 逃' : '🔴 死'}
                        </td>
                        <td style={styles.td}>{result.selfRating || '-'}</td>
                        <td style={styles.td}>{teamEscapes}/4人</td>
                        <td style={{
                          ...styles.td,
                          maxWidth: '200px',
                          fontSize: '0.9rem',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {result.memo || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <h2 style={{ color: colors.primary, marginTop: "40px" }}>■ キラー別 脱出率</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>キラー</th>
                <th style={styles.th}>試合数</th>
                <th style={styles.th}>脱出数</th>
                <th style={styles.th}>脱出率（％）</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(killerStats).length === 0 ? (
                <tr><td style={styles.td} colSpan={4}>試合データがありません</td></tr>
              ) : (
                Object.entries(killerStats).map(([killerName, stats]) => (
                  <tr key={killerName}>
                    <td style={styles.td}>{killerName}</td>
                    <td style={styles.td}>{stats.totalGames}</td>
                    <td style={styles.td}>{stats.totalEscapes}</td>
                    <td style={styles.td}>
                      {stats.totalGames > 0
                        ? ((stats.totalEscapes / (stats.totalGames * 4)) * 100).toFixed(2)
                        : "0.00"}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <h2 style={{ color: colors.primary, marginTop: "40px" }}>■ 日付別 脱出率</h2>
          {Object.entries(dateStats).length === 0 ? (
            <p>試合データがありません</p>
          ) : (
            Object.entries(dateStats).map(([date, stats]) => (
              <div key={date} style={{ marginBottom: "20px" }}>
                <h3 style={{ color: colors.primary }}>{date}</h3>
                <p>
                  全体 脱出率:{" "}
                  {stats.totalGames > 0
                    ? ((stats.totalEscapes / (stats.totalGames * 4)) * 100).toFixed(2)
                    : "0.00"}%
                </p>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>サバイバー名</th>
                      <th style={styles.th}>試合数</th>
                      <th style={styles.th}>脱出数</th>
                      <th style={styles.th}>脱出率（％）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.perPerson).map(([person, pstats]) => (
                      <tr key={person}>
                        <td style={styles.td}>{person}</td>
                        <td style={styles.td}>{pstats.games}</td>
                        <td style={styles.td}>{pstats.escapes}</td>
                        <td style={styles.td}>
                          {pstats.games > 0
                            ? ((pstats.escapes / pstats.games) * 100).toFixed(2)
                            : "0.00"}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default StatsDisplay;
