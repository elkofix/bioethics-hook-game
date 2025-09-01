import React, { FC } from 'react';
import { GameResult } from '@/types';

interface ResultsListProps {
  results: GameResult[];
}

const ResultsList: FC<ResultsListProps> = ({ results }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Detalles de Resultados</h2>
      {results.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No hay resultados registrados</p>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {results.map((result) => (
            <div key={result.id} className={`p-3 rounded font-bold ${
              result.outcome === 'win' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
            }`}>
              {result.outcome === 'win' ? 'VICTORIA' : 'DERROTA'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsList;