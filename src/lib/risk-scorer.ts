import { SecurityEvent } from './types/event';

const SEVERITY_WEIGHTS: Record<string, number> = {
  'Critical': 80,
  'High': 60,
  'Medium': 40,
  'Low': 20,
  'Informational': 10,
};

export function calculateRiskScore(event: SecurityEvent): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // 1. Base score from severity
  const baseScore = SEVERITY_WEIGHTS[event.severity] || 10;
  score += baseScore;
  factors.push(`Base severity '${event.severity}' (+${baseScore})`);

  // 2. Penalty for failed outcomes (often indicates an active attack or misconfiguration)
  if (event.outcome === 'Failure') {
    score += 10;
    factors.push('Failed outcome indicates potential attack or misconfiguration (+10)');
  }

  // 3. Bonus for triggered detection rules
  if (event.rule_matches.length > 0) {
    const ruleBonus = event.rule_matches.length * 10;
    score += ruleBonus;
    factors.push(`${event.rule_matches.length} detection rule(s) triggered (+${ruleBonus})`);
  }

  // Cap the score at 100
  score = Math.min(score, 100);

  return { score, factors };
}