// components/AIAnalysis.js
import React from 'react';
import { colors } from '../styles/commonStyles';

// DBDキラー別のアドバイス
const KILLER_ADVICE = {
  'トラッパー': '罠の設置場所を覚えましょう。窓枠や板の近くに注意して移動してください。',
  'レイス': '透明化の音を聞き逃さないように。心音なしでも油断せず、常に警戒しましょう。',
  'ヒルビリー': 'チェーンソーは直線的です。障害物を使って曲がりくねった逃走を心がけてください。',
  'ナース': '最も強力なキラーの一人。ブリンクの距離感を覚え、予測回避を練習しましょう。',
  'ハグ': '罠を踏まずに済むようクローチ移動を活用しましょう。フックからの救助時は特に注意。',
  'ドクター': '治療を怠らず、静電気フィールドの範囲外で行動しましょう。隠れる場所の確保が重要。',
  'ハントレス': '斧の軌道を読み、左右に揺さぶりながら移動しましょう。障害物を積極的に使用してください。',
  'カニバル': 'チェーンソーの範囲は広いです。窓枠や板を使った確実な回避を心がけてください。',
  'ナイトメア': '夢の世界では板の数が減ります。早めに起こしてもらうか、時計で自分で起きましょう。',
  'ピッグ': 'RBTが付いたら発電機修理より解除を優先。時間管理が生存の鍵です。',
  'スピリット': '足跡と草の動きで位置を特定。予測不能な動きで翻弄しましょう。',
  'ゴーストフェイス': 'ストーキングを阻止するため、見つけたら正面から見つめましょう。',
  '鬼': '血の玉を残さないよう負傷時は注意。鬼の怒り中は隠れることを最優先に。',
  'エクセキューショナー': '地面の溝に注意。裁きの儀式を避けるため、檻への救助は慎重に。',
  'ブライト': 'バウンス軌道を読んで回避。オープンエリアでの対峙は避けましょう。',
  'ツインズ': 'ヴィクターを蹴り飛ばすタイミングを見極め、シャルロットとの距離も管理しましょう。',
  'トリックスター': '投げナイフの連続ヒットを避けるため、障害物を積極的に利用してください。',
  'ネメシス': '感染レベルの管理が重要。ゾンビの位置も常に把握しておきましょう。',
  'セノバイト': 'パフォーマンスステージを避け、ナイフ投げの射線から外れることを意識してください。',
  'アーティスト': 'カラスの群れを利用した索敵に注意。長距離攻撃の軌道を読みましょう。',
  '貞子': 'TVをオフにして瞬間移動を阻止。呪いを解除するタイミングを見極めてください。',
  'ドレッジ': '暗闇での行動が制限されます。ロッカーの位置を事前に把握しておきましょう。',
  'ウェスカー': '感染を避けるため距離を保ち、ウロボロスウィルスの拡散を防ぎましょう。',
  'ナイト': 'ガードの巡回パターンを読み、連携攻撃を避ける位置取りを心がけてください。',
  'スカルマーチャント': 'ドローンの検知範囲を把握し、クローハック状態を避けるよう注意深く行動してください。',
  'シンギュラリティ': 'バイオポッドの監視範囲を意識し、EMPを効果的に使用してテレポートを阻止しましょう。',
  'ゼノモーフ': 'トンネルシステムを塞ぎ、移動を制限。尻尾攻撃の射程に注意してください。',
  'チャッキー': '小さい体格を活かした隠れ身に注意。ステルスダッシュの音を聞き逃さないように。',
  'アンノウン': 'UVXの弱体化効果を避け、テレポート攻撃の予兆を読んで回避しましょう。',
  'リッチ': '呪文の効果範囲を把握し、飛行状態での移動パターンを読んで対策してください。',
  'ダークロード': '魔法攻撃の軌道を予測し、テレポートでの奇襲に常に警戒を怠らないように。',
  'ハウンドマスター': '犬の位置を常に把握し、連携攻撃を避けるため分散して行動しましょう。',
  'アニマトロニック': 'ジャンプスケア攻撃のタイミングを読み、電力システムの管理に注意してください。'
};

