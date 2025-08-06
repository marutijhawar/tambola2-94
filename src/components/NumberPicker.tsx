import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trash2, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NumberPickerProps {
  onNumberPicked: (number: number) => void;
  pickedNumbers: number[];
  onClearHistory: () => void;
  enableAudio?: boolean;
}

export const NumberPicker = ({ 
  onNumberPicked, 
  pickedNumbers, 
  onClearHistory,
  enableAudio = true 
}: NumberPickerProps) => {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1)
    .filter(num => !pickedNumbers.includes(num));

  const speakNumber = (number: number) => {
    if (!enableAudio || !window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(number.toString());
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;
    
    // Use a more expressive voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const pickRandomNumber = () => {
    if (availableNumbers.length === 0) {
      toast({
        title: "Game Complete!",
        description: "All numbers have been picked. Start a new game?",
        variant: "default"
      });
      return;
    }

    setIsAnimating(true);
    
    // Add suspense with multiple number flashes
    let flashCount = 0;
    const flashInterval = setInterval(() => {
      const randomNum = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
      setCurrentNumber(randomNum);
      flashCount++;
      
      if (flashCount >= 5) {
        clearInterval(flashInterval);
        
        // Final number selection
        const finalNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        setCurrentNumber(finalNumber);
        
        setTimeout(() => {
          onNumberPicked(finalNumber);
          speakNumber(finalNumber);
          setIsAnimating(false);
          
          toast({
            title: `Number Called: ${finalNumber}`,
            description: `${availableNumbers.length - 1} numbers remaining`,
            duration: 2000
          });
        }, 300);
      }
    }, 150);
  };

  const getNumberColor = (number: number) => {
    if (number <= 18) return 'bg-tambola-orange text-white';
    if (number <= 36) return 'bg-tambola-purple text-white';
    if (number <= 54) return 'bg-tambola-blue text-white';
    if (number <= 72) return 'bg-tambola-green text-white';
    return 'bg-tambola-pink text-white';
  };

  return (
    <div className="space-y-6">
      {/* Current Number Display */}
      <Card className="p-6 text-center bg-gradient-accent shadow-card border-4 border-black">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-black mb-4">Number Called</h2>
          
          <div className={`
            w-32 h-32 mx-auto rounded-full flex items-center justify-center 
            bg-black/20 backdrop-blur-sm border-4 border-black
            transition-all duration-300 ${isAnimating ? 'animate-pulse-glow scale-110' : ''}
          `}>
            {currentNumber ? (
              <span className="text-4xl font-bold text-black animate-number-pop">
                {currentNumber}
              </span>
            ) : (
              <span className="text-xl text-black/70">?</span>
            )}
          </div>

          <Button
            onClick={pickRandomNumber}
            disabled={isAnimating || availableNumbers.length === 0}
            size="lg"
            className="bg-black/20 hover:bg-black/30 text-black border-black border-2 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            variant="outline"
          >
            <Volume2 className="w-5 h-5 mr-2" />
            {isAnimating ? 'Picking...' : 'Pick Number'}
          </Button>

          <p className="text-black/80 text-sm font-semibold">
            {availableNumbers.length} numbers remaining
          </p>
        </div>
      </Card>

      {/* Picked Numbers History */}
      <Card className="p-6 bg-card shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Called Numbers</h3>
          <Button
            onClick={onClearHistory}
            size="sm"
            variant="outline"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>

        {pickedNumbers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No numbers called yet. Start the game!
          </p>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto">
            {pickedNumbers.map((number, index) => (
              <Badge
                key={number}
                variant="secondary"
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold
                  ${getNumberColor(number)} animate-slide-up
                  ${index === pickedNumbers.length - 1 ? 'ring-2 ring-primary/50 scale-110' : ''}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {number}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};