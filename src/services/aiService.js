// services/aiService.js
// Hugging Face の無料AI API

const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';

// 無料なので API キーは不要ですが、レート制限があります
// より安定した利用には Hugging Face アカウント作成を推奨

export const aiService = {
  // 戦績分析をAIで強化
  generateAdvancedAnalysis: async (basicAnalysis, results) => {
    try {
      console.log('🤖 AI分析開始...', { basicAnalysis, resultsCount: results.length });
      
      // 基本分析データをプロンプトに変換
      const prompt = createAnalysisPrompt(basicAnalysis, results);
      console.log('📝 生成されたプロンプト:', prompt.substring(0, 200) + '...');
      
      // Hugging Face API 呼び出し
      console.log('🌐 Hugging Face API 呼び出し中...');
      const response = await callHuggingFaceAPI(prompt);
      console.log('📥 API応答:', response);
      
      if (response && response.length > 0) {
        const aiAdvice = response[0].generated_text || response[0].text || '';
        console.log('✅ AI分析完了:', aiAdvice.substring(0, 100) + '...');
        return {
          success: true,
          advice: aiAdvice,
          source: 'Hugging Face AI'
        };
      } else {
        throw new Error('AI応答が空です');
      }
      
    } catch (error) {
      console.warn('❌ AI分析エラー:', error);
      return {
        success: false,
        error: error.message,
        fallback: generateFallbackAdvice(basicAnalysis)
      };
    }
  },

  // シンプルなAIチャット機能
  generateAdvice: async (question) => {
    try {
      const prompt = `Dead by Daylight について質問です: ${question}\n\n具体的で実用的なアドバイスをお願いします:`;
      
      const response = await callHuggingFaceAPI(prompt);
      
      if (response && response.length > 0) {
        return {
          success: true,
          advice: response[0].generated_text || response[0].text,
          source: 'AI Assistant'
        };
      }
      
      throw new Error('AI応答を取得できませんでした');
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: 'AIサービスが一時的に利用できません。後でもう一度お試しください。'
      };
    }
  }
};