// 高度な分析ロジック（総合版）
const generateAdvancedAnalysis = (results) => {
  if (!results || results.length === 0) {
    return {
      advice: ['戦績データが不足しています。もう少し試合を重ねてから分析してみてください。'],
      stats: null
    };
  }

  const stats = {
    totalGames: results.length,
    totalEscapes: 0,
    escapeRate: 0,
    killerStats: {},
    weakKillers: [],
    strongKillers: []
  };

  // キラー別統計計算
  results.forEach(result => {
    if (!result.survivorStatus) return;
    
    const myStatus = result.survivorStatus['自分'] || 
                    Object.values(result.survivorStatus)[0];
    
    if (myStatus === '逃') {
      stats.totalEscapes++;
    }

    if (!stats.killerStats[result.killer]) {
      stats.killerStats[result.killer] = { games: 0, escapes: 0 };
    }
    stats.killerStats[result.killer].games++;
    if (myStatus === '逃') {
      stats.killerStats[result.killer].escapes++;
    }
  });

  // 脱出率計算
  stats.escapeRate = parseFloat((stats.totalEscapes / stats.totalGames * 100).toFixed(1));

  // 苦手・得意キラー特定
  Object.entries(stats.killerStats).forEach(([killer, killerStats]) => {
    const winRate = (killerStats.escapes / killerStats.games * 100);
    if (killerStats.games >= 2) {
      if (winRate < 30) {
        stats.weakKillers.push({ 
          killer, 
          winRate: parseFloat(winRate.toFixed(1)), 
          games: killerStats.games 
        });
      } else if (winRate > 70) {
        stats.strongKillers.push({ 
          killer, 
          winRate: parseFloat(winRate.toFixed(1)), 
          games: killerStats.games 
        });
      }
    }
  });

  // ソート
  stats.weakKillers.sort((a, b) => a.winRate - b.winRate);
  stats.strongKillers.sort((a, b) => b.winRate - a.winRate);

  // 総合分析を生成
  const aiAdvice = generateAIStyleAdvice(stats, results);

  return { stats, advice: aiAdvice };
};

