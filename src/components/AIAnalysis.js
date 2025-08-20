// components/AIAnalysis.js
import React from 'react';
import { colors } from '../styles/commonStyles';

// 戦績分析（知りたい情報のみ）
const generateFocusedAnalysis = (results) => {
  if (!results || results.length === 0) {
    return { advice: ['データ不足'], stats: null };
  }

  const stats = calculateBasicStats(results);
  const analysis = [];

  // 基本数値
  analysis.push(`脱出率: ${stats.escapeRate}% (${stats.totalEscapes}/${stats.totalGames})\n`);

  // キラー分析
  const killerAnalysis = analyzeKillers(stats.killerStats);
  if (killerAnalysis.weak.length > 0) {
    analysis.push('【苦手キラー】');
    killerAnalysis.weak.forEach(k => {
      analysis.push(`${k.killer}: ${k.rate}% (${k.games}試合)`);
    });
    analysis.push('');
  }

  if (killerAnalysis.strong.length > 0) {
    analysis.push('【得意キラー】');
    killerAnalysis.strong.forEach(k => {
      analysis.push(`${k.killer}: ${k.rate}% (${k.games}試合)`);
    });
    analysis.push('');
  }

  // ステージ分析
  const stageAnalysis = analyzeStages(results);
  if (stageAnalysis.weak.length > 0) {
    analysis.push('【苦手ステージ】');
    stageAnalysis.weak.forEach(s => {
      analysis.push(`${s.stage}: ${s.rate}% (${s.games}試合)`);
    });
    analysis.push('');
  }

  if (stageAnalysis.strong.length > 0) {
    analysis.push('【得意ステージ】');
    stageAnalysis.strong.forEach(s => {
      analysis.push(`${s.stage}: ${s.rate}% (${s.games}試合)`);
    });
    analysis.push('');
  }

  // マップ理解度判定
  const mapUnderstanding = analyzeMapUnderstanding(stageAnalysis.all);
  if (mapUnderstanding) {
    analysis.push(`【マップ理解】${mapUnderstanding}`);
    analysis.push('');
  }

  // メモ分析
  const memoInsights = analyzeMemos(results);
  if (memoInsights.length > 0) {
    analysis.push('【メモから判明】');
    memoInsights.forEach(insight => analysis.push(`・${insight}`));
  }

  return { advice: analysis, stats };
};

// 基本統計
const calculateBasicStats = (results) => {
  const stats = {
    totalGames: results.length,
    totalEscapes: 0,
    escapeRate: 0,
    killerStats: {},
    stageStats: {}
  };

  results.forEach(result => {
    const escaped = result.survivorStatus?.['自分'] === '逃';
    if (escaped) stats.totalEscapes++;

    // キラー別
    if (!stats.killerStats[result.killer]) {
      stats.killerStats[result.killer] = { games: 0, escapes: 0 };
    }
    stats.killerStats[result.killer].games++;
    if (escaped) stats.killerStats[result.killer].escapes++;

    // ステージ別
    if (result.stage) {
      if (!stats.stageStats[result.stage]) {
        stats.stageStats[result.stage] = { games: 0, escapes: 0 };
      }
      stats.stageStats[result.stage].games++;
      if (escaped) stats.stageStats[result.stage].escapes++;
    }
  });

  stats.escapeRate = parseFloat((stats.totalEscapes / stats.totalGames * 100).toFixed(1));
  return stats;
};

// キラー分析
const analyzeKillers = (killerStats) => {
  const killers = Object.entries(killerStats)
    .filter(([_, data]) => data.games >= 2) // 2試合以上のみ
    .map(([killer, data]) => ({
      killer,
      rate: parseFloat((data.escapes / data.games * 100).toFixed(1)),
      games: data.games
    }));

  const weak = killers
    .filter(k => k.rate <= 30)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3); // 最大3つ

  const strong = killers
    .filter(k => k.rate >= 70)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3); // 最大3つ

  return { weak, strong };
};

// ステージ分析
const analyzeStages = (results) => {
  const stageStats = {};

  results.forEach(result => {
    if (!result.stage) return;
    
    const escaped = result.survivorStatus?.['自分'] === '逃';
    
    if (!stageStats[result.stage]) {
      stageStats[result.stage] = { games: 0, escapes: 0 };
    }
    stageStats[result.stage].games++;
    if (escaped) stageStats[result.stage].escapes++;
  });

  const stages = Object.entries(stageStats)
    .filter(([_, data]) => data.games >= 2) // 2試合以上のみ
    .map(([stage, data]) => ({
      stage,
      rate: parseFloat((data.escapes / data.games * 100).toFixed(1)),
      games: data.games
    }));

  const weak = stages
    .filter(s => s.rate <= 30)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3);

  const strong = stages
    .filter(s => s.rate >= 70)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3);

  return { weak, strong, all: stages };
};

// マップ理解度判定
const analyzeMapUnderstanding = (allStages) => {
  if (allStages.length < 3) return null;

  // 脱出率の標準偏差を計算
  const rates = allStages.map(s => s.rate);
  const avg = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  const variance = rates.reduce((sum, rate) => sum + Math.pow(rate - avg, 2), 0) / rates.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev >= 25) {
    return 'マップ格差大（特定マップへの偏りあり）';
  } else if (stdDev <= 10) {
    return 'マップ理解度安定';
  } else {
    return 'マップ理解度は普通';
  }
};

// メモ分析
const analyzeMemos = (results) => {
  const memos = results
    .map(r => r.memo || '')
    .filter(m => m.trim().length > 0);

  if (memos.length === 0) return [];

  const insights = [];
  const allText = memos.join(' ').toLowerCase();

  // 問題意識のキーワード
  const problemKeywords = {
    'チェイス': 'チェイス技術を課題視している',
    '発電機': '発電機効率を意識している',
    'キャンプ': 'キャンプ対策で悩んでいる',
    'トンネル': 'トンネル対策が課題',
    '救助': '救助タイミングを重視している',
    'ミス': '自分のミスを分析している',
    '下手': '自己評価が厳しい',
    '運': '運要素を感じている',
    'ラグ': '通信環境を気にしている',
    'パーク': 'ビルド研究をしている'
  };

  Object.entries(problemKeywords).forEach(([keyword, meaning]) => {
    if (allText.includes(keyword)) {
      insights.push(meaning);
    }
  });

  // メモ記録率
  const memoRate = (memos.length / results.length * 100).toFixed(0);
  if (memos.length >= results.length * 0.7) {
    insights.push(`振り返り習慣がある（${memoRate}%記録）`);
  } else if (memos.length <= results.length * 0.3) {
    insights.push(`メモが少ない（${memoRate}%のみ記録）`);
  }

  // 文字数による分析の深さ
  const avgLength = memos.reduce((sum, memo) => sum + memo.length, 0) / memos.length;
  if (avgLength >= 20) {
    insights.push('詳細にメモを記録（分析志向）');
  } else if (avgLength <= 5) {
    insights.push('簡潔なメモ（要点のみ記録）');
  }

  return insights;
};

const AIAnalysis = ({ results }) => {
  const analysis = generateFocusedAnalysis(results);

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
      marginBottom: '6px',
      padding: '4px',
      borderLeft: `3px solid ${colors.primary}`,
      paddingLeft: '8px',
      lineHeight: '1.3',
      fontSize: '0.95rem'
    }
  };

  return (
    <div style={analysisStyles.container}>
      <h2 style={analysisStyles.title}>📊 戦績分析</h2>

      <div style={analysisStyles.adviceList}>
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
