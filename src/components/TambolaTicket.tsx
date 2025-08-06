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
      'bg-tambola-orange/10 border-tambola-orange',
      'bg-tambola-purple/10 border-tambola-purple', 
      'bg-tambola-blue/10 border-tambola-blue',
      'bg-tambola-green/10 border-tambola-green',
      'bg-tambola-pink/10 border-tambola-pink',
      'bg-primary/10 border-primary',
      'bg-secondary/10 border-secondary',
      'bg-accent/10 border-accent',
      'bg-warning/10 border-warning'
    ];
    return colors[colIndex];
  };

  return (
    <Card className={`p-6 shadow-card bg-gradient-to-br from-card via-card to-card/90 transition-all duration-500 ${
      isGenerating ? 'animate-bounce-in' : ''
    }`}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">Ticket #{ticketNumber}</h3>
      </div>
      
      <div className="grid grid-cols-9 gap-1 select-none">
        {ticket.map((row, rowIndex) =>
          row.map((number, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                aspect-square flex items-center justify-center rounded-lg border-2 
                transition-all duration-300 cursor-pointer relative overflow-hidden
                ${number ? getCellColor(colIndex) : 'bg-muted/30 border-muted'}
                ${number && markedNumbers.has(number) ? 'bg-success/20 border-success shadow-md scale-95' : ''}
                ${number ? 'hover:scale-105 hover:shadow-md' : ''}
              `}
              onClick={() => number && onNumberClick?.(number)}
            >
              {number && (
                <span 
                  className={`font-bold text-sm transition-all duration-200 ${
                    markedNumbers.has(number) ? 'text-success-foreground' : 'text-foreground'
                  }`}
                >
                  {number}
                </span>
              )}
              {number && markedNumbers.has(number) && (
                <div className="absolute inset-0 bg-success/10 animate-pulse-glow rounded-lg" />
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};