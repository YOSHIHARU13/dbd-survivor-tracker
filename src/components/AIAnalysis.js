pes / killerStats.games * 100);
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

  // 総合AI分析を生成
  const aiAdvice = generateAIStyleAdvice(stats, results);

  return { stats, advice: aiAdvice };
};ください。'],
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