// AI風のアドバイス生成（総合評価版）
const generateAIStyleAdvice = (stats, results) => {
  const advice = [];
  
  // 分析ヘッダー
  advice.push('🤖 【総合戦績分析】\n');
  
  // 各種分析の実行
  const selfRatingAnalysis = analyzeSelfRating(results);
  const killerLevelAnalysis = analyzeKillerLevels(results);
  
  // 総合スキル判定
  const skillAssessment = determineComprehensiveSkillLevel(stats, selfRatingAnalysis, killerLevelAnalysis, results);
  
  advice.push(`🏆 総合レベル: ${skillAssessment.level}`);
  advice.push(`💬 総評: ${skillAssessment.advice}\n`);
  
  // スコア内訳表示
  advice.push('📊 詳細分析');
  advice.push(`・${skillAssessment.scoreBreakdown.escapeRate}`);
  advice.push(`・${skillAssessment.scoreBreakdown.selfRating}`);
  advice.push(`・${skillAssessment.scoreBreakdown.consistency}`);
  advice.push(`・${skillAssessment.scoreBreakdown.opponentLevel}`);
  advice.push('');
  
  // 相手レベル別成績
  if (Object.keys(killerLevelAnalysis.levelStats).length > 1) {
    advice.push('🎭 相手レベル別成績');
    Object.entries(killerLevelAnalysis.levelStats)
      .sort(([a], [b]) => getKillerLevelScore(b) - getKillerLevelScore(a))
      .forEach(([level, stats]) => {
        const performance = parseFloat(stats.escapeRate);
        const emoji = performance >= 60 ? '💪' : performance >= 40 ? '👌' : performance >= 20 ? '📈' : '🔥';
        advice.push(`・${level}相手: ${emoji} 脱出率${stats.escapeRate}% (自己評価平均${stats.avgSelfRating}) ${stats.games}試合`);
      });
    advice.push('');
  }
  
  // 特筆すべきポイント
  const notablePoints = generateNotablePoints(stats, selfRatingAnalysis, killerLevelAnalysis, results);
  if (notablePoints.length > 0) {
    advice.push('✨ 特筆すべきポイント');
    notablePoints.forEach(point => advice.push(`・${point}`));
    advice.push('');
  }
  
  // 詳細分析
  advice.push('🔍 詳細分析');
  
  // 試合数による分析
  if (stats.totalGames < 5) {
    advice.push('・まだデータが少ないため、もう少しプレイして傾向を把握しましょう');
  } else if (stats.totalGames < 20) {
    advice.push('・適度な試合数でパターンが見えてきています');
  } else if (stats.totalGames < 50) {
    advice.push('・十分な試合数があり、信頼性の高い分析が可能です');
  } else {
    advice.push('・豊富な経験値！データに基づいた的確な改善が可能です');
  }
  
  // 最近の傾向分析
  if (results.length >= 5) {
    const recent5 = results.slice(0, 5);
    const recentEscapes = recent5.filter(r => {
      const status = r.survivorStatus?.['自分'] || Object.values(r.survivorStatus || {})[0];
      return status === '逃';
    }).length;
    const recentRate = (recentEscapes / 5 * 100).toFixed(0);
    
    if (recentRate > stats.escapeRate + 10) {
      advice.push(`・最近調子が良い！(直近5試合: ${recentRate}%) この調子で継続しましょう`);
    } else if (recentRate < stats.escapeRate - 10) {
      advice.push(`・最近少し苦戦中 (直近5試合: ${recentRate}%) 基本に戻って練習してみましょう`);
    } else {
      advice.push(`・安定したパフォーマンス (直近5試合: ${recentRate}%) 良いペースです`);
    }
  }
  
  // キラー対策
  advice.push('\n🎭 キラー対策');
  
  if (stats.weakKillers.length > 0) {
    const weakest = stats.weakKillers[0];
    advice.push(`・最苦手: ${weakest.killer} (脱出率${weakest.winRate}%)`);
    
    if (KILLER_ADVICE[weakest.killer]) {
      advice.push(`  💡 ${KILLER_ADVICE[weakest.killer]}`);
    }
    
    if (stats.weakKillers.length > 1) {
      const second = stats.weakKillers[1];
      advice.push(`・苦手: ${second.killer} (脱出率${second.winRate}%)`);
    }
  } else {
    advice.push('・特に苦手なキラーは見当たりません。バランス良く対応できています');
  }
  
  if (stats.strongKillers.length > 0) {
    const strongest = stats.strongKillers[0];
    advice.push(`・得意: ${strongest.killer} (脱出率${strongest.winRate}%) この立ち回りを他でも活用！`);
  }
  
  // 改善提案（総合的）
  advice.push('\n🎯 改善提案');
  const improvementSuggestions = generateComprehensiveImprovementSuggestions(stats, selfRatingAnalysis, killerLevelAnalysis, results);
  improvementSuggestions.forEach(suggestion => advice.push(suggestion));
  
  // メモ分析
  const memoInsights = analyzeMemosAdvanced(results);
  if (memoInsights) {
    advice.push('\n📝 プレイスタイル分析');
    advice.push(memoInsights);
  }
  
  // モチベーション
  advice.push('\n💪 応援メッセージ');
  const motivationMessages = [
    '継続は力なり！毎日の小さな積み重ねが大きな成長に繋がります',
    '失敗も成長の一部。楽しみながらスキルアップしていきましょう！',
    'あなたのペースで大丈夫。着実に上達していることがデータからも分かります',
    'DBDは奥が深いゲーム。長期的な視点で楽しみながら上達していきましょう'
  ];
  
  const randomMotivation = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
  advice.push(randomMotivation);
  
  return advice;
};

