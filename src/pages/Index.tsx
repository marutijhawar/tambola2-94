import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberPicker } from "@/components/NumberPicker";
import { TicketGenerator } from "@/components/TicketGenerator";
import { GameHost } from "@/components/GameHost";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Ticket, Dice6, RotateCcw, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [pickedNumbers, setPickedNumbers] = useState<number[]>([]);
  const [markedNumbers, setMarkedNumbers] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const handleNumberPicked = (number: number) => {
    setPickedNumbers(prev => [...prev, number]);
    setMarkedNumbers(prev => new Set([...prev, number]));
  };

  const handleNumberClick = (number: number) => {
    if (pickedNumbers.includes(number)) {
      setMarkedNumbers(prev => {
        const newSet = new Set(prev);
        if (newSet.has(number)) {
          newSet.delete(number);
          toast({
            title: "Number Unmarked",
            description: `Removed ${number} from your ticket`,
            duration: 1500
          });
        } else {
          newSet.add(number);
          toast({
            title: "Number Marked!",
            description: `Marked ${number} on your ticket`,
            duration: 1500
          });
        }
        return newSet;
      });
    }
  };

  const handleClearHistory = () => {
    setPickedNumbers([]);
    setMarkedNumbers(new Set());
    toast({
      title: "Game Reset",
      description: "All numbers cleared. Ready for a new game!",
      duration: 2000
    });
  };

  const handleNewGame = () => {
    handleClearHistory();
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Casino Wood Frame Header */}
      <header className="bg-gradient-wood shadow-wood border-b-4 border-casino-rim relative">
        <div className="absolute inset-0 bg-gradient-to-r from-casino-wood via-casino-rim to-casino-wood opacity-60"></div>
        <div className="container mx-auto px-6 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-casino-gold/20 rounded-full flex items-center justify-center shadow-gold border-2 border-casino-gold">
                <Sparkles className="w-7 h-7 text-casino-gold" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-casino-gold tracking-wide font-serif">ROYAL TAMBOLA</h1>
                <p className="text-casino-gold/80 font-serif text-lg">Premium Casino Experience</p>
              </div>
            </div>
            
            <Button
              onClick={handleNewGame}
              className="bg-casino-gold hover:bg-casino-gold-dark text-casino-rim border-2 border-casino-gold shadow-gold hover:shadow-lg transition-all duration-300 font-semibold px-6 py-3"
              variant="default"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              New Game
            </Button>
          </div>
        </div>
        
        {/* Decorative Casino Border */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-casino-gold via-casino-gold-dark to-casino-gold"></div>
      </header>

      {/* Main Content - Casino Table */}
      <main className="container mx-auto px-6 py-8">
        {/* Semi-circular Casino Table Layout */}
        <div className="relative">
          <div className="bg-gradient-felt shadow-felt rounded-t-full border-8 border-casino-wood p-8 min-h-[600px]">
            <Tabs defaultValue="host" className="space-y-8">
              {/* Casino-style Tab Navigation */}
              <div className="flex justify-center">
                <TabsList className="bg-casino-wood/80 backdrop-blur-sm shadow-wood border-4 border-casino-rim rounded-xl p-2">
                  <TabsTrigger 
                    value="host" 
                    className="flex items-center space-x-2 data-[state=active]:bg-casino-gold data-[state=active]:text-casino-rim text-casino-gold font-semibold px-6 py-3 rounded-lg transition-all duration-300"
                  >
                    <Users className="w-5 h-5" />
                    <span>Game Host</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="picker" 
                    className="flex items-center space-x-2 data-[state=active]:bg-casino-gold data-[state=active]:text-casino-rim text-casino-gold font-semibold px-6 py-3 rounded-lg transition-all duration-300"
                  >
                    <Dice6 className="w-5 h-5" />
                    <span>Number Picker</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tickets"
                    className="flex items-center space-x-2 data-[state=active]:bg-casino-gold data-[state=active]:text-casino-rim text-casino-gold font-semibold px-6 py-3 rounded-lg transition-all duration-300"
                  >
                    <Ticket className="w-5 h-5" />
                    <span>Generate Tickets</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="host" className="space-y-6">
                <GameHost />
              </TabsContent>

              <TabsContent value="picker" className="space-y-6">
                <NumberPicker
                  onNumberPicked={handleNumberPicked}
                  pickedNumbers={pickedNumbers}
                  onClearHistory={handleClearHistory}
                  enableAudio={true}
                />
              </TabsContent>

              <TabsContent value="tickets" className="space-y-6">
                <TicketGenerator
                  markedNumbers={markedNumbers}
                  onNumberClick={handleNumberClick}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Floating Chip Tray */}
          <div className="absolute bottom-4 right-4 w-20 h-16 bg-casino-wood rounded-lg shadow-wood border-2 border-casino-rim p-2">
            <div className="space-y-1">
              <div className="w-4 h-4 bg-casino-gold rounded-full mx-auto animate-chip-shuffle"></div>
              <div className="w-4 h-4 bg-red-600 rounded-full mx-auto animate-chip-shuffle" style={{animationDelay: '0.5s'}}></div>
              <div className="w-4 h-4 bg-blue-600 rounded-full mx-auto animate-chip-shuffle" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>

        {/* Casino-style Game Stats */}
        {pickedNumbers.length > 0 && (
          <Card className="mt-8 p-6 bg-casino-felt/80 backdrop-blur-sm shadow-felt border-4 border-casino-wood">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="border-r border-casino-gold/30">
                <div className="text-3xl font-bold text-casino-gold font-serif">{pickedNumbers.length}</div>
                <div className="text-sm text-casino-gold/80 font-semibold">Numbers Called</div>
              </div>
              <div className="border-r border-casino-gold/30">
                <div className="text-3xl font-bold text-casino-gold font-serif">{markedNumbers.size}</div>
                <div className="text-sm text-casino-gold/80 font-semibold">Numbers Marked</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-casino-gold font-serif">{90 - pickedNumbers.length}</div>
                <div className="text-sm text-casino-gold/80 font-semibold">Numbers Remaining</div>
              </div>
            </div>
          </Card>
        )}
      </main>

      {/* Casino Footer */}
      <footer className="bg-gradient-wood shadow-wood border-t-4 border-casino-gold py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-casino-gold font-serif text-lg">
            🎰 Royal Tambola Casino • Premium Gaming Experience • Powered by Elegance 🎰
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;