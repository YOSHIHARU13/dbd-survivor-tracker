// components/AIAnalysis.js
import React, { useState } from 'react';
import { colors } from '../styles/commonStyles';
import { aiService } from '../services/aiService';

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

// 分析ロジック
const analyzeResults = (results) => {
  if (!results || results.length === 0) {
    return {
      advice: ['戦績データが不足しています。もう少し試合を重ねてから分析してみてください。'],
      stats: null
    };
  }

  const analysis = {
    advice: [],
    stats: {
      totalGames: results.length,
      totalEscapes: 0,
      escapeRate: 0,
      killerStats: {},
      weakKillers: [],
      strongKillers: []
    }
  };

  // キラー別統計
  results.forEach(result => {
    if (!result.survivorStatus) return;
    
    const myStatus = result.survivorStatus['自分'] || 
                    Object.values(result.survivorStatus)[0]; // フォールバック
    
    if (myStatus === '逃') {
      analysis.stats.totalEscapes++;
    }

    if (!analysis.stats.killerStats[result.killer]) {
      analysis.stats.killerStats[result.killer] = { games: 0, escapes: 0 };
    }
    analysis.stats.killerStats[result.killer].games++;
    if (myStatus === '逃') {
      analysis.stats.killerStats[result.killer].escapes++;
    }
  });

  // 脱出率計算
  analysis.stats.escapeRate = (analysis.stats.totalEscapes / analysis.stats.totalGames * 100).toFixed(1);

  // 苦手・得意キラー特定
  Object.entries(analysis.stats.killerStats).forEach(([killer, stats]) => {
    const winRate = (stats.escapes / stats.games * 100);
    if (stats.games >= 2) { // 2試合以上のデータがある場合のみ
      if (winRate < 30) {
        analysis.stats.weakKillers.push({ killer, winRate: winRate.toFixed(1), games: stats.games });
      } else if (winRate > 70) {
        analysis.stats.strongKillers.push({ killer, winRate: winRate.toFixed(1), games: stats.games });
      }
    }
  });

  // アドバイス生成
  // 全体的な脱出率
  if (analysis.stats.escapeRate < 25) {
    analysis.advice.push('🔴 脱出率が低めです。基本的なチェイステクニックの練習をお勧めします。');
  } else if (analysis.stats.escapeRate < 50) {
    analysis.advice.push('🟡 脱出率は平均的です。状況判断を磨いてさらなる向上を目指しましょう。');
  } else {
    analysis.advice.push('🟢 素晴らしい脱出率です！この調子で頑張ってください。');
  }

  // 苦手キラーへのアドバイス
  analysis.stats.weakKillers.forEach(({ killer, winRate, games }) => {
    analysis.advice.push(
      `❌ ${killer}が苦手のようです（脱出率${winRate}%、${games}試合）`
    );
    if (KILLER_ADVICE[killer]) {
      analysis.advice.push(`💡 ${killer}対策: ${KILLER_ADVICE[killer]}`);
    }
  });

  // 得意キラー
  if (analysis.stats.strongKillers.length > 0) {
    const strongKillerNames = analysis.stats.strongKillers.map(k => k.killer).join('、');
    analysis.advice.push(`✅ ${strongKillerNames}は得意のようです。この立ち回りを他のキラーでも活かしてみましょう。`);
  }

  // メモ分析（簡単なキーワード検索）
  const memoKeywords = {
    'チェイス': 'チェイス技術の向上に注力されていますね。窓枠と板の使い分けを意識してみてください。',
    '発電機': '発電機修理への意識が高いです。スキルチェック成功率とチームワークを重視しましょう。',
    'キャンプ': 'キャンプ対策で悩んでいるようです。セカンドチャンスや与えられた猶予などのパークが有効です。',
    'トンネル': 'トンネル対策として、DSや決死の一撃パークの使用を検討してみてください。'
  };

  const allMemos = results.map(r => r.memo || '').join(' ').toLowerCase();
  Object.entries(memoKeywords).forEach(([keyword, advice]) => {
    if (allMemos.includes(keyword.toLowerCase())) {
      analysis.advice.push(`📝 ${advice}`);
    }
  });

  // 試合数に応じたアドバイス
  if (analysis.stats.totalGames < 10) {
    analysis.advice.push('📊 さらに詳細な分析のため、もう少し試合データを蓄積してみてください。');
  }

  return analysis;
};

const AIAnalysis = ({ results }) => {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const analysis = analyzeResults(results);

  // AI分析を実行
  const runAIAnalysis = async () => {
    console.log('🔍 AI分析開始 - 戦績数:', results.length);
    console.log('🔍 分析データ:', analysis);
    
    setIsLoadingAI(true);
    try {
      console.log('🤖 AIサービス呼び出し中...');
      const aiResult = await aiService.generateAdvancedAnalysis(analysis, results);
      console.log('✅ AI応答:', aiResult);
      
      setAiAnalysis(aiResult);
      setShowAIAnalysis(true);
    } catch (error) {
      console.error('❌ AI分析エラー:', error);
      setAiAnalysis({
        success: false,
        error: 'AI分析に失敗しました: ' + error.message,
        fallback: 'しばらく時間をおいてから再度お試しください。'
      });
      setShowAIAnalysis(true);
    } finally {
      setIsLoadingAI(false);
    }
  };

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
      lineHeight: '1.4'
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: colors.primary, marginTop: 0 }}>💡 改善アドバイス</h3>
          <button
            onClick={runAIAnalysis}
            disabled={isLoadingAI || results.length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: colors.primary,
              color: colors.background,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              opacity: (isLoadingAI || results.length === 0) ? 0.6 : 1
            }}
          >
            {isLoadingAI ? '🤖 AI分析中...' : '🤖 AI詳細分析'}
          </button>
        </div>
        
        {/* 基本アドバイス */}
        <div style={{ marginBottom: showAIAnalysis ? '20px' : '0' }}>
          <h4 style={{ color: colors.primary, fontSize: '1rem', marginBottom: '10px' }}>📊 基本分析</h4>
          {analysis.advice.map((advice, index) => (
            <div key={index} style={analysisStyles.adviceItem}>
              {advice}
            </div>
          ))}
        </div>

        {/* AI分析結果 */}
        {showAIAnalysis && aiAnalysis && (
          <div style={{
            backgroundColor: colors.background,
            padding: '15px',
            borderRadius: '6px',
            border: `2px solid ${colors.primary}`,
            marginTop: '15px'
          }}>
            <h4 style={{ color: colors.primary, fontSize: '1rem', marginBottom: '10px' }}>
              🤖 AI詳細分析
              {aiAnalysis.source && (
                <span style={{ fontSize: '0.8rem', color: colors.textMuted, marginLeft: '10px' }}>
                  by {aiAnalysis.source}
                </span>
              )}
            </h4>
            
            {aiAnalysis.success ? (
              <div style={{
                ...analysisStyles.adviceItem,
                backgroundColor: colors.backgroundLight,
                whiteSpace: 'pre-wrap'
              }}>
                {aiAnalysis.advice}
              </div>
            ) : (
              <div>
                <div style={{ color: colors.error, marginBottom: '10px' }}>
                  ⚠️ {aiAnalysis.error}
                </div>
                {aiAnalysis.fallback && (
                  <div style={analysisStyles.adviceItem}>
                    {aiAnalysis.fallback}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;