import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { TambolaTicket } from "./TambolaTicket";
import { Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface TicketGeneratorProps {
  markedNumbers?: Set<number>;
  onNumberClick?: (number: number) => void;
}
export const TicketGenerator = ({
  markedNumbers,
  onNumberClick
}: TicketGeneratorProps) => {
  const [numTickets, setNumTickets] = useState(6);
  const [tickets, setTickets] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    toast
  } = useToast();
  const generateTickets = () => {
    if (numTickets < 1 || numTickets > 12) {
      toast({
        title: "Invalid Number",
        description: "Please enter between 1 and 12 tickets",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);

    // Simulate generation delay for better UX
    setTimeout(() => {
      const newTickets = Array.from({
        length: numTickets
      }, (_, i) => i + 1);
      setTickets(newTickets);
      setIsGenerating(false);
      toast({
        title: "Tickets Generated!",
        description: `${numTickets} tickets ready for the game`,
        duration: 2000
      });
    }, 800);
  };
  const downloadTickets = () => {
    // In a real implementation, this would generate a PDF or print-friendly format
    toast({
      title: "Download Started",
      description: "Tickets are being prepared for download",
      duration: 2000
    });
  };
  return <div className="space-y-6">
      {/* Controls */}
      <Card className="p-6 bg-gradient-accent shadow-card rounded-sm bg-yellow-400">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-accent-foreground">Generate Tambola Tickets</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="numTickets" className="text-accent-foreground">
                Number of Tickets (1-12)
              </Label>
              <Input id="numTickets" type="number" min="1" max="12" value={numTickets} onChange={e => setNumTickets(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))} className="bg-white/20 border-white/30 text-accent-foreground placeholder:text-accent-foreground/60" disabled={isGenerating} />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={generateTickets} disabled={isGenerating} className="bg-white/20 hover:bg-white/30 text-accent-foreground border-white/30 backdrop-blur-sm" variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
              
              {tickets.length > 0 && <Button onClick={downloadTickets} className="bg-white/20 hover:bg-white/30 text-accent-foreground border-white/30 backdrop-blur-sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>}
            </div>
          </div>
        </div>
      </Card>

      {/* Generated Tickets */}
      {tickets.length > 0 && <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            Your Tickets ({tickets.length})
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tickets.map(ticketId => <TambolaTicket key={ticketId} ticketNumber={ticketId} onNumberClick={onNumberClick} markedNumbers={markedNumbers} isGenerating={isGenerating} />)}
          </div>
        </div>}

      {tickets.length === 0 && <Card className="p-12 text-center bg-muted/50 border-dashed border-2 border-muted">
          <div className="space-y-4">
            <div className="text-4xl">🎫</div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              No Tickets Generated Yet
            </h3>
            <p className="text-muted-foreground">
              Click "Generate" to create your Tambola tickets and start playing!
            </p>
          </div>
        </Card>}
    </div>;
};