// components/AIAnalysis.js
import React from 'react';
import { colors } from '../styles/commonStyles';

// キラー別対策（事実ベース）
const KILLER_WEAKNESS = {
  'トラッパー': '罠設置パターンの学習不足',
  'レイス': '透明化解除タイミングの読み不足',
  'ヒルビリー': '直線チェーンソー回避の基礎不足',
  'ナース': 'ブリンク距離予測の経験不足',
  'ハグ': 'クローチ移動の判断ミス',
  'ドクター': '治療タイミングの最適化不足',
  'ハントレス': '斧軌道の読み不足',
  'スピリット': 'フェイズ中の位置予測不足',
  'ゴーストフェイス': 'ストーカー阻止の反応遅れ',
  '鬼': '血玉回避の意識不足',
  'エクセキューショナー': '溝回避の判断遅れ',
  'ブライト': 'バウンス軌道の理解不足'
};

// 戦績分析（事実のみ）
const generateCriticalAnalysis = (results) => {
  if (!results || results.length === 0) {
    return { advice: ['データ不足'], stats: null };
  }

  const stats = calculateStats(results);
  const analysis = [];

  // レベル判定（厳格）
  const level = determineActualLevel(stats, results);
  analysis.push(`【実力判定】${level.name}`);
  analysis.push(`根拠: ${level.reason}`);
  analysis.push('');

  // 数値事実
  analysis.push(`【数値】脱出率${stats.escapeRate}% (${stats.totalEscapes}/${stats.totalGames})`);
  
  // 最近の変化（事実のみ）
  if (results.length >= 6) {
    const trend = analyzeRecentTrend(results);
    if (trend) analysis.push(`最近の変化: ${trend}`);
  }
  analysis.push('');

  // 最大の弱点（データベース）
  const weakness = findCriticalWeakness(stats, results);
  if (weakness) {
    analysis.push(`【最大の弱点】${weakness.issue}`);
    analysis.push(`対策: ${weakness.solution}`);
    analysis.push('');
  }

  // 改善の緊急度順
  const priorities = getPriorities(stats, results);
  analysis.push('【優先改善順】');
  priorities.forEach((p, i) => analysis.push(`${i+1}. ${p}`));

  return { advice: analysis, stats };
};

// 統計計算
const calculateStats = (results) => {
  const stats = {
    totalGames: results.length,
    totalEscapes: 0,
    escapeRate: 0,
    killerStats: {},
    selfRatingAvg: 0,
    consistencyRate: 0
  };

  let ratingSum = 0;
  let consistent = 0;

  results.forEach(result => {
    const myStatus = result.survivorStatus?.['自分'];
    const escaped = myStatus === '逃';
    
    if (escaped) stats.totalEscapes++;

    // キラー別統計
    if (!stats.killerStats[result.killer]) {
      stats.killerStats[result.killer] = { games: 0, escapes: 0 };
    }
    stats.killerStats[result.killer].games++;
    if (escaped) stats.killerStats[result.killer].escapes++;

    // 自己評価
    const rating = getRatingScore(result.selfRating || '普通');
    ratingSum += rating;

    // 一貫性（評価と結果の一致）
    const goodRating = rating >= 4;
    if ((goodRating && escaped) || (!goodRating && !escaped)) {
      consistent++;
    }
  });

  stats.escapeRate = parseFloat((stats.totalEscapes / stats.totalGames * 100).toFixed(1));
  stats.selfRatingAvg = (ratingSum / stats.totalGames).toFixed(1);
  stats.consistencyRate = parseFloat((consistent / stats.totalGames * 100).toFixed(1));

  return stats;
};

// 自己評価を数値化
const getRatingScore = (rating) => {
  const map = { '最悪': 1, '悪い': 2, '普通': 3, '良い': 4, '最高': 5 };
  return map[rating] || 3;
};

// 実力判定（厳格基準）
const determineActualLevel = (stats, results) => {
  const rate = stats.escapeRate;
  const avg = parseFloat(stats.selfRatingAvg);
  const consistency = stats.consistencyRate;

  // データ不足
  if (stats.totalGames < 5) {
    return { name: 'データ不足', reason: '試合数5未満' };
  }

  // 自己評価と結果の乖離チェック
  const overconfident = avg >= 4.0 && rate < 40;
  const underconfident = avg <= 2.5 && rate >= 60;

  if (overconfident) {
    return { name: '過大評価型', reason: `自己評価${avg}だが脱出率${rate}%` };
  }

  if (underconfident) {
    return { name: '過小評価型', reason: `自己評価${avg}だが脱出率${rate}%` };
  }

  // 実力判定
  if (rate >= 70 && consistency >= 70) {
    return { name: '上級者', reason: `脱出率${rate}%、自己分析精度${consistency}%` };
  } else if (rate >= 50 && consistency >= 60) {
    return { name: '中級者', reason: `脱出率${rate}%、分析精度${consistency}%` };
  } else if (rate >= 30) {
    return { name: '初中級者', reason: `脱出率${rate}%` };
  } else {
    return { name: '初心者', reason: `脱出率${rate}%` };
  }
};

