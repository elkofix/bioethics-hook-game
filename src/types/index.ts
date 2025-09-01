export type WorldEra = 'stable' | 'age_of_abundance';
export type SimulationState = 'running' | 'ending' | 'finished';

export interface IHistoryData {
  time: number;
  population: number;
  resources: number;
}

export interface IFinalModal {
  type: 'good' | 'bad';
  visible: boolean;
}

export interface IEntity {
  x: number; y: number; vx: number; vy: number; health: number; energy: number;
  age: number; size: number; color: string; target: IEntity | null; behavior: string;
  reproductionCooldown: number; skinColorIndex: number; hairColorIndex: number;
  id: number; healEffect: number; medicalLevel: number;
  wellFedFrenzyTicks: number;
  isPlayer: boolean;

  update(world: IWorld): void;
  updateBehavior(world: IWorld): void;
  forage(world: IWorld): void;
  reproduce(partner: IEntity, world: IWorld): void;
  moveTowards(targetX: number, targetY: number, strength?: number): void;
  move(): void;
  checkBoundaries(world: IWorld): void;
  distanceTo(other: IEntity): number;
  draw(ctx: CanvasRenderingContext2D, worldTime: number): void;
  getSkinColor(): string;
  getHairColor(): string;
  receiveFood(amount?: number): void;
  receiveMedicine(level?: number): void;
}

export interface IWorld {
  entities: IEntity[];
  width: number;
  height: number;
  time: number;
  totalResources: number;
  history: IHistoryData[];
  era: WorldEra;
  resourcesDepleted: boolean;
}

export interface GameResult {
    id: string;
    outcome: 'win' | 'lose';
}