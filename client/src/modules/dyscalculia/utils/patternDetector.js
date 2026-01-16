export const analyzePatterns = (attempts) => {
  if (attempts.length < 3) {
    return {
      pattern: 'insufficient_data',
      confidence: 0,
      reasoning: 'Not enough attempts to identify patterns yet.'
    };
  }

  const quantityAttempts = attempts.filter(a => a.taskType === 'quantity');
  const comparisonAttempts = attempts.filter(a => a.taskType === 'comparison');
  const symbolAttempts = attempts.filter(a => a.taskType === 'symbol');

  const quantityAnalysis = analyzeStability(quantityAttempts);
  const comparisonAnalysis = analyzeStability(comparisonAttempts);
  const symbolAnalysis = analyzeStability(symbolAttempts);

  const improvementRates = [
    quantityAttempts.length > 2 ? calculateImprovementRate(quantityAttempts) : null,
    comparisonAttempts.length > 2 ? calculateImprovementRate(comparisonAttempts) : null,
    symbolAttempts.length > 2 ? calculateImprovementRate(symbolAttempts) : null
  ].filter(Boolean);

  const avgImprovement = improvementRates.length > 0
    ? improvementRates.reduce((a, b) => a + b, 0) / improvementRates.length
    : 0;

  const pattern = determinePattern(quantityAnalysis, comparisonAnalysis, symbolAnalysis, avgImprovement);
  
  return {
    pattern,
    confidence: calculateConfidence(attempts.length, improvementRates),
    reasoning: generateReasoning(quantityAnalysis, comparisonAnalysis, symbolAnalysis, avgImprovement),
    subScores: {
      quantity: quantityAnalysis.score,
      comparison: comparisonAnalysis.score,
      symbol: symbolAnalysis.score,
      improvement: avgImprovement
    }
  };
};

const analyzeStability = (attempts) => {
  if (attempts.length === 0) {
    return { score: 70, stability: 'no_data', errorRate: 0, avgLatency: 0 };
  }

  const correct = attempts.filter(a => a.correct);
  const errorRate = 1 - (correct.length / attempts.length);
  
  const errorConsistency = calculateErrorConsistency(attempts);
  const latencyTrend = calculateLatencyTrend(attempts);

  let score = 80;
  score -= errorRate * 30;
  score -= errorConsistency * 10;
  score += latencyTrend * 5;
  
  score = Math.max(20, Math.min(100, score));

  return {
    score,
    stability: errorConsistency > 0.7 ? 'consistent_errors' : 'variable',
    errorRate,
    avgLatency: attempts.reduce((sum, a) => sum + a.latency, 0) / attempts.length,
    errorConsistency
  };
};

const calculateErrorConsistency = (attempts) => {
  const errors = attempts.filter(a => !a.correct);
  if (errors.length < 2) return 0;

  const errorPatterns = errors.map(e => `${e.selectedAnswer}-${e.correctAnswer}`);
  const patternCounts = {};
  errorPatterns.forEach(p => patternCounts[p] = (patternCounts[p] || 0) + 1);
  
  const maxRepeat = Math.max(...Object.values(patternCounts));
  return maxRepeat / errors.length;
};

const calculateLatencyTrend = (attempts) => {
  if (attempts.length < 3) return 0;

  const firstHalf = attempts.slice(0, Math.floor(attempts.length / 2));
  const secondHalf = attempts.slice(Math.floor(attempts.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, a) => sum + a.latency, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, a) => sum + a.latency, 0) / secondHalf.length;
  
  return (firstAvg - secondAvg) / firstAvg;
};

const calculateImprovementRate = (attempts) => {
  if (attempts.length < 3) return 0;

  const sorted = [...attempts].sort((a, b) => a.timestamp - b.timestamp);
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

  const firstCorrect = firstHalf.filter(a => a.correct).length / firstHalf.length;
  const secondCorrect = secondHalf.filter(a => a.correct).length / secondHalf.length;

  return Math.max(-1, Math.min(1, secondCorrect - firstCorrect));
};

const determinePattern = (quantity, comparison, symbol, improvement) => {
  const hasConsistentErrors = 
    quantity.stability === 'consistent_errors' ||
    comparison.stability === 'consistent_errors' ||
    symbol.stability === 'consistent_errors';

  const hasLowImprovement = improvement < 0.1;
  const hasHighErrors = quantity.errorRate > 0.4 || comparison.errorRate > 0.4;

  if (hasConsistentErrors && (hasLowImprovement || hasHighErrors)) {
    return 'possible_dyscalculia_signal';
  }

  if (improvement > 0.2 || (!hasConsistentErrors && !hasHighErrors)) {
    return 'exposure_related';
  }

  return 'unclear';
};

const calculateConfidence = (attemptCount, improvementRates) => {
  let confidence = Math.min(attemptCount / 10, 0.8);
  if (improvementRates.length > 0) {
    confidence += 0.1;
  }
  return Math.min(confidence, 0.95);
};

const generateReasoning = (quantity, comparison, symbol, improvement) => {
  const reasons = [];

  if (quantity.errorRate > 0.3) {
    reasons.push('quantity recognition showed elevated error rates');
  }
  if (comparison.errorRate > 0.3) {
    reasons.push('comparison tasks were frequently challenging');
  }
  if (symbol.errorRate > 0.4) {
    reasons.push('symbol-based tasks were notably difficult');
  }
  if (quantity.stability === 'consistent_errors') {
    reasons.push('quantity errors were consistent rather than variable');
  }
  if (symbol.stability === 'consistent_errors') {
    reasons.push('symbol errors repeated in similar patterns');
  }
  if (improvement > 0.2) {
    reasons.push('performance improved notably with practice');
  }
  if (improvement < 0.05) {
    reasons.push('practice did not lead to noticeable improvement');
  }

  if (reasons.length === 0) {
    return 'Performance was generally stable across tasks.';
  }

  return reasons.join('; ') + '.';
};

export const calculateOverallScore = (attempts) => {
  const analysis = analyzePatterns(attempts);
  
  let score = 70;
  score += analysis.subScores.improvement * 20;
  
  const avgSubScore = (
    analysis.subScores.quantity + 
    analysis.subScores.comparison + 
    analysis.subScores.symbol
  ) / 3;
  
  score = (score * 0.4) + (avgSubScore * 0.6);
  score = Math.max(0, Math.min(100, score));

  return Math.round(score);
};
