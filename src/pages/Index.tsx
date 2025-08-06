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
      {/* Header */}
      <header className="bg-gradient-primary shadow-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Smart Tambola</h1>
                <p className="text-white/80">Vibrant Digital Housie Experience</p>
              </div>
            </div>
            
            <Button
              onClick={handleNewGame}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="host" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm shadow-card">
            <TabsTrigger 
              value="host" 
              className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="w-4 h-4" />
              <span>Game Host</span>
            </TabsTrigger>
            <TabsTrigger 
              value="picker" 
              className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Dice6 className="w-4 h-4" />
              <span>Number Picker</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tickets"
              className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Ticket className="w-4 h-4" />
              <span>Generate Tickets</span>
            </TabsTrigger>
          </TabsList>

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

        {/* Game Stats */}
        {pickedNumbers.length > 0 && (
          <Card className="mt-8 p-6 bg-card/80 backdrop-blur-sm shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{pickedNumbers.length}</div>
                <div className="text-sm text-muted-foreground">Numbers Called</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{markedNumbers.size}</div>
                <div className="text-sm text-muted-foreground">Numbers Marked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">{90 - pickedNumbers.length}</div>
                <div className="text-sm text-muted-foreground">Numbers Remaining</div>
              </div>
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm border-t border-border/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Smart & Vibrant Tambola Website - Built with React & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;