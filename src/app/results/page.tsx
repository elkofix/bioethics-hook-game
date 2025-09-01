"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { GameResult } from '@/types';
import { subscribeToGameResults, clearAllGameResults } from '@/services/simulationService';

import StatsCards from '@/app/components/results/StatsCards';
import ResultsChart from '@/app/components/results/ResultsChart';
import ResultsList from '@/app/components/results/ResultsList';

const ResultsDashboardPage = () => {
    const [results, setResults] = useState<GameResult[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleting, setDeleting] = useState<boolean>(false);

    useEffect(() => {
        // Se suscribe a los resultados y guarda la función de limpieza
        const unsubscribe = subscribeToGameResults((resultsData) => {
            setResults(resultsData);
            setLoading(false);
        });

        // Limpia la suscripción cuando el componente se desmonta
        return () => unsubscribe();
    }, []);

    const handleClearResults = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar todos los resultados? Esta acción no se puede deshacer.')) {
            return;
        }

        setDeleting(true);
        try {
            await clearAllGameResults();
            // El listener de onSnapshot actualizará la UI a una lista vacía automáticamente
        } catch (error) {
            alert('Error al eliminar los resultados.');
        } finally {
            setDeleting(false);
        }
    };

    // Usamos useMemo para evitar recalcular en cada renderizado
    const stats = useMemo(() => {
        const wins = results.filter(r => r.outcome === 'win').length;
        const losses = results.filter(r => r.outcome === 'lose').length;
        return { wins, losses, total: results.length };
    }, [results]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-white text-xl">Cargando resultados...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">Dashboard de Resultados</h1>
                
                <StatsCards total={stats.total} wins={stats.wins} losses={stats.losses} />

                <div className="mb-6 text-center">
                    <button
                        onClick={handleClearResults}
                        disabled={deleting || stats.total === 0}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {deleting ? 'Eliminando...' : 'Limpiar Todos los Resultados'}
                    </button>
                </div>

                <ResultsChart wins={stats.wins} losses={stats.losses} />
                
                <ResultsList results={results} />
            </div>
        </div>
    );
};

export default ResultsDashboardPage;