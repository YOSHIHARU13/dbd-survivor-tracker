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

// 高度な分析ロジック（AI風）
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

  // AI風の詳細分析を生成
  const aiAdvice = generateAIStyleAdvice(stats, results);

  return { stats, advice: aiAdvice };
};

// AI風のアドバイス生成（自己評価重視）
const generateAIStyleAdvice = (stats, results) => {
  const advice = [];
  
  // AI分析ヘッダー
  advice.push('🤖 【AI戦績分析結果】\n');
  
  // 自己評価の分析
  const selfRatingAnalysis = analyzeSelfRating(results);
  
  // スキルレベル判定（自己評価 + 脱出率の複合判定）
  const skillAssessment = determineSkillLevel(stats, selfRatingAnalysis, results);
  
  advice.push(`📊 スキルレベル: ${skillAssessment.level} (脱出率 ${stats.escapeRate}% / 自己評価平均 ${selfRatingAnalysis.averageRating})`);
  advice.push(`💬 総評: ${skillAssessment.advice}\n`);
  
  // 自己評価に基づく褒めポイント
  const praisePoints = generatePraiseBasedOnSelfRating(selfRatingAnalysis, results);
  if (praisePoints.length > 0) {
    advice.push('✨ あなたの良いところ');
    praisePoints.forEach(praise => advice.push(`・${praise}`));
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
  
  // 改善提案（自己評価に基づく）
  advice.push('🎯 今週の改善目標');
  const improvementSuggestions = generateImprovementSuggestions(stats, selfRatingAnalysis, results);
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

// 自己評価の分析
const analyzeSelfRating = (results) => {
  const ratingsWithScores = results
    .filter(r => r.selfRating && r.selfRating !== '未評価')
    .map(r => ({
      rating: r.selfRating,
      score: getRatingScore(r.selfRating),
      result: r
    }));

  if (ratingsWithScores.length === 0) {
    return {
      averageRating: '未評価',
      averageScore: 0,
      totalRatings: 0,
      ratingDistribution: {},
      hasLowRatingEscapes: false,
      hasHighRatingDeaths: false
    };
  }

  const averageScore = ratingsWithScores.reduce((sum, r) => sum + r.score, 0) / ratingsWithScores.length;
  const averageRating = getScoreRating(averageScore);
  
  // 評価分布
  const ratingDistribution = {};
  ratingsWithScores.forEach(r => {
    ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
  });

  // 低評価でも脱出した試合（謙虚さ・運の良さ）
  const hasLowRatingEscapes = ratingsWithScores.some(r => 
    r.score <= 2 && r.result.survivorStatus?.['自分'] === '逃'
  );

  // 高評価でも死亡した試合（チーム事情・相手の実力）
  const hasHighRatingDeaths = ratingsWithScores.some(r => 
    r.score >= 4 && r.result.survivorStatus?.['自分'] === '死'
  );

  return {
    averageRating,
    averageScore,
    totalRatings: ratingsWithScores.length,
    ratingDistribution,
    hasLowRatingEscapes,
    hasHighRatingDeaths,
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

// 数値を自己評価に変換
const getScoreRating = (score) => {
  if (score >= 4.5) return '最高';
  if (score >= 3.5) return '良い';
  if (score >= 2.5) return '普通';
  if (score >= 1.5) return '悪い';
  return '最悪';
};

// スキルレベル判定（複合的）
const determineSkillLevel = (stats, selfRatingAnalysis, results) => {
  const escapeRate = stats.escapeRate;
  const avgScore = selfRatingAnalysis.averageScore;
  
  // 自己評価が高く、脱出率も高い
  if (avgScore >= 4 && escapeRate >= 60) {
    return {
      level: '自信のある上級者',
      advice: '自己評価も脱出率も高く、実力に自信を持って良いレベルです！'
    };
  }
  
  // 自己評価は高いが脱出率が低い（相手が強い、チーム事情）
  if (avgScore >= 4 && escapeRate < 40) {
    return {
      level: '実力派プレイヤー',
      advice: '個人プレイは優秀ですが、相手やチーム事情で苦戦することが多いようです。環境要因に左右されにくい立ち回りを意識してみましょう。'
    };
  }
  
  // 自己評価は低いが脱出率が高い（謙虚、運が良い）
  if (avgScore <= 2.5 && escapeRate >= 50) {
    return {
      level: '謙虚な実力者',
      advice: '謙虚な自己評価ですが、結果はしっかり出ています。もう少し自分に自信を持って良いかもしれません！'
    };
  }
  
  // 自己評価と脱出率が両方普通
  if (avgScore >= 2.5 && avgScore <= 3.5 && escapeRate >= 30 && escapeRate <= 60) {
    return {
      level: 'バランス型プレイヤー',
      advice: '自己分析力があり、着実に成長しています。継続的な練習で更なる向上が期待できます。'
    };
  }
  
  // 自己評価も脱出率も低い
  if (avgScore <= 2.5 && escapeRate < 30) {
    return {
      level: '成長中プレイヤー',
      advice: '現在は練習段階ですが、しっかりと自己分析ができています。基礎から着実に積み上げていきましょう。'
    };
  }
  
  // その他（自己評価なしなど）
  if (escapeRate >= 50) {
    return {
      level: '安定プレイヤー',
      advice: '良好な成績を維持しています。自己評価も記録してより詳細な分析をしてみませんか？'
    };
  } else {
    return {
      level: '学習中プレイヤー',
      advice: '経験を積みながら成長中です。試合後の自己評価も記録してみると良いでしょう。'
    };
  }
};

// 自己評価に基づく褒めポイント
const generatePraiseBasedOnSelfRating = (selfRatingAnalysis, results) => {
  const praise = [];
  
  if (selfRatingAnalysis.totalRatings === 0) {
    return ['自己分析の習慣をつけると、更なる成長が期待できます'];
  }
  
  // 自己評価をきちんと記録している
  const ratingPercentage = (selfRatingAnalysis.totalRatings / results.length * 100).toFixed(0);
  if (ratingPercentage >= 70) {
    praise.push(`自己評価を${ratingPercentage}%の試合で記録しており、分析意識が高い`);
  }
  
  // 謙虚な姿勢
  if (selfRatingAnalysis.hasLowRatingEscapes) {
    praise.push('低評価でも脱出した試合があり、謙虚な自己分析ができている');
  }
  
  // 現実的な評価
  if (selfRatingAnalysis.hasHighRatingDeaths) {
    praise.push('高評価でも死亡した試合を冷静に分析でき、チーム事情や相手の実力を理解している');
  }
  
  // 安定した自己評価
  const goodRatings = Object.entries(selfRatingAnalysis.ratingDistribution)
    .filter(([rating]) => rating === '良い' || rating === '最高')
    .reduce((sum, [, count]) => sum + count, 0);
  
  if (goodRatings >= selfRatingAnalysis.totalRatings * 0.4) {
    praise.push('自分のプレイに対して適切な自信を持てている');
  }
  
  // 改善意識
  const badRatings = Object.entries(selfRatingAnalysis.ratingDistribution)
    .filter(([rating]) => rating === '悪い' || rating === '最悪')
    .reduce((sum, [, count]) => sum + count, 0);
  
  if (badRatings > 0) {
    praise.push('自分の課題を正しく認識し、改善に向けた意識がある');
  }
  
  return praise;
};

// 改善提案（自己評価ベース）
const generateImprovementSuggestions = (stats, selfRatingAnalysis, results) => {
  const suggestions = [];
  
  // 自己評価の記録を推奨
  if (selfRatingAnalysis.totalRatings < results.length * 0.5) {
    suggestions.push('1. 自己評価の記録: 試合後の振り返りを習慣化して成長を可視化');
  }
  
  // 自己評価と結果のギャップ分析
  if (selfRatingAnalysis.hasHighRatingDeaths && stats.escapeRate < 40) {
    suggestions.push('2. チーム連携強化: 個人プレイは良いので、チーム状況の把握と連携を重視');
  }
  
  // 自信向上
  if (selfRatingAnalysis.averageScore < 3 && stats.escapeRate >= 40) {
    suggestions.push('3. 自信の向上: 結果が出ているので、もう少し自分のプレイを評価してみましょう');
  }
  
  // 基本的な改善提案
  if (stats.escapeRate < 30) {
    suggestions.push('4. 基礎スキル: チェイステクニックとマップ知識の向上に集中');
  } else if (stats.escapeRate < 50) {
    suggestions.push('4. 応用技術: 状況判断と立ち回りの最適化を練習');
  } else {
    suggestions.push('4. 上級技術: 更なる安定性と一歩先の読みを身につける');
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
      <h2 style={analysisStyles.title}>🤖 AI戦績分析</h2>
      
      {analysis.stats && (
        <div style={analysisStyles.statsBox}>
          <h3 style={{ color: colors.primary, marginTop: 0 }}>📊 基本統計</h3>
          <p>総試合数: {analysis.stats.totalGames}試合</p>
          <p>脱出成功: {analysis.stats.totalEscapes}回</p>
          <p>脱出率: {analysis.stats.escapeRate}%</p>
        </div>
      )}

      <div style={analysisStyles.adviceList}>
        <h3 style={{ color: colors.primary, marginTop: 0 }}>💡 AI分析結果</h3>
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
