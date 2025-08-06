import { useEffect, useState } from "react";
import { Card } from "./ui/card";

interface TambolaTicketProps {
  ticketNumber: number;
  onNumberClick?: (number: number) => void;
  markedNumbers?: Set<number>;
  isGenerating?: boolean;
}

export const TambolaTicket = ({ 
  ticketNumber, 
  onNumberClick, 
  markedNumbers = new Set(),
  isGenerating = false 
}: TambolaTicketProps) => {
  const [ticket, setTicket] = useState<(number | null)[][]>([]);

  const generateTicket = () => {
    const ticket: (number | null)[][] = [];
    
    // Create 3 rows, 9 columns
    for (let row = 0; row < 3; row++) {
      const currentRow: (number | null)[] = new Array(9).fill(null);
      ticket.push(currentRow);
    }

    // Generate numbers for each column
    for (let col = 0; col < 9; col++) {
      const minNum = col * 10 + 1;
      const maxNum = col === 8 ? 90 : (col + 1) * 10;
      
      // Generate unique numbers for this column
      const availableNumbers = [];
      for (let i = minNum; i <= maxNum; i++) {
        availableNumbers.push(i);
      }
      
      // Shuffle and pick 1-3 numbers per column (ensuring 5 per row total)
      const shuffled = availableNumbers.sort(() => Math.random() - 0.5);
      const numbersInColumn = Math.min(3, shuffled.length);
      
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
          const minNum = col * 10 + 1;
          const maxNum = col === 8 ? 90 : (col + 1) * 10;
          
          // Find unused number in this column
          const usedInColumn = [];
          for (let r = 0; r < 3; r++) {
            if (ticket[r][col] !== null) {
              usedInColumn.push(ticket[r][col]);
            }
          }
          
          let availableNums = [];
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

    setTicket(ticket);
  };

  useEffect(() => {
    generateTicket();
  }, [ticketNumber]);

  const getCellColor = (colIndex: number) => {
    const colors = [
      'bg-casino-gold/10 border-casino-gold/50 hover:bg-casino-gold/20',
      'bg-casino-gold/12 border-casino-gold/50 hover:bg-casino-gold/20', 
      'bg-casino-gold/14 border-casino-gold/50 hover:bg-casino-gold/20',
      'bg-casino-gold/16 border-casino-gold/50 hover:bg-casino-gold/20',
      'bg-casino-gold/18 border-casino-gold/50 hover:bg-casino-gold/20',
      'bg-casino-gold/20 border-casino-gold/50 hover:bg-casino-gold/25',
      'bg-casino-gold/22 border-casino-gold/50 hover:bg-casino-gold/25',
      'bg-casino-gold/24 border-casino-gold/50 hover:bg-casino-gold/25',
      'bg-casino-gold/26 border-casino-gold/50 hover:bg-casino-gold/25'
    ];
    return colors[colIndex];
  };

  return (
    <Card className={`p-6 shadow-felt bg-gradient-felt border-4 border-casino-wood transition-all duration-500 ${
      isGenerating ? 'animate-bounce-in' : ''
    }`}>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-casino-gold font-serif border-b-2 border-casino-gold/30 pb-2">
          Ticket #{ticketNumber}
        </h3>
      </div>
      
      <div className="grid grid-cols-9 gap-2 select-none p-2 bg-casino-felt/50 rounded-lg border border-casino-wood/30">
        {ticket.map((row, rowIndex) =>
          row.map((number, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                aspect-square flex items-center justify-center rounded-md border-2 
                transition-all duration-300 cursor-pointer relative overflow-hidden font-serif
                ${number ? getCellColor(colIndex) : 'bg-casino-felt/30 border-casino-wood/20'}
                ${number && markedNumbers.has(number) 
                  ? 'bg-casino-gold/40 border-casino-gold shadow-gold scale-95 animate-pulse' 
                  : ''
                }
                ${number ? 'hover:scale-110 hover:shadow-gold' : ''}
              `}
              onClick={() => number && onNumberClick?.(number)}
            >
              {number && (
                <span 
                  className={`font-bold text-lg transition-all duration-200 ${
                    markedNumbers.has(number) 
                      ? 'text-casino-rim' 
                      : 'text-casino-gold drop-shadow-md'
                  }`}
                >
                  {number}
                </span>
              )}
              {number && markedNumbers.has(number) && (
                <div className="absolute inset-0 border-2 border-casino-gold rounded-md animate-gold-shimmer" 
                     style={{
                       background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)',
                       backgroundSize: '200% 100%'
                     }} 
                />
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};