// Hugging Face API 呼び出し
const callHuggingFaceAPI = async (prompt) => {
  // より良い応答のため複数のモデルを試す
  const models = [
    'microsoft/DialoGPT-medium',
    'facebook/blenderbot-400M-distill',
    'microsoft/DialoGPT-small'
  ];
  
  for (const model of models) {
    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 500, // より長い応答
            temperature: 0.8, // より創造的
            do_sample: true,
            top_p: 0.95,
            top_k: 50,
            repetition_penalty: 1.1
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${model}で成功`);
        return result;
      }
    } catch (error) {
      console.warn(`${model}で失敗:`, error);
      continue;
    }
  }
  
  throw new Error('すべてのAIモデルで応答を取得できませんでした');
};

// 分析プロンプトを生成
const createAnalysisPrompt = (basicAnalysis, results) => {
  const stats = basicAnalysis.stats;
  const recentGames = results.slice(0, 10); // 最新10試合
  
  // より詳細な傾向分析
  const trends = analyzeTrends(results);
  const memoInsights = analyzeMemosForInsights(results);
  
  let prompt = `Dead by Daylight プレイヤーの戦績分析です。あなたは経験豊富なDBDコーチとして、具体的で実践的なアドバイスをしてください。

【プレイヤーの基本データ】
総試合数: ${stats.totalGames}試合
全体脱出率: ${stats.escapeRate}%
脱出成功数: ${stats.totalEscapes}回

【最近の戦績傾向】
${trends.recentTrend}

【苦手キラー分析】
${stats.weakKillers.length > 0 ? 
  stats.weakKillers.map(k => `${k.killer}: 脱出率${k.winRate}% (${k.games}試合) - 特に苦戦`).join('\n') : 
  '特に苦手なキラーは見当たりません'}

【プレイヤーのメモから読み取れること】
${memoInsights}

【最近10試合の詳細】
${recentGames.map((r, i) => {
  const escapedCount = Object.values(r.survivorStatus || {}).filter(s => s === '逃').length;
  return `${i+1}. ${r.killer}戦@${r.stage}: 自分(${r.survivorStatus?.自分 || '不明'}), チーム脱出${escapedCount}人, 評価:${r.selfRating}, メモ:${r.memo || 'なし'}`;
}).join('\n')}

【コーチングしてください】
上記のデータを基に、このプレイヤーに対して：
1. 現在の強みと課題
2. 最優先で改善すべきポイント
3. 具体的な練習方法
4. キラー別の立ち回りアドバイス
5. モチベーション向上のコメント

日本語で、親しみやすく、かつ実践的なアドバイスをお願いします。`;

  return prompt;
};

// 戦績の傾向を分析
const analyzeTrends = (results) => {
  if (results.length < 3) {
    return { recentTrend: "データが少ないため傾向分析は困難です" };
  }
  
  const recent5 = results.slice(0, 5);
  const older5 = results.slice(5, 10);
  
  const recent5Escapes = recent5.filter(r => r.survivorStatus?.自分 === '逃').length;
  const older5Escapes = older5.filter(r => r.survivorStatus?.自分 === '逃').length;
  
  const recentRate = (recent5Escapes / recent5.length * 100).toFixed(1);
  const olderRate = older5.length > 0 ? (older5Escapes / older5.length * 100).toFixed(1) : 0;
  
  let trendText = `最近5試合の脱出率: ${recentRate}%`;
  
  if (older5.length > 0) {
    const diff = recentRate - olderRate;
    if (diff > 10) {
      trendText += ` (前の5試合${olderRate}%から大幅改善!)`;
    } else if (diff > 0) {
      trendText += ` (前の5試合${olderRate}%から微改善)`;
    } else if (diff < -10) {
      trendText += ` (前の5試合${olderRate}%から悪化...)`;
    } else {
      trendText += ` (前の5試合${olderRate}%とほぼ同じ)`;
    }
  }
  
  // 最近よく戦うキラー
  const recentKillers = recent5.map(r => r.killer);
  const killerFreq = {};
  recentKillers.forEach(k => killerFreq[k] = (killerFreq[k] || 0) + 1);
  const mostFrequent = Object.entries(killerFreq).sort((a,b) => b[1] - a[1])[0];
  
  if (mostFrequent && mostFrequent[1] >= 2) {
    trendText += `\n最近は${mostFrequent[0]}との対戦が多い(${mostFrequent[1]}回)`;
  }
  
  return { recentTrend: trendText };
};

// メモから洞察を抽出
const analyzeMemosForInsights = (results) => {
  const allMemos = results.map(r => r.memo || '').filter(m => m.trim().length > 0);
  
  if (allMemos.length === 0) {
    return "メモの記録がないため、プレイ中の気づきが把握できません";
  }
  
  const memoText = allMemos.join(' ').toLowerCase();
  const insights = [];
  
  // キーワード分析
  const keywords = {
    'チェイス': 'チェイス技術への関心が高い',
    '発電機': '発電機修理を重視している',
    'キャンプ': 'キャンプ対策で悩んでいる',
    'トンネル': 'トンネル対策が課題',
    '救助': 'チームプレイを意識している',
    '隠れ': 'ステルスプレイを心がけている',
    'ミス': '自分のミスを振り返る習慣がある',
    '負け': '敗戦から学ぼうとする姿勢',
    '勝ち': '成功体験を記録している',
    'パーク': 'ビルド研究に興味がある'
  };
  
  Object.entries(keywords).forEach(([keyword, meaning]) => {
    if (memoText.includes(keyword)) {
      insights.push(meaning);
    }
  });
  
  if (insights.length === 0) {
    insights.push("具体的なメモを残しており、真剣にプレイに取り組んでいる");
  }
  
  // メモの傾向
  if (allMemos.length > results.length * 0.7) {
    insights.push("記録を丁寧に残している（改善意識が高い）");
  }
  
  return insights.join('、');
};

// AI失敗時のフォールバックアドバイス
const generateFallbackAdvice = (basicAnalysis) => {
  const stats = basicAnalysis.stats;
  const advice = [];
  
  // 個人的な分析コメント
  advice.push('🤖 AI分析サービスが一時的に利用できませんが、戦績から以下のことが読み取れます：');
  
  // 脱出率に応じたアドバイス
  if (stats.escapeRate < 20) {
    advice.push(`\n📊 脱出率${stats.escapeRate}%はまだ改善の余地があります。まずは基本的なチェイステクニック（板・窓の使い方）から練習してみてください。`);
    advice.push('💡 おすすめ練習: カスタムマッチでマップを覚える、YouTube動画でチェイステクニックを学ぶ');
  } else if (stats.escapeRate < 40) {
    advice.push(`\n📊 脱出率${stats.escapeRate}%は平均的です。次のステップとして、キラー別の対策を覚えていきましょう。`);
    advice.push('💡 おすすめ練習: 苦手キラーの能力と対策を重点的に学習');
  } else if (stats.escapeRate < 60) {
    advice.push(`\n📊 脱出率${stats.escapeRate}%は良好です！さらなる向上のため、チーム連携と上級テクニックを磨きましょう。`);
    advice.push('💡 おすすめ練習: 救助タイミング、発電機効率、上級チェイステクニック');
  } else {
    advice.push(`\n📊 脱出率${stats.escapeRate}%は素晴らしい成績です！この調子で継続し、さらに安定した成績を目指しましょう。`);
    advice.push('💡 現在のレベル維持と、新しいキラー対策の習得が重要です');
  }
  
  // 試合数に応じたコメント
  if (stats.totalGames < 5) {
    advice.push('\n📈 まだ試合数が少ないので、もう少しプレイしてから詳細な分析をしてみてください。');
  } else if (stats.totalGames < 20) {
    advice.push('\n📈 良いペースでプレイされています。継続することで、より詳細な傾向が見えてきます。');
  } else {
    advice.push('\n📈 十分な試合数が蓄積されています。データに基づいた的確な改善が可能です。');
  }
  
  // 苦手キラーがいる場合
  if (stats.weakKillers.length > 0) {
    const topWeak = stats.weakKillers[0];
    advice.push(`\n⚠️ ${topWeak.killer}が特に苦手のようです（脱出率${topWeak.winRate}%）。`);
    advice.push(`💡 ${topWeak.killer}の能力と基本的な対策を調べて、練習してみてください。`);
  }
  
  // 得意キラーがいる場合
  if (stats.strongKillers.length > 0) {
    const topStrong = stats.strongKillers[0];
    advice.push(`\n✅ ${topStrong.killer}は得意なようです（脱出率${topStrong.winRate}%）！`);
    advice.push(`この立ち回りを他のキラー戦でも活かしてみてください。`);
  }
  
  advice.push('\n🔄 しばらく時間をおいてから、もう一度AI分析をお試しください。より詳細なアドバイスが得られるかもしれません。');
  
  return advice.join('');
};

// テスト用
console.log('✅ aiService.js が正常にロードされました');