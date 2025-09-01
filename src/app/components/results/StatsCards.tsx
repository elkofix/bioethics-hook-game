import React, { FC } from 'react';

interface StatsCardsProps {
  total: number;
  wins: number;
  losses: number;
}

const StatsCards: FC<StatsCardsProps> = ({ total, wins, losses }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-800 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-white">{total}</div>
        <div className="text-gray-400">Total</div>
      </div>
      <div className="bg-green-800 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-white">{wins}</div>
        <div className="text-green-200">Victorias</div>
      </div>
      <div className="bg-red-800 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-white">{losses}</div>
        <div className="text-red-200">Derrotas</div>
      </div>
    </div>
  );
};

export default StatsCards;