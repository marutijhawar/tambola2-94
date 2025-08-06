export interface Player {
  id: number;
  name: string;
  ticket: (number | null)[][];
  markedNumbers: Set<number>;
  patterns: {
    earlyFive: boolean;
    topLine: boolean;
    middleLine: boolean;
    bottomLine: boolean;
    fourCorners: boolean;
    fullHouse: boolean;
  };
  points: number;
  disqualified?: boolean;
  disqualifiedPatterns?: Set<string>;
  highlightedNumber?: number | null;
}

export interface PatternPoints {
  earlyFive: number;
  topLine: number;
  middleLine: number;
  bottomLine: number;
  fourCorners: number;
  fullHouse: number;
}

export interface Winner {
  pattern: string;
  player: Player;
  points: number;
}

export type GameState = 'setup' | 'waiting' | 'playing' | 'paused' | 'ended';

export const PATTERN_POINTS: PatternPoints = {
  earlyFive: 10,
  topLine: 15,
  middleLine: 15,
  bottomLine: 15,
  fourCorners: 20,
  fullHouse: 25
};

export const PATTERN_NAMES: { [key: string]: string } = {
  earlyFive: 'Early Five',
  topLine: 'Top Line',
  middleLine: 'Middle Line',
  bottomLine: 'Bottom Line',
  fourCorners: 'Four Corners',
  fullHouse: 'Full House'
};