"use client"
import React, { useState, useEffect } from 'react';
import { getGameState, updateGameStartedState } from '@/services/simulationService';
import GameControlCard from '@/app/components/admin/GameControlCard';

const GameAdminPage = () => {
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchInitialState = async () => {
      setLoading(true);
      const initialState = await getGameState();
      setIsGameStarted(initialState);
      setLoading(false);
    };

    fetchInitialState();
  }, []);

  // Función para alternar el estado del juego
  const handleToggleGameState = async () => {
    setLoading(true);
    const newState = !isGameStarted;
    try {
      await updateGameStartedState(newState);
      setIsGameStarted(newState);
    } catch (error) {
      // Si hay un error, el estado de la UI no cambia
      console.error("No se pudo actualizar el estado del juego.", error);
    } finally {
      setLoading(false);
    }
  };

  // Muestra un estado de carga inicial
  if (loading && !isGameStarted && isGameStarted === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Cargando Panel de Control...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className='text-center mb-8'>
        <h1 className="text-3xl font-bold text-white">Panel de Control del Juego</h1>
        <p className="text-gray-400 mt-2">Controla el estado global del juego para todos los jugadores.</p>
      </div>
      
      <GameControlCard 
        isGameStarted={isGameStarted}
        isLoading={loading}
        onToggle={handleToggleGameState}
      />
      
      <div className="mt-8 text-gray-400 text-sm text-center max-w-sm">
        <p>Al cambiar el estado aquí, se actualizará en tiempo real para todos los usuarios conectados a la simulación.</p>
      </div>
    </div>
  );
};

export default GameAdminPage;