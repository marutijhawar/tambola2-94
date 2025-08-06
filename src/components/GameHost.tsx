import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Volume2, Play, Pause, RotateCcw, Users, Trophy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PlayerTicket } from "./PlayerTicket";
import { GameCommands } from "./GameCommands";
import { Leaderboard } from "./Leaderboard";
import { Player, GameState, Winner, PATTERN_POINTS, PATTERN_NAMES } from "@/types/game";
export const GameHost = () => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(5);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [claimedPatterns, setClaimedPatterns] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameReady, setGameReady] = useState(false);
  const {
    toast
  } = useToast();
  const generateTambolaTicket = (): (number | null)[][] => {
    const ticket: (number | null)[][] = [];

    // Create 3 rows, 9 columns
    for (let row = 0; row < 3; row++) {
      const currentRow: (number | null)[] = new Array(9).fill(null);
      ticket.push(currentRow);
    }

    // Generate numbers for each column (1-9: 1-10, 11-20, ..., 81-90)
    for (let col = 0; col < 9; col++) {
      const minNum = col === 0 ? 1 : col * 10 + 1;
      const maxNum = col === 8 ? 90 : (col + 1) * 10;

      // Get available numbers for this column
      const availableNumbers = [];
      for (let i = minNum; i <= maxNum; i++) {
        availableNumbers.push(i);
      }

      // Shuffle and pick random numbers for this column
      const shuffled = availableNumbers.sort(() => Math.random() - 0.5);
      const numbersInColumn = Math.min(3, Math.floor(Math.random() * 3) + 1);

      // Place numbers randomly in column
      const positions = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, numbersInColumn);
      positions.forEach((pos, idx) => {
        if (idx < shuffled.length) {
          ticket[pos][col] = shuffled[idx];
        }
      });
    }

    // Ensure each row has exactly 5 numbers
    for (let row = 0; row < 3; row++) {
      const numbersInRow = ticket[row].filter(n => n !== null).length;
      if (numbersInRow < 5) {
        // Add more numbers
        const emptyCols = ticket[row].map((val, idx) => val === null ? idx : -1).filter(idx => idx !== -1);
        const needMore = 5 - numbersInRow;
        for (let i = 0; i < needMore && i < emptyCols.length; i++) {
          const col = emptyCols[i];
          const minNum = col === 0 ? 1 : col * 10 + 1;
          const maxNum = col === 8 ? 90 : (col + 1) * 10;

          // Find unused number in this column
          const usedInColumn: number[] = [];
          for (let r = 0; r < 3; r++) {
            if (ticket[r][col] !== null) {
              usedInColumn.push(ticket[r][col] as number);
            }
          }
          const availableNums = [];
          for (let num = minNum; num <= maxNum; num++) {
            if (!usedInColumn.includes(num)) {
              availableNums.push(num);
            }
          }
          if (availableNums.length > 0) {
            ticket[row][col] = availableNums[Math.floor(Math.random() * availableNums.length)];
          }
        }
      } else if (numbersInRow > 5) {
        // Remove excess numbers
        const numberedCols = ticket[row].map((val, idx) => val !== null ? idx : -1).filter(idx => idx !== -1);
        const toRemove = numbersInRow - 5;
        for (let i = 0; i < toRemove; i++) {
          const randomCol = numberedCols[Math.floor(Math.random() * numberedCols.length)];
          ticket[row][randomCol] = null;
          numberedCols.splice(numberedCols.indexOf(randomCol), 1);
        }
      }
    }
    return ticket;
  };
  const setupGame = () => {
    const playerNames = ["Ravi", "Priya", "Amit", "Sneha", "Rajesh", "Pooja", "Vikram", "Deepa", "Arjun", "Kavya"];
    const selectedPlayers: Player[] = [];
    for (let i = 0; i < numberOfPlayers; i++) {
      selectedPlayers.push({
        id: i + 1,
        name: playerNames[i] || `Player ${i + 1}`,
        ticket: generateTambolaTicket(),
        markedNumbers: new Set(),
        patterns: {
          earlyFive: false,
          topLine: false,
          middleLine: false,
          bottomLine: false,
          fourCorners: false,
          fullHouse: false
        },
        points: 0,
        disqualified: false,
        disqualifiedPatterns: new Set()
      });
    }
    setPlayers(selectedPlayers);
    setGameState('waiting');
    setGameReady(true);
    setClaimedPatterns(new Set());
    setWinners([]);
  };
  const numberNicknames: {
    [key: number]: string;
  } = {
    1: "Nelson's Column",
    2: "One Little Duck",
    3: "Cup of Tea",
    4: "Knock at the Door",
    5: "Man Alive",
    6: "Tom Mix",
    7: "Lucky Seven",
    8: "Garden Gate",
    9: "Doctor's Orders",
    10: "Boris's Den",
    11: "Legs Eleven",
    12: "One Dozen",
    13: "Unlucky for Some",
    14: "Valentine's Day",
    15: "Young and Keen",
    16: "Sweet Sixteen",
    17: "Dancing Queen",
    18: "Coming of Age",
    19: "Goodbye Teens",
    20: "One Score",
    21: "Royal Salute",
    22: "Two Little Ducks",
    30: "Dirty Gertie",
    33: "Two Little Fleas",
    44: "Droopy Drawers",
    45: "Halfway There",
    50: "Half Century",
    55: "Snakes Alive",
    66: "Clickety Click",
    69: "Either Way Up",
    77: "Sunset Strip",
    88: "Two Fat Ladies",
    90: "Top of the Shop"
  };
  const getAvailableNumbers = () => {
    return Array.from({
      length: 90
    }, (_, i) => i + 1).filter(num => !calledNumbers.includes(num));
  };
  const speakNumber = (number: number) => {
    if (!window.speechSynthesis) return;
    const nickname = numberNicknames[number];
    const text = nickname ? `${number}, ${nickname}` : number.toString();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.7;
    utterance.pitch = 1.1;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  };
  const checkPatterns = (player: Player): string[] => {
    const {
      ticket,
      markedNumbers
    } = player;
    const wins: string[] = [];

    // Get all numbers from ticket
    const allTicketNumbers = ticket.flat().filter(n => n !== null) as number[];
    const markedTicketNumbers = allTicketNumbers.filter(n => markedNumbers.has(n));

    // Early Five
    if (!player.patterns.earlyFive && markedTicketNumbers.length >= 5) {
      wins.push('earlyFive');
    }

    // Check lines
    for (let row = 0; row < 3; row++) {
      const rowNumbers = ticket[row].filter(n => n !== null) as number[];
      const markedInRow = rowNumbers.filter(n => markedNumbers.has(n));
      if (markedInRow.length === rowNumbers.length) {
        const lineNames = ['topLine', 'middleLine', 'bottomLine'];
        const lineName = lineNames[row];
        if (!player.patterns[lineName as keyof typeof player.patterns]) {
          wins.push(lineName);
        }
      }
    }

    // Four Corners
    const corners = [ticket[0][0], ticket[0][8], ticket[2][0], ticket[2][8]].filter(n => n !== null) as number[];
    if (!player.patterns.fourCorners && corners.every(n => markedNumbers.has(n))) {
      wins.push('fourCorners');
    }

    // Full House
    if (!player.patterns.fullHouse && markedTicketNumbers.length === allTicketNumbers.length) {
      wins.push('fullHouse');
    }
    return wins;
  };
  const handleNumberClick = (playerId: number, number: number) => {
    if (gameState !== 'playing' || !calledNumbers.includes(number)) return;
    setPlayers(prevPlayers => prevPlayers.map(player => {
      if (player.id === playerId) {
        const newMarkedNumbers = new Set([...player.markedNumbers, number]);
        return {
          ...player,
          markedNumbers: newMarkedNumbers
        };
      }
      return player;
    }));
    toast({
      title: "Number Marked! ✓",
      description: `${players.find(p => p.id === playerId)?.name} marked ${number}`,
      duration: 2000
    });
  };
  const handlePatternClaim = (playerId: number, pattern: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player || claimedPatterns.has(pattern)) return;

    // Check if player is disqualified for this pattern
    if (player.disqualifiedPatterns?.has(pattern)) {
      toast({
        title: "Claim Denied! ❌",
        description: `${player.name} is disqualified from claiming ${pattern}`,
        duration: 3000
      });
      return;
    }

    // Verify the pattern is actually complete
    const isValidClaim = verifyPatternClaim(player, pattern);
    if (isValidClaim) {
      const points = PATTERN_POINTS[pattern as keyof typeof PATTERN_POINTS];
      
      // Award the pattern and points
      setPlayers(prevPlayers => prevPlayers.map(p => p.id === playerId ? {
        ...p,
        patterns: {
          ...p.patterns,
          [pattern]: true
        },
        points: p.points + points
      } : p));
      
      setClaimedPatterns(prev => new Set([...prev, pattern]));
      setWinners(prev => [...prev, {
        pattern,
        player,
        points
      }]);
      
      toast({
        title: "WINNER! 🏆",
        description: `${player.name} wins ${PATTERN_NAMES[pattern]} for ${points} points!`,
        duration: 5000
      });

      // Speak the win
      if (window.speechSynthesis) {
        const winText = `${player.name} wins ${PATTERN_NAMES[pattern]} for ${points} points!`;
        const utterance = new SpeechSynthesisUtterance(winText);
        utterance.rate = 0.8;
        utterance.pitch = 1.3;
        window.speechSynthesis.speak(utterance);
      }
    } else {
      // False claim - disqualify for this pattern
      setPlayers(prevPlayers => prevPlayers.map(p => p.id === playerId ? {
        ...p,
        disqualified: true,
        disqualifiedPatterns: new Set([...(p.disqualifiedPatterns || []), pattern])
      } : p));
      toast({
        title: "False Claim! ❌",
        description: `${player.name} is disqualified from ${pattern} for premature claim`,
        duration: 4000
      });

      // Speak the disqualification
      if (window.speechSynthesis) {
        const disqualText = `False claim by ${player.name}. Disqualified from this pattern.`;
        const utterance = new SpeechSynthesisUtterance(disqualText);
        utterance.rate = 0.8;
        utterance.pitch = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }
  };
  const verifyPatternClaim = (player: Player, pattern: string): boolean => {
    const {
      ticket,
      markedNumbers
    } = player;
    const allTicketNumbers = ticket.flat().filter(n => n !== null) as number[];
    const markedTicketNumbers = allTicketNumbers.filter(n => markedNumbers.has(n));
    switch (pattern) {
      case 'earlyFive':
        return markedTicketNumbers.length >= 5;
      case 'topLine':
        const topRowNumbers = ticket[0].filter(n => n !== null) as number[];
        return topRowNumbers.length === 5 && topRowNumbers.every(n => markedNumbers.has(n));
      case 'middleLine':
        const middleRowNumbers = ticket[1].filter(n => n !== null) as number[];
        return middleRowNumbers.length === 5 && middleRowNumbers.every(n => markedNumbers.has(n));
      case 'bottomLine':
        const bottomRowNumbers = ticket[2].filter(n => n !== null) as number[];
        return bottomRowNumbers.length === 5 && bottomRowNumbers.every(n => markedNumbers.has(n));
      case 'fourCorners':
        // Check that all 4 corner positions have numbers and are marked
        const corners = [ticket[0][0], ticket[0][8], ticket[2][0], ticket[2][8]];
        return corners.every(n => n !== null && markedNumbers.has(n));
      case 'fullHouse':
        return allTicketNumbers.length === 15 && markedTicketNumbers.length === 15;
      default:
        return false;
    }
  };
  const pickNextNumber = () => {
    if (gameState !== 'playing') return;
    const available = getAvailableNumbers();
    if (available.length === 0) {
      setGameState('ended');
      toast({
        title: "Game Complete!",
        description: "All numbers have been called. What a game!",
        duration: 3000
      });
      return;
    }
    setIsAnimating(true);

    // Dramatic number reveal
    let flashCount = 0;
    const flashInterval = setInterval(() => {
      const randomNum = available[Math.floor(Math.random() * available.length)];
      setCurrentNumber(randomNum);
      flashCount++;
      if (flashCount >= 6) {
        clearInterval(flashInterval);
        const finalNumber = available[Math.floor(Math.random() * available.length)];
        setCurrentNumber(finalNumber);
        setCalledNumbers(prev => [...prev, finalNumber]);
        setTimeout(() => {
          speakNumber(finalNumber);
          setIsAnimating(false);
        }, 500);
      }
    }, 200);
  };
  const startGame = () => {
    setGameState('playing');
    toast({
      title: "🎪 GAME STARTED!",
      description: "Let the Tambola fun begin! Good luck everyone!",
      duration: 3000
    });
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance("Welcome to Royal Tambola! Let's begin the round. Good luck everyone!");
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };
  const resetGame = () => {
    setGameState('setup');
    setCurrentNumber(null);
    setCalledNumbers([]);
    setWinners([]);
    setClaimedPatterns(new Set());
    setPlayers([]);
    setGameReady(false);
  };
  return <div className="space-y-6">
      <GameCommands onBeginRound={startGame} gameState={gameState} />
      {/* Ready State */}
      {gameState === 'waiting' && !gameReady && <Card className="p-6 bg-gradient-accent shadow-card text-center border-4 border-black">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto mb-6 border-2 border-black">
              <Users className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-4 text-stroke font-casino">Royal Tambola Ready</h2>
            <p className="text-black/80 mb-8 font-semibold">Generate tickets and get ready to play!</p>
            
            <div className="space-y-4">
              <Button onClick={setupGame} className="bg-black hover:bg-black/90 text-white border-2 border-black px-8 py-3 text-lg mr-4 shadow-lg">
                Generate {numberOfPlayers} Tickets
              </Button>
              
              <div className="flex items-center justify-center space-x-4 mt-4">
                <Button onClick={() => setNumberOfPlayers(Math.max(2, numberOfPlayers - 1))} variant="outline" className="bg-black/20 hover:bg-black/30 text-black border-black w-10 h-10 rounded-full border-2">
                  -
                </Button>
                <span className="text-black font-bold text-lg border-2 border-black bg-white px-3 py-1 rounded">{numberOfPlayers} players</span>
                <Button onClick={() => setNumberOfPlayers(Math.min(10, numberOfPlayers + 1))} variant="outline" className="bg-black/20 hover:bg-black/30 text-black border-black w-10 h-10 rounded-full border-2">
                  +
                </Button>
              </div>
            </div>
          </div>
        </Card>}

      {/* Player Setup */}
      {gameState === 'setup' && <Card className="p-8 bg-gradient-to-br from-yellow-400 to-yellow-400 shadow-float text-center border-4 border-black">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto mb-6 border-2 border-black">
              <Users className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-4 font-casino">Royal Tambola</h2>
            <p className="text-black/80 mb-8 font-semibold">How many players will join the game?</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-4">
                <Button onClick={() => setNumberOfPlayers(Math.max(2, numberOfPlayers - 1))} variant="outline" className="bg-black/20 hover:bg-black/30 text-black border-black w-12 h-12 rounded-full border-2">
                  -
                </Button>
                <div className="w-24 h-24 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-black">
                  <span className="text-3xl font-bold text-black">{numberOfPlayers}</span>
                </div>
                <Button onClick={() => setNumberOfPlayers(Math.min(10, numberOfPlayers + 1))} variant="outline" className="bg-black/20 hover:bg-black/30 text-black border-black w-12 h-12 rounded-full border-2">
                  +
                </Button>
              </div>
              
              <p className="text-black/60 text-sm font-semibold">Choose between 2-10 players</p>
              
              <Button onClick={setupGame} className="bg-black hover:bg-black/90 text-white border-2 border-black px-8 py-3 text-lg shadow-lg">
                Generate Tickets & Start Game
              </Button>
            </div>
          </div>
        </Card>}

      {/* Game Controls */}
      {gameState !== 'setup' && gameReady && <Card className="p-6 bg-gradient-accent shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Tambola Game Host</h2>
              <p className="text-white/80">Managing {players.length} players • Standard 1-90 rules</p>
            </div>
          </div>

          <div className="flex gap-2">
            {gameState === 'waiting' && <Button onClick={startGame} className="p-6 bg-gradient-accent shadow-card text-black">
                <Play className="w-4 h-4 mr-2" />
                Begin the Round
              </Button>}
            
            {gameState === 'playing' && <>
                <Button onClick={() => setGameState('paused')} variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                
                <Button onClick={pickNextNumber} disabled={isAnimating} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Volume2 className="w-4 h-4 mr-2" />
                  {isAnimating ? 'Calling...' : 'Call Number'}
                </Button>
              </>}
            
            {gameState === 'paused' && <Button onClick={() => setGameState('playing')} className="bg-success hover:bg-success/90 text-success-foreground">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>}
            
            <Button onClick={resetGame} variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>
        </div>
        </Card>}

      {/* Current Number Display */}
      {gameState !== 'waiting' && gameState !== 'setup' && gameReady && <Card className="p-8 text-center bg-gradient-to-br from-yellow-400 to-yellow-400 shadow-float border-4 border-black">
          <h3 className="text-xl font-bold text-black mb-4">Current Number</h3>
          
          <div className={`
            w-32 h-32 mx-auto rounded-full flex items-center justify-center 
            bg-black/20 backdrop-blur-sm border-4 border-black mb-4
            transition-all duration-300 ${isAnimating ? 'animate-pulse-glow scale-110' : ''}
          `}>
            {currentNumber ? <span className="text-4xl font-bold text-black animate-number-pop">
                {currentNumber}
              </span> : <span className="text-xl text-black/70">?</span>}
          </div>

          {currentNumber && numberNicknames[currentNumber] && <p className="text-white/90 font-medium">
              "{numberNicknames[currentNumber]}"
            </p>}

          <p className="text-white/70 text-sm mt-2">
            {getAvailableNumbers().length} numbers remaining
          </p>
        </Card>}

      {/* Leaderboard */}
      <Leaderboard players={players} gameState={gameState} />

      {/* Winners Display */}
      {winners.length > 0 && <Card className="p-6 bg-success/10 border-success shadow-card">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-success" />
            <h3 className="text-lg font-bold text-success">Recent Winners</h3>
          </div>
          
          <div className="space-y-2">
            {winners.slice(-5).map((winner, index) => <div key={index} className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                <span className="font-medium">
                  {PATTERN_NAMES[winner.pattern]}
                </span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    {winner.player.name}
                  </Badge>
                  <Badge className="bg-primary text-primary-foreground font-bold">
                    +{winner.points} pts
                  </Badge>
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
              </div>)}
          </div>
        </Card>}

      {/* Player Tickets */}
      {gameState !== 'setup' && gameReady && <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {players.map(player => <PlayerTicket key={player.id} player={player} calledNumbers={calledNumbers} onNumberClick={handleNumberClick} onPatternClaim={handlePatternClaim} gameState={gameState} currentNumber={currentNumber} claimedPatterns={claimedPatterns} />)}
        </div>}

      {/* Called Numbers History */}
      {calledNumbers.length > 0 && gameState !== 'setup' && gameReady && <Card className="p-6 bg-card shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Called Numbers ({calledNumbers.length}/90)
          </h3>
          
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 max-h-48 overflow-y-auto">
            {calledNumbers.map((number, index) => <Badge key={number} variant="secondary" className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs
                  ${index === calledNumbers.length - 1 ? 'bg-primary text-primary-foreground ring-2 ring-primary/50' : 'bg-muted text-muted-foreground'}
                  animate-slide-up
                `} style={{
          animationDelay: `${index * 30}ms`
        }}>
                {number}
              </Badge>)}
          </div>
        </Card>}
    </div>;
};