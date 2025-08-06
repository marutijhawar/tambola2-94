import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle, Star, Trophy, Hand, AlertTriangle } from "lucide-react";
import type { Player } from "./GameHost";

interface PlayerTicketProps {
  player: Player;
  calledNumbers: number[];
  onNumberClick?: (playerId: number, number: number) => void;
  onPatternClaim?: (playerId: number, pattern: string) => void;
  gameState: 'setup' | 'waiting' | 'playing' | 'paused' | 'ended';
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
      'bg-tambola-orange/20 border-tambola-orange/50',
      'bg-tambola-purple/20 border-tambola-purple/50', 
      'bg-tambola-blue/20 border-tambola-blue/50',
      'bg-tambola-green/20 border-tambola-green/50',
      'bg-tambola-pink/20 border-tambola-pink/50',
      'bg-primary/20 border-primary/50',
      'bg-secondary/20 border-secondary/50',
      'bg-accent/20 border-accent/50',
      'bg-warning/20 border-warning/50'
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
        className={`text-xs ${
          isCompleted 
            ? 'bg-success text-success-foreground animate-bounce-in' 
            : 'text-muted-foreground'
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
    <Card className={`p-4 transition-all duration-300 ${
      completedPatterns.length > 0 
        ? 'ring-2 ring-success/50 shadow-glow bg-success/5' 
        : 'shadow-card bg-card'
    }`}>
      {/* Player Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{name[0]}</span>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{name}</h4>
            <p className="text-xs text-muted-foreground">
              {markedCount}/{allTicketNumbers.length} marked
            </p>
          </div>
        </div>
        
        {completedPatterns.length > 0 && (
          <div className="flex items-center space-x-1">
            <Trophy className="w-4 h-4 text-success" />
            <span className="text-xs text-success font-bold">
              {completedPatterns.length} win{completedPatterns.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-9 gap-1 mb-4">
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
                  aspect-square flex items-center justify-center rounded border text-xs font-bold
                  transition-all duration-300 relative overflow-hidden disabled:cursor-not-allowed
                  ${number 
                    ? `${getCellColor(colIndex)} ${wasCalled && !isMarked ? 'hover:scale-105 cursor-pointer' : ''}`
                    : 'bg-transparent border-transparent'
                  }
                  ${isMarked ? 'bg-success/30 border-success text-success-foreground scale-95' : ''}
                `}
              >
                {number && (
                  <>
                    <span className={`transition-colors duration-200 ${
                      isMarked ? 'text-success-foreground' : 'text-foreground'
                    }`}>
                      {number}
                    </span>
                    {isMarked && (
                      <div className="absolute inset-0 bg-success/20 animate-pulse-glow rounded" />
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
            getPatternBadge(patternKey, isCompleted)
          )}
        </div>
        
        {/* Claim Buttons */}
        {gameState === 'playing' && getClaimablePatterns().length > 0 && (
          <div className="mt-3 p-2 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Hand className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Ready to claim:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {getClaimablePatterns().map(pattern => (
                <Button
                  key={pattern}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs bg-accent/20 hover:bg-accent/30 border-accent/50 text-accent"
                  onClick={() => onPatternClaim?.(id, pattern)}
                >
                  Claim {pattern.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Button>
              ))}
            </div>
          </div>
        )}

        {completedPatterns.length > 0 && (
          <div className="text-xs text-success font-medium">
            🎉 {completedPatterns.map(([pattern]) => 
              pattern.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
            ).join(', ')} completed!
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