// メモの高度な分析
const analyzeMemosAdvanced = (results) => {
  const memos = results.filter(r => r.memo && r.memo.trim()).map(r => r.memo);
  if (memos.length === 0) return null;
  
  const insights = [];
  const memoText = memos.join(' ').toLowerCase();
  
  const keywords = {
    'チェイス': 'チェイス技術への意識が高い',
    '発電機': '発電機効率を重視している',
    '救助': 'チームプレイを意識している',
    'キャンプ': 'キラーの戦術を理解し分析している',
    'ミス': '自己分析能力が高い'
  };
  
  Object.entries(keywords).forEach(([keyword, meaning]) => {
    if (memoText.includes(keyword.toLowerCase())) {
      insights.push(`・${meaning}`);
    }
  });
  
  if (insights.length === 0) {
    insights.push('・詳細なメモを残し、真剣にプレイに取り組んでいる');
  }
  
  return insights.join('\n');
};

// 自己評価の分析（必須入力前提）
const analyzeSelfRating = (results) => {
  const ratingsWithScores = results
    .map(r => ({
      rating: r.selfRating || '普通',
      score: getRatingScore(r.selfRating || '普通'),
      result: r
    }));

  const averageScore = ratingsWithScores.reduce((sum, r) => sum + r.score, 0) / ratingsWithScores.length;
  const averageRating = getScoreRating(averageScore);
  
  // 評価分布
  const ratingDistribution = {};
  ratingsWithScores.forEach(r => {
    ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
  });

  // 低評価でも脱出した試合（謙虚さ・チーム力・運）
  const lowRatingEscapes = ratingsWithScores.filter(r => 
    r.score <= 2 && r.result.survivorStatus?.['自分'] === '逃'
  );

  // 高評価でも死亡した試合（強い相手・チーム事情）
  const highRatingDeaths = ratingsWithScores.filter(r => 
    r.score >= 4 && r.result.survivorStatus?.['自分'] === '死'
  );

  // 評価と結果の一致度
  const consistentResults = ratingsWithScores.filter(r => {
    const isEscape = r.result.survivorStatus?.['自分'] === '逃';
    return (r.score >= 4 && isEscape) || (r.score <= 2 && !isEscape);
  });

  return {
    averageRating,
    averageScore,
    totalRatings: ratingsWithScores.length,
    ratingDistribution,
    lowRatingEscapes,
    highRatingDeaths,
    consistentResults,
    consistencyRate: (consistentResults.length / ratingsWithScores.length * 100).toFixed(1),
    ratingsWithScores
  };
};

// 自己評価を数値に変換
const getRatingScore = (rating) => {
  const scoreMap = {
    '最悪': 1,
    '悪い': 2,
    '普通': 3,
    '良い': 4,
    '最高': 5
  };
  return scoreMap[rating] || 0;
};

// キラーレベルの分析
const analyzeKillerLevels = (results) => {
  const killerLevelStats = {};
  let totalLevelScore = 0;
  let levelCount = 0;

  results.forEach(result => {
    const level = result.killerLevel || '中級';
    const levelScore = getKillerLevelScore(level);
    const isEscape = result.survivorStatus?.['自分'] === '逃';
    const selfScore = getRatingScore(result.selfRating || '普通');

    if (!killerLevelStats[level]) {
      killerLevelStats[level] = { games: 0, escapes: 0, totalSelfRating: 0 };
    }

    killerLevelStats[level].games++;
    killerLevelStats[level].totalSelfRating += selfScore;
    if (isEscape) {
      killerLevelStats[level].escapes++;
    }

    totalLevelScore += levelScore;
    levelCount++;
  });

  // レベル別統計計算
  const levelStats = {};
  Object.entries(killerLevelStats).forEach(([level, stats]) => {
    levelStats[level] = {
      games: stats.games,
      escapeRate: (stats.escapes / stats.games * 100).toFixed(1),
      avgSelfRating: (stats.totalSelfRating / stats.games).toFixed(1)
    };
  });

  const averageOpponentLevel = totalLevelScore / levelCount;

  return {
    levelStats,
    averageOpponentLevel,
    averageOpponentLevelName: getKillerLevelName(averageOpponentLevel)
  };
};

