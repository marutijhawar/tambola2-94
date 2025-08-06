import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle, Star, Trophy, Hand, AlertTriangle } from "lucide-react";
import type { Player, GameState } from "@/types/game";

interface PlayerTicketProps {
  player: Player;
  calledNumbers: number[];
  onNumberClick?: (playerId: number, number: number) => void;
  onPatternClaim?: (playerId: number, pattern: string) => void;
  gameState: GameState;
  currentNumber?: number | null;
  claimedPatterns?: Set<string>;
}

export const PlayerTicket = ({ 
  player, 
  calledNumbers, 
  onNumberClick, 
  onPatternClaim, 
  gameState, 
  currentNumber,
  claimedPatterns = new Set()
}: PlayerTicketProps) => {
  const { ticket, markedNumbers, patterns, name, id } = player;

  const checkPatternCompletion = (pattern: string): boolean => {
    const allTicketNumbers = ticket.flat().filter(n => n !== null) as number[];
    const markedTicketNumbers = allTicketNumbers.filter(n => markedNumbers.has(n));

    switch (pattern) {
      case 'earlyFive':
        return markedTicketNumbers.length >= 5;
      case 'topLine':
        const topRowNumbers = ticket[0].filter(n => n !== null) as number[];
        return topRowNumbers.every(n => markedNumbers.has(n));
      case 'middleLine':
        const middleRowNumbers = ticket[1].filter(n => n !== null) as number[];
        return middleRowNumbers.every(n => markedNumbers.has(n));
      case 'bottomLine':
        const bottomRowNumbers = ticket[2].filter(n => n !== null) as number[];
        return bottomRowNumbers.every(n => markedNumbers.has(n));
      case 'fourCorners':
        const corners = [ticket[0][0], ticket[0][8], ticket[2][0], ticket[2][8]];
        return corners.every(n => n !== null && markedNumbers.has(n));
      case 'fullHouse':
        return markedTicketNumbers.length === allTicketNumbers.length;
      default:
        return false;
    }
  };

  const getClaimablePatterns = () => {
    const patterns = ['earlyFive', 'topLine', 'middleLine', 'bottomLine', 'fourCorners', 'fullHouse'];
    return patterns.filter(pattern => 
      !player.patterns[pattern as keyof typeof player.patterns] && 
      !claimedPatterns.has(pattern) &&
      !player.disqualifiedPatterns?.has(pattern) &&
      checkPatternCompletion(pattern)
    );
  };

  const getCellColor = (colIndex: number) => {
    const colors = [
      'bg-casino-gold/15 border-casino-gold/50 hover:bg-casino-gold/25',
      'bg-casino-gold/17 border-casino-gold/50 hover:bg-casino-gold/25', 
      'bg-casino-gold/19 border-casino-gold/50 hover:bg-casino-gold/25',
      'bg-casino-gold/21 border-casino-gold/50 hover:bg-casino-gold/25',
      'bg-casino-gold/23 border-casino-gold/50 hover:bg-casino-gold/25',
      'bg-casino-gold/25 border-casino-gold/50 hover:bg-casino-gold/30',
      'bg-casino-gold/27 border-casino-gold/50 hover:bg-casino-gold/30',
      'bg-casino-gold/29 border-casino-gold/50 hover:bg-casino-gold/30',
      'bg-casino-gold/31 border-casino-gold/50 hover:bg-casino-gold/30'
    ];
    return colors[colIndex];
  };

  const getPatternBadge = (patternKey: string, isCompleted: boolean) => {
    const patternNames: { [key: string]: string } = {
      earlyFive: 'Early 5',
      topLine: 'Top Line',
      middleLine: 'Mid Line',
      bottomLine: 'Bottom Line',
      fourCorners: '4 Corners',
      fullHouse: 'Full House'
    };

    const patternIcons: { [key: string]: any } = {
      earlyFive: Star,
      topLine: CheckCircle,
      middleLine: CheckCircle,
      bottomLine: CheckCircle,
      fourCorners: Trophy,
      fullHouse: Trophy
    };

    const Icon = patternIcons[patternKey];

    return (
      <Badge
        key={patternKey}
        variant={isCompleted ? "default" : "outline"}
        className={`text-xs font-semibold ${
          isCompleted 
            ? 'bg-casino-gold text-casino-rim border-casino-gold animate-bounce-in shadow-gold' 
            : 'text-casino-gold/60 border-casino-gold/30'
        }`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {patternNames[patternKey]}
      </Badge>
    );
  };

  const allTicketNumbers = ticket.flat().filter(n => n !== null) as number[];
  const markedCount = allTicketNumbers.filter(n => markedNumbers.has(n)).length;
  const completedPatterns = Object.entries(patterns).filter(([_, completed]) => completed);

  return (
    <Card className={`p-4 transition-all duration-300 border-2 ${
      completedPatterns.length > 0 
        ? 'ring-4 ring-casino-gold/50 shadow-gold bg-casino-gold/10 border-casino-gold animate-pulse-glow' 
        : 'shadow-felt bg-casino-felt border-casino-wood'
    }`}>
      {/* Player Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-casino-gold/30 border-2 border-casino-gold flex items-center justify-center shadow-gold">
            <span className="text-sm font-bold text-casino-gold font-serif">{name[0]}</span>
          </div>
          <div>
            <h4 className="font-semibold text-casino-gold font-serif">{name}</h4>
            <p className="text-xs text-casino-gold/70 font-semibold">
              {markedCount}/{allTicketNumbers.length} marked
            </p>
          </div>
        </div>
        
        {completedPatterns.length > 0 && (
          <div className="flex items-center space-x-2 bg-casino-gold/20 px-3 py-1 rounded-full border border-casino-gold">
            <Trophy className="w-4 h-4 text-casino-gold" />
            <span className="text-xs text-casino-gold font-bold">
              {completedPatterns.length} WIN{completedPatterns.length !== 1 ? 'S' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-9 gap-1 mb-4 p-2 bg-casino-felt/30 rounded border border-casino-wood/30">
        {ticket.map((row, rowIndex) =>
          row.map((number, colIndex) => {
            const isMarked = number && markedNumbers.has(number);
            const wasCalled = number && calledNumbers.includes(number);
            
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                disabled={!number || !wasCalled || isMarked || gameState !== 'playing'}
                onClick={() => number && wasCalled && !isMarked && onNumberClick?.(id, number)}
                className={`
                  aspect-square flex items-center justify-center rounded border text-xs font-bold font-serif
                  transition-all duration-300 relative overflow-hidden disabled:cursor-not-allowed
                  ${number 
                    ? `${getCellColor(colIndex)} ${wasCalled && !isMarked ? 'hover:scale-110 cursor-pointer' : ''}`
                    : 'bg-transparent border-transparent'
                  }
                  ${isMarked ? 'bg-casino-gold/40 border-casino-gold text-casino-rim scale-95' : 'text-casino-gold'}
                `}
              >
                {number && (
                  <>
                    <span className={`transition-colors duration-200 ${
                      isMarked ? 'text-casino-rim' : 'text-casino-gold'
                    }`}>
                      {number}
                    </span>
                    {isMarked && (
                      <div className="absolute inset-0 border-2 border-casino-gold rounded animate-gold-shimmer" 
                           style={{
                             background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)',
                             backgroundSize: '200% 100%'
                           }} 
                      />
                    )}
                  </>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Pattern Status */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {Object.entries(patterns).map(([patternKey, isCompleted]) =>
            getPatternBadge(patternKey, isCompleted as boolean)
          )}
        </div>
        
        {/* Casino-style Claim Buttons */}
        {gameState === 'playing' && getClaimablePatterns().length > 0 && (
          <div className="mt-3 p-3 bg-casino-gold/10 rounded-lg border-2 border-casino-gold shadow-gold">
            <div className="flex items-center gap-2 mb-2">
              <Hand className="w-4 h-4 text-casino-gold" />
              <span className="text-sm font-bold text-casino-gold font-serif">READY TO CLAIM:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {getClaimablePatterns().map(pattern => (
                <Button
                  key={pattern}
                  size="sm"
                  className="h-8 px-3 text-xs bg-casino-gold hover:bg-casino-gold-dark text-casino-rim border-2 border-casino-gold shadow-gold font-bold"
                  onClick={() => onPatternClaim?.(id, pattern)}
                >
                  CLAIM {pattern.replace(/([A-Z])/g, ' $1').toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        )}

        {completedPatterns.length > 0 && (
          <div className="text-sm text-casino-gold font-bold bg-casino-gold/20 p-2 rounded border border-casino-gold">
            🏆 {completedPatterns.map(([pattern]) => 
              pattern.replace(/([A-Z])/g, ' $1').toUpperCase()
            ).join(', ')} COMPLETED!
          </div>
        )}

        {player.disqualified && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
            <AlertTriangle className="w-3 h-3" />
            Disqualified from some patterns due to false claims
          </div>
        )}
      </div>
    </Card>
  );
};