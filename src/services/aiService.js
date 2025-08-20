// AIサービスの使用例とテスト

import { aiService } from './services/aiService.js';

// 1. 基本的な使用方法
const useAIAnalysis = async () => {
  // サンプルデータ
  const basicAnalysis = {
    stats: {
      totalGames: 25,
      escapeRate: 45,
      totalEscapes: 11,
      weakKillers: [
        { killer: 'ナース', winRate: 20, games: 5 },
        { killer: 'スピリット', winRate: 25, games: 4 }
      ],
      strongKillers: [
        { killer: 'トラッパー', winRate: 75, games: 4 }
      ]
    }
  };

  const results = [
    { killer: 'ナース', survivorStatus: { '自分': '逃' }, stage: 'ハダムフィールド', memo: 'ブリンク読めず苦戦' },
    { killer: 'トラッパー', survivorStatus: { '自分': '逃' }, stage: 'マクミラン', memo: '罠位置に注意' },
    { killer: 'スピリット', survivorStatus: { '自分': '死' }, stage: 'ヤマオカ', memo: 'フェイズ中の動き悪かった' },
    // ... 他の試合データ
  ];

  try {
    const analysis = await aiService.generateAdvancedAnalysis(basicAnalysis, results);
    
    console.log('🤖 AI分析結果:');
    console.log(analysis.advice);
    console.log('💰 コスト:', analysis.cost); // "完全無料"
    
    return analysis;
  } catch (error) {
    console.error('AI分析エラー:', error);
  }
};

// 2. 利用可能なプロバイダー確認
const checkProviders = () => {
  const providers = aiService.getAvailableProviders();
  
  console.log('📋 利用可能なAIプロバイダー:');
  providers.forEach(provider => {
    console.log(`${provider.name}: ${provider.description} (品質: ${provider.quality})`);
  });
  
  return providers;
};

// 3. プロバイダー切り替え（将来的に）
const switchToOllama = () => {
  // Ollamaを導入した場合の切り替え方法
  aiService.switchProvider('ollama');
  console.log('🔄 ローカルAI(Ollama)に切り替えました');
};

// 4. React コンポーネントでの使用例
const AIAnalysisComponent = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const result = await aiService.generateAdvancedAnalysis(basicAnalysis, results);
      setAnalysis(result);
    } catch (error) {
      console.error('AI分析エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={runAnalysis} disabled={loading}>
        {loading ? '分析中...' : 'AI戦績分析を実行'}
      </button>
      
      {analysis && (
        <div className="ai-analysis">
          <h3>🤖 AI分析結果 ({analysis.cost})</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {analysis.success ? analysis.advice : analysis.fallback}
          </pre>
          <small>
            分析元: {analysis.source} | 
            実行時刻: {new Date(analysis.timestamp).toLocaleString()}
          </small>
        </div>
      )}
    </div>
  );
};

// 5. 分析結果のカスタマイズ例
const customizeAnalysis = () => {
  // ルールベースの分析ロジックは aiService.js 内で
  // advancedMockAnalysis 関数をカスタマイズできます
  
  // 例：特定のキラーに対するアドバイスを追加
  // getKillerAdvice 関数を編集
  
  // 例：プレイヤーレベル判定の基準を調整
  // advancedMockAnalysis 内の escapeRate の閾値を変更
  
  console.log('💡 分析ロジックのカスタマイズは aiService.js の関数を編集してください');
};

// 6. デバッグ・テスト用
const testAIService = async () => {
  console.log('🧪 AIサービステスト開始...');
  
  // テストデータ
  const testData = {
    basicAnalysis: {
      stats: {
        totalGames: 10,
        escapeRate: 60,
        totalEscapes: 6,
        weakKillers: [],
        strongKillers: []
      }
    },
    results: [
      { killer: 'トラッパー', survivorStatus: { '自分': '逃' }, memo: 'うまく回避できた' }
    ]
  };
  
  const start = Date.now();
  const result = await aiService.generateAdvancedAnalysis(testData.basicAnalysis, testData.results);
  const duration = Date.now() - start;
  
  console.log(`✅ テスト完了 (${duration}ms)`);
  console.log('結果:', result.success ? '成功' : '失敗');
  console.log('分析長:', result.advice?.length || result.fallback?.length, '文字');
  
  return result;
};

// 使用例の実行
export const runExamples = async () => {
  console.log('🚀 AIサービス使用例を実行します...');
  
  // 1. プロバイダー確認
  checkProviders();
  
  // 2. 基本分析テスト
  await testAIService();
  
  // 3. 実際の分析実行
  await useAIAnalysis();
  
  console.log('✅ 全ての例が完了しました！');
};

// エクスポート
export { useAIAnalysis, checkProviders, switchToOllama, testAIService };