// 最近の傾向分析
const analyzeRecentTrend = (results) => {
  const recent3 = results.slice(0, 3);
  const older3 = results.slice(3, 6);

  const recentEscapes = recent3.filter(r => r.survivorStatus?.['自分'] === '逃').length;
  const olderEscapes = older3.filter(r => r.survivorStatus?.['自分'] === '逃').length;

  const recentRate = (recentEscapes / 3 * 100).toFixed(0);
  const olderRate = (olderEscapes / 3 * 100).toFixed(0);

  const diff = recentRate - olderRate;
  
  if (diff >= 34) return `大幅向上 (${olderRate}% → ${recentRate}%)`;
  if (diff <= -34) return `大幅悪化 (${olderRate}% → ${recentRate}%)`;
  if (Math.abs(diff) <= 17) return `安定 (${recentRate}%)`;
  
  return null;
};

// 最大の弱点特定
const findCriticalWeakness = (stats, results) => {
  // 1. 特定キラーへの極端な弱さ
  const killerProblems = Object.entries(stats.killerStats)
    .filter(([_, data]) => data.games >= 2)
    .map(([killer, data]) => ({
      killer,
      rate: (data.escapes / data.games * 100).toFixed(0),
      games: data.games
    }))
    .filter(k => k.rate <= 25);

  if (killerProblems.length > 0) {
    const worst = killerProblems.sort((a, b) => a.rate - b.rate)[0];
    return {
      issue: `${worst.killer}に極端に弱い (${worst.rate}%, ${worst.games}試合)`,
      solution: KILLER_WEAKNESS[worst.killer] || '基本対策の学習'
    };
  }

  // 2. 自己評価の問題
  if (stats.consistencyRate < 50) {
    return {
      issue: `自己分析能力不足 (一致率${stats.consistencyRate}%)`,
      solution: '試合中の判断と結果の照合を徹底'
    };
  }

  // 3. 全体的な脱出率の問題
  if (stats.escapeRate < 25) {
    return {
      issue: '基礎スキル不足',
      solution: 'チェイス・発電機・救助の基本練習'
    };
  }

  return null;
};

// 改善優先度
const getPriorities = (stats, results) => {
  const priorities = [];

  // 緊急度順
  if (stats.escapeRate < 20) {
    priorities.push('基礎スキル習得（チェイス・発電機・救助）');
  }

  if (stats.consistencyRate < 40) {
    priorities.push('自己評価精度の向上（現実認識）');
  }

  // 特定キラー対策
  const weakKillers = Object.entries(stats.killerStats)
    .filter(([_, data]) => data.games >= 2 && (data.escapes / data.games) < 0.3)
    .sort(([_, a], [__, b]) => (a.escapes / a.games) - (b.escapes / b.games));

  if (weakKillers.length > 0) {
    priorities.push(`${weakKillers[0][0]}対策の重点学習`);
  }

  if (stats.escapeRate >= 30 && stats.escapeRate < 50) {
    priorities.push('中級技術の習得（状況判断・立ち回り）');
  }

  if (stats.escapeRate >= 50) {
    priorities.push('安定性向上（メンタル・集中力）');
  }

  return priorities.length > 0 ? priorities : ['継続的な経験積み重ね'];
};

const AIAnalysis = ({ results }) => {
  const analysis = generateCriticalAnalysis(results);

  const analysisStyles = {
    container: {
      marginTop: '30px',
      padding: '20px',
      backgroundColor: colors.backgroundLight,
      borderRadius: '8px',
      border: `2px solid ${colors.primary}`
    },
    title: {
      color: colors.primary,
      fontSize: '1.5rem',
      marginBottom: '20px',
      textAlign: 'center'
    },
    statsBox: {
      backgroundColor: colors.background,
      padding: '15px',
      borderRadius: '6px',
      marginBottom: '20px'
    },
    adviceList: {
      backgroundColor: colors.background,
      padding: '15px',
      borderRadius: '6px'
    },
    adviceItem: {
      marginBottom: '8px',
      padding: '6px',
      borderLeft: `3px solid ${colors.primary}`,
      paddingLeft: '10px',
      lineHeight: '1.3',
      fontSize: '0.95rem'
    }
  };

  return (
    <div style={analysisStyles.container}>
      <h2 style={analysisStyles.title}>📊 戦績分析</h2>
      
      {analysis.stats && (
        <div style={analysisStyles.statsBox}>
          <h3 style={{ color: colors.primary, marginTop: 0 }}>基本データ</h3>
          <p>試合数: {analysis.stats.totalGames} | 脱出: {analysis.stats.totalEscapes}回 | 脱出率: {analysis.stats.escapeRate}%</p>
          <p>自己評価平均: {analysis.stats.selfRatingAvg} | 評価一致率: {analysis.stats.consistencyRate}%</p>
        </div>
      )}

      <div style={analysisStyles.adviceList}>
        <h3 style={{ color: colors.primary, marginTop: 0 }}>分析結果</h3>
        {analysis.advice.map((advice, index) => (
          <div key={index} style={analysisStyles.adviceItem}>
            {advice}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIAnalysis;
