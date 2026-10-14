import { SecurityEvent } from './types/event';

const SEVERITY_WEIGHTS: Record<string, number> = {
  'Critical': 60,
  'High': 40,
  'Medium': 20,
  'Low': 10,
  'Informational': 5,
};

export function calculateRiskScore(event: SecurityEvent): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  const baseScore = SEVERITY_WEIGHTS[event.severity] || 10;
  score += baseScore;
  factors.push(`Base severity '${event.severity}' (+${baseScore})`);

  if (event.outcome === 'Failure') {
    score += 15;
    factors.push('Failed outcome indicates potential attack or misconfiguration (+15)');
  }

  if (event.rule_matches.length > 0) {
    const ruleBonus = event.rule_matches.length * 15;
    score += ruleBonus;
    factors.push(`${event.rule_matches.length} detection rule(s) triggered (+${ruleBonus})`);
  }

  score = Math.min(score, 100);
  return { score, factors };
}