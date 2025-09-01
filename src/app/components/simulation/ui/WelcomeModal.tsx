import React, { FC } from 'react';

interface WelcomeModalProps {
  onStart: () => void;
}

const WelcomeModal: FC<WelcomeModalProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 text-white p-6 rounded-lg max-w-sm w-full shadow-2xl">
        <h2 className="text-xl font-bold mb-4 text-purple-400">Bienvenido al Simulador</h2>
        <div className="space-y-3 text-sm mb-4">
          <p>🎯 Tu objetivo es hacer que la población sobreviva.</p>
          <p>🍎 Haz clic sobre un grupo para alimentarlos.</p>
          <p>👤 <strong>Tú</strong> eres el personaje especial que nunca muere.</p>
        </div>
        <button onClick={onStart} className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded w-full font-semibold">
          Iniciar Simulación
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;