// キラーレベルを数値に変換
const getKillerLevelScore = (level) => {
  const scoreMap = {
    '初心者': 1,
    '初級': 2,
    '中級': 3,
    '上級': 4,
    'プロ級': 5
  };
  return scoreMap[level] || 3;
};

// 数値をキラーレベルに変換
const getKillerLevelName = (score) => {
  if (score >= 4.5) return 'プロ級';
  if (score >= 3.5) return '上級';
  if (score >= 2.5) return '中級';
  if (score >= 1.5) return '初級';
  return '初心者';
};

// 数値を自己評価に変換
const getScoreRating = (score) => {
  if (score >= 4.5) return '最高';
  if (score >= 3.5) return '良い';
  if (score >= 2.5) return '普通';
  if (score >= 1.5) return '悪い';
  return '最悪';
};

// 総合的なスキルレベル判定（自己評価 + 脱出率 + 相手レベル）
const determineComprehensiveSkillLevel = (stats, selfRatingAnalysis, killerLevelAnalysis, results) => {
  const escapeRate = stats.escapeRate;
  const avgSelfRating = selfRatingAnalysis.averageScore;
  const avgOpponentLevel = killerLevelAnalysis.averageOpponentLevel;
  const consistencyRate = parseFloat(selfRatingAnalysis.consistencyRate);
  
  // 相手レベル補正係数
  const opponentAdjustment = avgOpponentLevel >= 4 ? 1.3 : avgOpponentLevel >= 3.5 ? 1.15 : avgOpponentLevel <= 2 ? 0.85 : 1.0;
  
  // 補正後の実質脱出率
  const adjustedEscapeRate = escapeRate * opponentAdjustment;
  
  // 総合スコア計算（各要素のバランス）
  const comprehensiveScore = (
    (adjustedEscapeRate / 100 * 0.4) +  // 補正後脱出率 40%
    (avgSelfRating / 5 * 0.3) +         // 自己評価 30%
    (consistencyRate / 100 * 0.2) +     // 一貫性 20%
    (avgOpponentLevel / 5 * 0.1)        // 相手レベル 10%
  );
  
  // 特殊パターンの検出
  const strongOpponentPerformance = avgOpponentLevel >= 4 && escapeRate >= 40;
  const weakOpponentStruggle = avgOpponentLevel <= 2 && escapeRate < 60;
  const highConsistency = consistencyRate >= 70;
  const modestButEffective = avgSelfRating <= 3 && escapeRate >= 50;
  
  // レベル判定
  if (comprehensiveScore >= 0.8) {
    return {
      level: strongOpponentPerformance ? 'エリートプレイヤー' : 'トッププレイヤー',
      advice: strongOpponentPerformance 
        ? '強い相手に対しても安定した成績を残しており、トップレベルの実力です！'
        : '全ての面で優秀な成績を収めています。DBDマスターレベルです！',
      scoreBreakdown: getScoreBreakdown(escapeRate, avgSelfRating, consistencyRate, avgOpponentLevel)
    };
  } else if (comprehensiveScore >= 0.65) {
    return {
      level: highConsistency ? '安定上級者' : '上級プレイヤー',
      advice: highConsistency
        ? '自己分析力が高く、安定した上級レベルのプレイができています。'
        : '上級者として実力を発揮しています。さらなる安定性を目指しましょう。',
      scoreBreakdown: getScoreBreakdown(escapeRate, avgSelfRating, consistencyRate, avgOpponentLevel)
    };
  } else if (comprehensiveScore >= 0.5) {
    return {
      level: modestButEffective ? '謙虚な実力者' : '中上級プレイヤー',
      advice: modestButEffective
        ? '謙虚な自己評価ですが、実際の成績は優秀です。もう少し自信を持って良いでしょう。'
        : '中上級者として順調に成長しています。特定分野を強化すれば上級者になれます。',
      scoreBreakdown: getScoreBreakdown(escapeRate, avgSelfRating, consistencyRate, avgOpponentLevel)
    };
  } else if (comprehensiveScore >= 0.35) {
    return {
      level: weakOpponentStruggle ? '基礎強化必要' : '中級プレイヤー',
      advice: weakOpponentStruggle
        ? '基礎的なスキルの強化が必要です。まずは確実に勝てる相手から安定させましょう。'
        : '中級者として基本は身についています。苦手分野の克服に集中しましょう。',
      scoreBreakdown: getScoreBreakdown(escapeRate, avgSelfRating, consistencyRate, avgOpponentLevel)
    };
  } else {
    return {
      level: '成長期プレイヤー',
      advice: '現在は学習段階です。基礎からしっかりと積み上げていけば、必ず上達します！',
      scoreBreakdown: getScoreBreakdown(escapeRate, avgSelfRating, consistencyRate, avgOpponentLevel)
    };
  }
};

