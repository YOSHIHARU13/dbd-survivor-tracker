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

// AI風のアドバイス生成
const generateAIStyleAdvice = (stats, results) => {
  const advice = [];
  
  // AI分析ヘッダー
  advice.push('🤖 【AI戦績分析結果】\n');
  
  // スキルレベル判定
  let skillLevel, mainAdvice;
  if (stats.escapeRate >= 70) {
    skillLevel = '上級者';
    mainAdvice = 'あなたの実力は既に上級者レベルです！安定性の維持と新しい挑戦を心がけましょう。';
  } else if (stats.escapeRate >= 50) {
    skillLevel = '中上級者';
    mainAdvice = '中上級者として順調に成長中！苦手分野を克服すれば更なる飛躍が期待できます。';
  } else if (stats.escapeRate >= 30) {
    skillLevel = '中級者';
    mainAdvice = '中級者として基礎は身についています。特定のスキルに集中して練習しましょう。';
  } else if (stats.escapeRate >= 15) {
    skillLevel = '初中級者';
    mainAdvice = '基本は理解されています。チェイスと状況判断を重点的に練習しましょう。';
  } else {
    skillLevel = '初心者';
    mainAdvice = 'まだ始めたばかりですね！基礎からしっかり積み上げていきましょう。';
  }
  
  advice.push(`📊 **スキルレベル**: ${skillLevel} (脱出率 ${stats.escapeRate}%)`);
  advice.push(`💬 **総評**: ${mainAdvice}\n`);
  
  // 詳細分析
  advice.push('🔍 **詳細分析**');
  
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
  advice.push('\n🎭 **キラー対策**');
  
  if (stats.weakKillers.length > 0) {
    const weakest = stats.weakKillers[0];
    advice.push(`・**最苦手**: ${weakest.killer} (脱出率${weakest.winRate}%)`);
    
    if (KILLER_ADVICE[weakest.killer]) {
      advice.push(`  💡 ${KILLER_ADVICE[weakest.killer]}`);
    }
    
    if (stats.weakKillers.length > 1) {
      const second = stats.weakKillers[1];
      advice.push(`・**苦手**: ${second.killer} (脱出率${second.winRate}%)`);
    }
  } else {
    advice.push('・特に苦手なキラーは見当たりません。バランス良く対応できています');
  }
  
  if (stats.strongKillers.length > 0) {
    const strongest = stats.strongKillers[0];
    advice.push(`・**得意**: ${strongest.killer} (脱出率${strongest.winRate}%) この立ち回りを他でも活用！`);
  }
  
  // 改善提案
  advice.push('\n🎯 **今週の改善目標**');
  
  if (stats.escapeRate < 25) {
    advice.push('1. **基礎練習**: チェイスの基本（板・窓の使い方）をマスター');
    advice.push('2. **マップ学習**: よく使われるマップ3つの地形を覚える');
    advice.push('3. **パーク研究**: 初心者向けパーク構成を試す');
  } else if (stats.escapeRate < 50) {
    advice.push('1. **苦手克服**: 苦手キラー1体の対策を重点学習');
    advice.push('2. **チーム連携**: 救助タイミングと安全な救助方法を練習');
    advice.push('3. **効率化**: 発電機修理の効率アップ');
  } else {
    advice.push('1. **安定性向上**: 苦手シチュエーションでの立ち回り改善');
    advice.push('2. **上級テクニック**: 高度なチェイステクニックの習得');
    advice.push('3. **メンタル強化**: プレッシャー下での冷静な判断力向上');
  }
  
  // メモ分析
  const memoInsights = analyzeMemosAdvanced(results);
  if (memoInsights) {
    advice.push('\n📝 **プレイスタイル分析**');
    advice.push(memoInsights);
  }
  
  // モチベーション
  advice.push('\n💪 **応援メッセージ**');
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
