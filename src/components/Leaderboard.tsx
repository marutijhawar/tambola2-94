import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { Player } from "@/types/game";

interface LeaderboardProps {
  players: Player[];
  gameState: string;
}

export const Leaderboard = ({ players, gameState }: LeaderboardProps) => {
  // Sort players by points (descending)
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Star className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case 2:
        return "bg-gray-400/20 text-gray-700 border-gray-400/30";
      case 3:
        return "bg-amber-600/20 text-amber-700 border-amber-600/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (gameState === 'setup' || players.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-accent shadow-card border-4 border-black">
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className="w-5 h-5 text-black" />
        <h3 className="text-lg font-bold text-black font-casino">Leaderboard</h3>
      </div>
      
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const rank = index + 1;
          return (
            <div
              key={player.id}
              className={`
                flex items-center justify-between p-3 rounded-lg border-2 border-black/20
                ${rank === 1 ? 'bg-yellow-400/30' : rank === 2 ? 'bg-gray-200/30' : rank === 3 ? 'bg-amber-200/30' : 'bg-white/20'}
                ${player.disqualified ? 'opacity-60' : ''}
              `}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getRankIcon(rank)}
                  <Badge
                    className={`${getRankBadgeColor(rank)} border-2 font-bold min-w-[2rem] justify-center`}
                  >
                    #{rank}
                  </Badge>
                </div>
                
                <div>
                  <span className={`font-semibold text-black ${rank <= 3 ? 'text-lg' : ''}`}>
                    {player.name}
                  </span>
                  {player.disqualified && (
                    <span className="text-xs text-red-600 ml-2">(Disqualified from some patterns)</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge
                  className={`
                    ${rank === 1 ? 'bg-yellow-500 text-yellow-900' : 
                      rank === 2 ? 'bg-gray-500 text-white' : 
                      rank === 3 ? 'bg-amber-500 text-amber-900' : 
                      'bg-primary text-primary-foreground'}
                    font-bold px-3 py-1 text-lg border-2 border-black
                  `}
                >
                  {player.points} pts
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
      
      {gameState === 'ended' && sortedPlayers.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-400/50 rounded-lg border-2 border-black text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Trophy className="w-6 h-6 text-black" />
            <span className="text-xl font-bold text-black font-casino">Game Winner!</span>
          </div>
          <div className="text-2xl font-bold text-black font-casino">
            🎉 {sortedPlayers[0].name} - {sortedPlayers[0].points} points! 🎉
          </div>
        </div>
      )}
    </Card>
  );
};