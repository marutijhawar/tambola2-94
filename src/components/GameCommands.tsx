import { useEffect } from "react";

interface GameCommandsProps {
  onBeginRound: () => void;
  gameState: 'setup' | 'waiting' | 'playing' | 'paused' | 'ended';
}

export const GameCommands = ({ onBeginRound, gameState }: GameCommandsProps) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data?.message?.toLowerCase();
      
      if (message === 'begin the round' && gameState === 'waiting') {
        onBeginRound();
      }
    };

    // Listen for messages from parent window (if in iframe) or use a simple approach
    window.addEventListener('message', handleMessage);
    
    // Also listen for a simple custom event
    const handleCustomEvent = (event: CustomEvent) => {
      const message = event.detail?.toLowerCase();
      if (message === 'begin the round' && gameState === 'waiting') {
        onBeginRound();
      }
    };
    
    window.addEventListener('gameCommand', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('gameCommand', handleCustomEvent as EventListener);
    };
  }, [onBeginRound, gameState]);

  // Function to trigger game start (can be called from console)
  useEffect(() => {
    (window as any).beginRound = () => {
      if (gameState === 'waiting') {
        onBeginRound();
      } else {
        console.log('Game is not in waiting state. Current state:', gameState);
      }
    };

    return () => {
      delete (window as any).beginRound;
    };
  }, [onBeginRound, gameState]);

  return null;
};