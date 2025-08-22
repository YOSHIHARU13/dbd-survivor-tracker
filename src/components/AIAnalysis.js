// components/AIAnalysis.js - 簡潔版戦績分析
import React from 'react';
import { colors } from '../styles/commonStyles';

// 戦績分析
const generateAnalysis = (results) => {
  if (!results || results.length === 0) {
    return { advice: ['データ不足'], stats: null };
  }

  const stats = calculateStats(results);
  const analysis = [];

  // 基本数値（常に表示）
  analysis.push(`個人脱出率: ${stats.escapeRate}% (${stats.totalEscapes}/${stats.totalGames})`);
  analysis.push(`チーム脱出率: ${stats.teamEscapeRate}%`);
  analysis.push('');

  // 得意キラートップ3（常に表示）
  const topKillers = getTopKillers(stats.killerStats, true);
  analysis.push('【得意キラー TOP3】');
  if (topKillers.length === 0) {
    analysis.push('データ不足（各キラー2試合以上で表示）');
  } else {
    topKillers.forEach((k, i) => {
      analysis.push(`${i+1}. ${k.killer}: 脱出率${k.personal}% / 評価平均${k.avgRating} (${k.games}試合)`);
    });
  }
  analysis.push('');

  // 苦手キラートップ3（常に表示）
  const worstKillers = getTopKillers(stats.killerStats, false);
  analysis.push('【苦手キラー TOP3】');
  if (worstKillers.length === 0) {
    analysis.push('データ不足（各キラー2試合以上で表示）');
  } else {
    worstKillers.forEach((k, i) => {
      analysis.push(`${i+1}. ${k.killer}: 脱出率${k.personal}% / 評価平均${k.avgRating} (${k.games}試合)`);
    });
  }
  analysis.push('');

  // 勝率高いステージトップ3（常に表示）
  const topStages = getTopStages(stats.stageStats, true);
  analysis.push('【勝率高いステージ TOP3】');
  if (topStages.length === 0) {
    analysis.push('データ不足（各ステージ2試合以上で表示）');
  } else {
    topStages.forEach((s, i) => {
      analysis.push(`${i+1}. ${s.stage}: 脱出率${s.personal}% / 評価平均${s.avgRating} (${s.games}試合)`);
    });
  }
  analysis.push('');

  // 勝率低いステージトップ3（常に表示）
  const worstStages = getTopStages(stats.stageStats, false);
  analysis.push('【勝率低いステージ TOP3】');
  if (worstStages.length === 0) {
    analysis.push('データ不足（各ステージ2試合以上で表示）');
  } else {
    worstStages.forEach((s, i) => {
      analysis.push(`${i+1}. ${s.stage}: 脱出率${s.personal}% / 評価平均${s.avgRating} (${s.games}試合)`);
    });
  }
  analysis.push('');

  // 自己評価分析
  analysis.push(`【自己評価】平均${stats.avgRatingDisplay} / 一致度${stats.consistencyRate}%`);
  analysis.push('');

  // 直近3試合の様子
  const recentComment = getRecentComment(results.slice(0, 3));
  analysis.push('【直近3試合の様子】');
  analysis.push(recentComment);

  return { advice: analysis, stats };
};

// 統計計算
const calculateStats = (results) => {
  const stats = {
    totalGames: results.length,
    totalEscapes: 0,
    escapeRate: 0,
    teamEscapeRate: 0,
    avgRating: 0,
    consistencyRate: 0,
    killerStats: {},
    stageStats: {},
    recentTrend: null
  };

  let ratingSum = 0;
  let ratingCount = 0;
  let consistentCount = 0;
  let totalTeamEscapes = 0;

  results.forEach(result => {
    const myStatus = result.survivorStatus?.['自分'] === '逃';
    const teamEscapes = Object.values(result.survivorStatus || {}).filter(s => s === '逃').length;
    const rating = result.selfRating ? getRatingScore(result.selfRating) : null;
    
    if (myStatus) stats.totalEscapes++;
    totalTeamEscapes += teamEscapes;

    // キラー別統計（自己評価含む）
    if (!stats.killerStats[result.killer]) {
      stats.killerStats[result.killer] = { 
        games: 0, 
        escapes: 0, 
        teamEscapes: 0,
        ratingSum: 0,
        ratingCount: 0
      };
    }
    stats.killerStats[result.killer].games++;
    stats.killerStats[result.killer].teamEscapes += teamEscapes;
    if (myStatus) stats.killerStats[result.killer].escapes++;
    if (rating !== null) {
      stats.killerStats[result.killer].ratingSum += rating;
      stats.killerStats[result.killer].ratingCount++;
    }

    // ステージ別統計（自己評価含む）
    if (result.stage) {
      if (!stats.stageStats[result.stage]) {
        stats.stageStats[result.stage] = { 
          games: 0, 
          escapes: 0, 
          teamEscapes: 0,
          ratingSum: 0,
          ratingCount: 0
        };
      }
      stats.stageStats[result.stage].games++;
      stats.stageStats[result.stage].teamEscapes += teamEscapes;
      if (myStatus) stats.stageStats[result.stage].escapes++;
      if (rating !== null) {
        stats.stageStats[result.stage].ratingSum += rating;
        stats.stageStats[result.stage].ratingCount++;
      }
    }

    // 全体自己評価
    if (rating !== null) {
      ratingSum += rating;
      ratingCount++;

      // 一致度判定（単純に高評価=脱出、低評価=死亡）
      if ((rating >= 4 && myStatus) || (rating <= 2 && !myStatus)) {
        consistentCount++;
      }
    }
  });

  stats.escapeRate = parseFloat((stats.totalEscapes / stats.totalGames * 100).toFixed(1));
  stats.teamEscapeRate = parseFloat((totalTeamEscapes / (stats.totalGames * 4) * 100).toFixed(1));
  stats.avgRating = ratingCount > 0 ? parseFloat((ratingSum / ratingCount).toFixed(1)) : 0;
  stats.avgRatingDisplay = ratingCount > 0 ? convertScoreToRating(stats.avgRating) : '-';
  stats.consistencyRate = ratingCount > 0 ? parseFloat((consistentCount / ratingCount * 100).toFixed(1)) : 0;

  return stats;
};

// トップキラー取得（得意・苦手）
const getTopKillers = (killerStats, isTop) => {
  const killers = Object.entries(killerStats)
    .filter(([_, data]) => data.games >= 2)
    .map(([killer, data]) => ({
      killer,
      personal: parseFloat((data.escapes / data.games * 100).toFixed(1)),
      team: parseFloat((data.teamEscapes / (data.games * 4) * 100).toFixed(1)),
      avgRating: data.ratingCount > 0 ? parseFloat((data.ratingSum / data.ratingCount).toFixed(1)) : '-',
      games: data.games
    }));

  const sorted = isTop 
    ? killers.sort((a, b) => b.personal - a.personal)  // 降順（得意）
    : killers.sort((a, b) => a.personal - b.personal); // 昇順（苦手）

  return sorted.slice(0, 3);
};

// トップステージ取得（勝率高い・低い）
const getTopStages = (stageStats, isTop) => {
  const stages = Object.entries(stageStats)
    .filter(([_, data]) => data.games >= 2)
    .map(([stage, data]) => ({
      stage,
      personal: parseFloat((data.escapes / data.games * 100).toFixed(1)),
      team: parseFloat((data.teamEscapes / (data.games * 4) * 100).toFixed(1)),
      avgRating: data.ratingCount > 0 ? parseFloat((data.ratingSum / data.ratingCount).toFixed(1)) : '-',
      games: data.games
    }));

  const sorted = isTop 
    ? stages.sort((a, b) => b.personal - a.personal)  // 降順（勝率高い）
    : stages.sort((a, b) => a.personal - b.personal); // 昇順（勝率低い）

  return sorted.slice(0, 3);
};

// 数値を評価文字に変換
const convertScoreToRating = (score) => {
  if (score >= 4.5) return 'S';
  if (score >= 3.5) return 'A';
  if (score >= 2.5) return 'B'; 
  if (score >= 1.5) return 'C';
  return 'D';
};

// 直近3試合のコメント生成
const getRecentComment = (recentGames) => {
  if (recentGames.length === 0) return 'まだ試合データがありません';
  if (recentGames.length < 3) return `データが${recentGames.length}試合分のみです`;

  const myEscapes = recentGames.filter(r => r.survivorStatus?.['自分'] === '逃').length;
  const totalTeamEscapes = recentGames.reduce((sum, r) => 
    sum + Object.values(r.survivorStatus || {}).filter(s => s === '逃').length, 0
  );
  const avgTeamEscapes = totalTeamEscapes / 3;

  // 個人脱出率が高い場合
  if (myEscapes >= 2) {
    return `あなたの脱出率${((myEscapes/3)*100).toFixed(0)}%！素晴らしい成績です🎉`;
  }
  
  // 個人は脱出できてないが、チーム貢献度が高い場合
  if (myEscapes === 1 && avgTeamEscapes >= 2) {
    return `チーム平均${avgTeamEscapes.toFixed(1)}人脱出！チームに良い影響を与えていますね👍`;
  }
  
  // 個人は脱出できてないが、チームもそこそこの場合
  if (myEscapes === 1 && avgTeamEscapes >= 1.3) {
    return `チーム戦で粘り強く戦えていますね。次は脱出を狙いましょう！💪`;
  }

  // チーム全体が苦戦している場合
  if (avgTeamEscapes < 1.3) {
    return `強いキラーや苦手キラーと遭遇したかも？対策を覚えるのもおすすめです📚`;
  }

  // その他の場合
  return `安定した試合運びができています。この調子で頑張りましょう！`;
};

// 自己評価スコア
const getRatingScore = (rating) => {
  const map = { 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
  return map[rating] || 3;
};

const AIAnalysis = ({ results }) => {
  const analysis = generateAnalysis(results);

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
      lineHeight: '1.4',
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
