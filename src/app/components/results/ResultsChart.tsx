import React, { FC } from 'react';

interface ResultsChartProps {
  wins: number;
  losses: number;
}

const ResultsChart: FC<ResultsChartProps> = ({ wins, losses }) => {
  const total = wins + losses;
  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold text-white mb-4 text-center">Distribución de Resultados</h2>
      <div className="flex items-end justify-center space-x-12 h-48">
        {/* Barra de Victorias */}
        <div className="flex flex-col items-center h-full">
          <div className="flex-1 flex items-end w-16">
            <div className="bg-green-500 w-full rounded-t transition-all"
                 style={{ height: total > 0 ? `${(wins / total) * 100}%` : "5%" }}></div>
          </div>
          <div className="text-white mt-2">Victorias</div>
          <div className="text-green-400 font-bold">{wins}</div>
        </div>
        {/* Barra de Derrotas */}
        <div className="flex flex-col items-center h-full">
          <div className="flex-1 flex items-end w-16">
            <div className="bg-red-500 w-full rounded-t transition-all"
                 style={{ height: total > 0 ? `${(losses / total) * 100}%` : "5%" }}></div>
          </div>
          <div className="text-white mt-2">Derrotas</div>
          <div className="text-red-400 font-bold">{losses}</div>
        </div>
      </div>
    </div>
  );
};

export default ResultsChart;