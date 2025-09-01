"use client"
import React, { FC } from 'react';

interface GameControlCardProps {
  isGameStarted: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

const GameControlCard: FC<GameControlCardProps> = ({ isGameStarted, isLoading, onToggle }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white mr-4">Estado del Juego:</span>
        <span className={`px-3 py-1 rounded-full font-semibold text-sm ${
          isGameStarted 
            ? 'bg-green-500 text-green-900' 
            : 'bg-red-500 text-red-900'
        }`}>
          {isGameStarted ? 'ACTIVO' : 'INACTIVO'}
        </span>
      </div>

      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-colors ${
          isGameStarted
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? 'Actualizando...' : (isGameStarted ? 'Detener Juego' : 'Iniciar Juego')}
      </button>

      <div className="mt-4 text-sm text-gray-400 text-center">
        {isGameStarted 
          ? 'Los jugadores pueden ver el botón de finalizar.' 
          : 'El botón de finalizar está oculto para los jugadores.'
        }
      </div>
    </div>
  );
};

export default GameControlCard;