// スコア内訳表示
const getScoreBreakdown = (escapeRate, avgSelfRating, consistencyRate, avgOpponentLevel) => {
  return {
    escapeRate: `脱出率: ${escapeRate}%`,
    selfRating: `自己評価: ${getScoreRating(avgSelfRating)}(${avgSelfRating.toFixed(1)})`,
    consistency: `評価一貫性: ${consistencyRate}%`,
    opponentLevel: `平均相手レベル: ${getKillerLevelName(avgOpponentLevel)}`
  };
};

// 特筆すべきポイントの生成
const generateNotablePoints = (stats, selfRatingAnalysis, killerLevelAnalysis, results) => {
  const points = [];
  
  // 強い相手への対応力
  const strongOpponentStats = killerLevelAnalysis.levelStats['上級'] || killerLevelAnalysis.levelStats['プロ級'];
  if (strongOpponentStats && parseFloat(strongOpponentStats.escapeRate) >= 40) {
    points.push('上級者相手でも安定した成績を残している（対応力が高い）');
  }
  
  // 自己評価の正確性
  if (parseFloat(selfRatingAnalysis.consistencyRate) >= 75) {
    points.push('自己評価と結果の一致率が高く、客観的な自己分析ができている');
  } else if (parseFloat(selfRatingAnalysis.consistencyRate) >= 60) {
    points.push('自己評価と結果がある程度一致しており、現実的な判断力を持っている');
  }
  
  // 謙虚さと冷静さ
  if (selfRatingAnalysis.lowRatingEscapes.length >= 2) {
    points.push('低評価でも脱出した試合が複数あり、謙虚で冷静な判断力を持っている');
  }
  
  // 状況理解力
  if (selfRatingAnalysis.highRatingDeaths.length >= 2) {
    points.push('高評価でも死亡した試合を正しく分析でき、チーム状況や相手実力を理解している');
  }
  
  // プレイスタイルの多様性
  const ratingVariance = Math.max(...Object.values(selfRatingAnalysis.ratingDistribution)) / results.length;
  if (ratingVariance < 0.6) {
    points.push('様々な状況に対して柔軟に対応し、バランスの良いプレイスタイル');
  }
  
  // 成長傾向の分析
  if (results.length >= 10) {
    const recent5 = results.slice(0, 5);
    const older5 = results.slice(5, 10);
    const recentAvg = recent5.reduce((sum, r) => sum + getRatingScore(r.selfRating || '普通'), 0) / 5;
    const olderAvg = older5.reduce((sum, r) => sum + getRatingScore(r.selfRating || '普通'), 0) / 5;
    
    if (recentAvg > olderAvg + 0.4) {
      points.push('最近の自己評価が大幅に向上しており、著しい成長が見られる');
    } else if (recentAvg > olderAvg + 0.2) {
      points.push('最近の自己評価が向上しており、着実な成長が見られる');
    }
    
    // 脱出率の傾向も分析
    const recentEscapes = recent5.filter(r => r.survivorStatus?.['自分'] === '逃').length;
    const olderEscapes = older5.filter(r => r.survivorStatus?.['自分'] === '逃').length;
    const recentEscapeRate = (recentEscapes / 5 * 100);
    const olderEscapeRate = (olderEscapes / 5 * 100);
    
    if (recentEscapeRate > olderEscapeRate + 20) {
      points.push('最近の成績が大幅に向上しており、実力アップが結果に現れている');
    }
  }
  
  // 継続性の評価
  if (results.length >= 20) {
    points.push('十分な試合数を蓄積しており、継続的な分析と改善に取り組んでいる');
  } else if (results.length >= 10) {
    points.push('適度な試合数で傾向が見えており、継続的な成長が期待できる');
  }
  
  // 難しい相手への挑戦
  if (killerLevelAnalysis.averageOpponentLevel >= 3.5) {
    points.push('平均的に強い相手と対戦しており、高いレベルでの経験を積んでいる');
  }
  
  // 安定性の評価
  const recentGames = Math.min(5, results.length);
  const recentResults = results.slice(0, recentGames);
  const recentRatingVariance = Math.max(...Object.values(
    recentResults.reduce((acc, r) => {
      const rating = r.selfRating || '普通';
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {})
  )) / recentGames;
  
  if (recentRatingVariance <= 0.6 && recentGames >= 3) {
    points.push('最近の試合で安定したパフォーマンスを維持している');
  }
  
  return points;
};

// 総合的な改善提案
const generateComprehensiveImprovementSuggestions = (stats, selfRatingAnalysis, killerLevelAnalysis, results) => {
  const suggestions = [];
  
  // 相手レベル別の課題
  const weakestLevel = Object.entries(killerLevelAnalysis.levelStats)
    .sort(([,a], [,b]) => parseFloat(a.escapeRate) - parseFloat(b.escapeRate))[0];
  
  if (weakestLevel && parseFloat(weakestLevel[1].escapeRate) < 40) {
    suggestions.push(`1. ${weakestLevel[0]}レベル対策: 最も苦戦している層への対応策を重点的に学習`);
  }
  
  // 自己評価の精度向上
  if (parseFloat(selfRatingAnalysis.consistencyRate) < 60) {
    suggestions.push('2. 自己評価精度: 結果と評価の乖離を減らし、より客観的な自己分析を目指す');
  }
  
  // 相手レベルに応じた立ち回り
  if (killerLevelAnalysis.averageOpponentLevel >= 3.5) {
    suggestions.push('3. 上級者対策: 強い相手に対する専用の立ち回りとメンタル管理を強化');
  } else if (killerLevelAnalysis.averageOpponentLevel <= 2.5) {
    suggestions.push('3. 基礎の徹底: 相手レベルに関係なく安定した成績を出せる基礎力の向上');
  }
  
  // 総合力向上
  if (stats.escapeRate < 50) {
    if (selfRatingAnalysis.averageScore >= 3.5) {
      suggestions.push('4. 結果への転換: 自己評価は良好なので、それを確実な結果に繋げる方法を模索');
    } else {
      suggestions.push('4. 基礎スキル: チェイス・立ち回り・判断力の総合的な底上げ');
    }
  } else {
    suggestions.push('4. 安定性向上: 現在の実力を維持しつつ、更なる安定性と対応力を身につける');
  }
  
  return suggestions;
};

const AIAnalysis = ({ results }) => {
  const analysis = generateAdvancedAnalysis(results);

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
      marginBottom: '10px',
      padding: '8px',
      borderLeft: `3px solid ${colors.primary}`,
      paddingLeft: '12px',
      lineHeight: '1.4',
      whiteSpace: 'pre-wrap'
    }
  };

  return (
    <div style={analysisStyles.container}>
      <h2 style={analysisStyles.title}>🤖 戦績分析</h2>
      
      {analysis.stats && (
        <div style={analysisStyles.statsBox}>
          <h3 style={{ color: colors.primary, marginTop: 0 }}>📊 基本統計</h3>
          <p>総試合数: {analysis.stats.totalGames}試合</p>
          <p>脱出成功: {analysis.stats.totalEscapes}回</p>
          <p>脱出率: {analysis.stats.escapeRate}%</p>
        </div>
      )}

      <div style={analysisStyles.adviceList}>
        <h3 style={{ color: colors.primary, marginTop: 0 }}>💡 分析結果</h3>
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
