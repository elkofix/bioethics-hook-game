"use client"
import React, { useState, useEffect, useRef, FC, MouseEvent } from 'react';

// Tipos
import { IWorld, IEntity, IFinalModal, SimulationState, WorldEra } from '@/types';
// Lógica del núcleo
import { Entity } from '@/core/simulation/Entity';
import { CARRYING_CAPACITY, RESOURCE_REGENERATION_RATE } from '@/core/simulation/constants';
// Servicios
import * as simulationService from '@/services/simulationService';
// Utilidades de Dibujo
import { drawWorldBase, drawHeart, drawScream } from './drawingUtils';
// Componentes UI
import WelcomeModal from './ui/WelcomeModal';
import FinalModal from './ui/FinalModal';

const WorldBoxSimulation: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const lastHistoryLogTime = useRef<number>(0);
    const endingAnimationRef = useRef<number | null>(null);
    const foodClicks = useRef<number>(0);

    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [population] = useState<number>(50); // Mantenido por si se quiere ajustar dinámicamente en el futuro
    const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);
    const [simulationState, setSimulationState] = useState<SimulationState>('running');
    const [finalModal, setFinalModal] = useState<IFinalModal | null>(null);
    const [areResourcesDepleted, setAreResourcesDepleted] = useState<boolean>(false);
    const [worldEra, setWorldEra] = useState<WorldEra>('stable');
    
    const worldRef = useRef<IWorld>({
        entities: [],
        width: 350,
        height: 400,
        time: 0,
        totalResources: 200,
        history: [],
        era: 'stable',
        resourcesDepleted: false,
    });

    // --- Efectos de Ciclo de Vida ---
    useEffect(() => {
        const unsubscribe = simulationService.subscribeToGameState((data) => {
            if (!data.isStarted && isRunning) {
                handleEndSimulation();
            }
        });
        return () => unsubscribe();
    }, [isRunning]);

    useEffect(() => {
        initWorld();
    }, [population]);

    useEffect(() => {
        if (isRunning) {
            animationRef.current = requestAnimationFrame(animate);
        } else {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        }
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isRunning, worldEra]);

    useEffect(() => {
        if (simulationState === 'ending') {
            animateEnding();
        }
        return () => {
            if (endingAnimationRef.current) cancelAnimationFrame(endingAnimationRef.current);
        }
    }, [simulationState]);


    // --- Lógica Principal de la Simulación ---
    const initWorld = (): void => {
        const world = worldRef.current;
        world.entities = []; world.time = 0; world.totalResources = 200; 
        world.history = []; world.era = 'stable'; world.resourcesDepleted = false;
        
        const player = new Entity(world.width / 2, world.height / 2, true);
        world.entities.push(player);

        for (let i = 0; i < population - 1; i++) {
            world.entities.push(new Entity(Math.random() * world.width, Math.random() * world.height));
        }
    };

    const animate = (): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const world = worldRef.current;

        world.entities.forEach(e => e.update(world));

        if (!world.resourcesDepleted && world.totalResources > 0) {
            world.totalResources = Math.min(CARRYING_CAPACITY * 3, world.totalResources + RESOURCE_REGENERATION_RATE);
        }

        if (world.totalResources <= 0 && !world.resourcesDepleted) {
            world.resourcesDepleted = true;
            setAreResourcesDepleted(true);
            world.totalResources = 0;
        }

        drawWorldBase(ctx, world.width, world.height);
        world.entities = world.entities.filter(e => (e as Entity).health > 0 || e.isPlayer);
        const player = world.entities.find(e => e.isPlayer);
        if (player && player.health <= 0) {
            player.health = 100;
            player.energy = 100;
        }

        worldRef.current.era = worldEra;
        world.entities.sort((a, b) => a.y - b.y);
        world.entities.forEach(e => e.draw(ctx, world.time));
        
        // UI en Canvas
        ctx.font = '14px monospace'; ctx.fillStyle = 'white';
        ctx.fillText(`👥: ${world.entities.length}`, 10, 20);
        ctx.fillStyle = world.totalResources < 20 && !world.resourcesDepleted ? 'red' : 'white';
        ctx.fillText(`🌿: ${Math.floor(world.totalResources)}`, 10, 40);
        if (world.resourcesDepleted) {
            ctx.fillStyle = 'red';
            ctx.fillText(`🚫 RECURSOS AGOTADOS`, 10, 60);
        }
        if (worldEra === 'age_of_abundance') {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
            ctx.fillText(`🦋 La población se ve diferente...`, 10, 80);
        }

        world.time += 0.1;

        if (isRunning) {
            animationRef.current = requestAnimationFrame(animate);
        }
    };
    
    const animateEnding = () => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        const world = worldRef.current;
        const player = world.entities.find(e => e.isPlayer) as Entity; if (!player) return;
    
        drawWorldBase(ctx, world.width, world.height);
        const centerX = world.width / 2; const centerY = world.height / 2;
        player.moveTowards(centerX, centerY, 0.5); player.move();
        world.entities.sort((a, b) => a.y - b.y).forEach(e => e.draw(ctx, world.time));
    
        if (player.distanceTo({ x: centerX, y: centerY } as IEntity) < 2) {
            player.x = centerX; player.y = centerY; player.vx = 0; player.vy = 0;
            drawWorldBase(ctx, world.width, world.height);
            world.entities.forEach(e => e.draw(ctx, world.time));
            if (finalModal?.type === 'good') { drawHeart(ctx, player); }
            else { drawScream(ctx, player); }
    
            setSimulationState('finished');
            if (endingAnimationRef.current) cancelAnimationFrame(endingAnimationRef.current);
    
            setTimeout(() => {
                setFinalModal(fm => fm ? { ...fm, visible: true } : null);
            }, 1500);
    
        } else {
            endingAnimationRef.current = requestAnimationFrame(animateEnding);
        }
    };


    // --- Manejadores de Eventos ---
    const startSimulation = (): void => {
        setShowWelcomeModal(false);
        setIsRunning(true);
    };

    const handleEndSimulation = async () => {
        if (simulationState !== 'running') return;

        await simulationService.updateGameStartedState(false);

        const resourcesAreDepleted = worldRef.current.resourcesDepleted || worldRef.current.totalResources <= 0;
        if (resourcesAreDepleted) {
            await simulationService.registerGameResult('lose');
            setIsRunning(false);
            setSimulationState('ending');
            worldRef.current.entities = worldRef.current.entities.filter(e => e.isPlayer);
            setFinalModal({ type: 'bad', visible: false });
        } else {
            await simulationService.registerGameResult('win');
            setIsRunning(false);
            setSimulationState('ending');
            setFinalModal({ type: 'good', visible: false });
        }
    };

    const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>): void => {
        if (simulationState !== 'running' || areResourcesDepleted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const world = worldRef.current;

        const entitiesToFeed = world.entities.filter(entity =>
            entity.distanceTo({ x, y } as IEntity) < 50
        );

        if (entitiesToFeed.length > 0) {
            foodClicks.current++;
            if (foodClicks.current === 6 && worldEra === 'stable') {
                setWorldEra('age_of_abundance');
            }
            entitiesToFeed.forEach(entity => entity.receiveFood());
        }
    };


    // --- Renderizado del Componente ---
    return (
        <div className="flex flex-col items-center p-4 bg-gray-900 min-h-screen">
            {showWelcomeModal && <WelcomeModal onStart={startSimulation} />}
            {finalModal && <FinalModal modalData={finalModal} />}

            <div className="relative mb-4">
                <div className="border-4 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
                    <canvas
                        ref={canvasRef}
                        width={350}
                        height={400}
                        className={`block ${areResourcesDepleted ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
                        onClick={handleCanvasClick}
                    />
                </div>
                <div className="absolute bottom-4 right-4">
                    <div className={`p-3 rounded-full shadow-lg transition-colors ${areResourcesDepleted ? 'bg-gray-600' : 'bg-green-600'}`}>
                        <span className="text-2xl">🍎</span>
                    </div>
                    <div className="text-white text-xs text-center mt-1">Alimentar</div>
                </div>
            </div>
            
            {/* Opcional: botón para finalizar manualmente */}
            {/* <div className="flex justify-center gap-4 mb-4 w-full max-w-sm">
                <button
                onClick={handleEndSimulation}
                disabled={simulationState !== 'running'}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold flex-1 disabled:bg-gray-600"
                >
                ✨ Finalizar
                </button>
            </div> */}
        </div>
    );
};

export default WorldBoxSimulation;