import { IEntity, IWorld } from '@/types';
import { CARRYING_CAPACITY, MAX_LIFESPAN, ABUNDANCE_LIFESPAN_BONUS, NATURAL_LIFESPAN_END } from './constants';

export class Entity implements IEntity {
    x: number; y: number; vx: number; vy: number; health: number; energy: number;
    age: number; size: number; color: string; target: IEntity | null; behavior: string;
    reproductionCooldown: number; skinColorIndex: number; hairColorIndex: number;
    id: number; healEffect: number; medicalLevel: number;
    wellFedFrenzyTicks: number;
    isPlayer: boolean;

    constructor(x: number, y: number, isPlayer: boolean = false) {
      this.x = x; this.y = y; this.vx = (Math.random() - 0.5) * 2; this.vy = (Math.random() - 0.5) * 2;
      this.health = 100; this.energy = 100; this.age = 0; this.size = 4 + Math.random() * 3;
      this.color = this.getRandomColor(); this.target = null; this.behavior = 'wander'; this.reproductionCooldown = 0;
      this.skinColorIndex = Math.floor(Math.random() * 5); this.hairColorIndex = Math.floor(Math.random() * 6);
      this.id = Math.random(); this.healEffect = 0; this.medicalLevel = 0; this.wellFedFrenzyTicks = 0; this.isPlayer = isPlayer;
    }

    getRandomColor(): string {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    update(world: IWorld): void {
      this.age += 0.01;
      this.energy -= 0.12;
      this.reproductionCooldown = Math.max(0, this.reproductionCooldown - 1);
      this.healEffect = Math.max(0, this.healEffect - 2);
      this.wellFedFrenzyTicks = Math.max(0, this.wellFedFrenzyTicks - 1);

      const currentMaxLifespan = world.era === 'age_of_abundance'
        ? MAX_LIFESPAN + ABUNDANCE_LIFESPAN_BONUS
        : MAX_LIFESPAN;

      if (!this.isPlayer) {
        if (this.age > currentMaxLifespan) {
          this.health = 0;
        }
        else if (this.age > NATURAL_LIFESPAN_END) {
          const ageFactor = (this.age - NATURAL_LIFESPAN_END) / (currentMaxLifespan - NATURAL_LIFESPAN_END);
          const deathProbability = 0.02 * ageFactor * ageFactor;
          if (Math.random() < deathProbability) { this.health = 0; }
        }
      }

      if (this.medicalLevel > 0 && (this.isPlayer || this.age < currentMaxLifespan)) {
        this.health = Math.min(100, this.health + 0.05 * this.medicalLevel);
        this.medicalLevel -= 0.01;
      }

      this.updateBehavior(world);
      this.move();
      this.checkBoundaries(world);

      if (this.energy <= 0 && (this.isPlayer || this.age < currentMaxLifespan)) {
        this.health = 0;
      }
    }

    updateBehavior(world: IWorld): void {
      if (this.energy < 50 && Math.random() < 0.1) { this.forage(world); }
      const nearbyEntities = world.entities.filter(e => e.id !== this.id && this.distanceTo(e) < 50);
      if (nearbyEntities.length > 0) {
        const closest = nearbyEntities.reduce((a, b) => this.distanceTo(a) < this.distanceTo(b) ? a : b);
        const partner = closest as Entity;
        const frenzyBonus = this.wellFedFrenzyTicks > 0 ? 3.5 : 1.0;
        const eraBonus = world.era === 'age_of_abundance' ? 25.0 : 1.0;
        const scarcityFactor = Math.max(0.05, 1 - (world.entities.length / CARRYING_CAPACITY));
        const baseReproductionRate = world.era === 'age_of_abundance' ? 0.5 : 0.04;
        const canReproduce = (
          this.reproductionCooldown === 0 && partner.reproductionCooldown === 0 && this.energy > 30 && partner.energy > 30 &&
          this.age > 15 && this.age < 90 && Math.random() < baseReproductionRate * scarcityFactor * frenzyBonus * eraBonus
        );
        if (canReproduce) { this.reproduce(partner, world); }
        else { const dist = this.distanceTo(closest); if (dist > 20) { this.moveTowards(closest.x, closest.y, 0.2); } }
      } else { if (Math.random() < 0.1) { this.vx += (Math.random() - 0.5) * 0.5; this.vy += (Math.random() - 0.5) * 0.5; } }
    }
    forage(world: IWorld): void {
      if (world.totalResources > 0 && !world.resourcesDepleted) {
        const cost = world.era === "age_of_abundance" ? 5 : 1;
        world.totalResources = Math.max(0, world.totalResources - cost);
        this.energy = Math.min(100, this.energy + 30);
      }
    }

    reproduce(partner: IEntity, world: IWorld): void {
      if (world.entities.length < 300) {
        const child = new Entity((this.x + partner.x) / 2, (this.y + partner.y) / 2); world.entities.push(child);
        const reproductionCost = world.era === 'age_of_abundance' ? 5 : 40;
        const cooldownTime = world.era === 'age_of_abundance' ? 5 : 120;
        this.reproductionCooldown = cooldownTime; (partner as Entity).reproductionCooldown = cooldownTime;
        this.energy -= reproductionCost; (partner as Entity).energy -= reproductionCost;
      }
    }
    moveTowards(targetX: number, targetY: number, strength: number = 1): void {
      const dx = targetX - this.x; const dy = targetY - this.y; const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) { this.vx += (dx / dist) * strength * 0.1; this.vy += (dy / dist) * strength * 0.1; }
    }
    move(): void {
      this.vx *= 0.95; this.vy *= 0.95; const maxSpeed = 2;
      const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (currentSpeed > maxSpeed) { this.vx = (this.vx / currentSpeed) * maxSpeed; this.vy = (this.vy / currentSpeed) * maxSpeed; }
      this.x += this.vx; this.y += this.vy;
    }
    checkBoundaries(world: IWorld): void {
      const margin = 10;
      if (this.x < margin) { this.x = margin; this.vx = Math.abs(this.vx); }
      if (this.x > world.width - margin) { this.x = world.width - margin; this.vx = -Math.abs(this.vx); }
      if (this.y < margin) { this.y = margin; this.vy = Math.abs(this.vy); }
      if (this.y > world.height - margin) { this.y = world.height - margin; this.vy = -Math.abs(this.vy); }
    }
    distanceTo(other: IEntity): number { const dx = this.x - other.x; const dy = this.y - other.y; return Math.sqrt(dx * dx + dy * dy); }
    draw(ctx: CanvasRenderingContext2D, worldTime: number): void {
      ctx.save(); ctx.imageSmoothingEnabled = false;
      const pixelSize = 2; const spriteWidth = 8; const spriteHeight = 12;
      const drawPixel = (px: number, py: number, color: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(this.x - (spriteWidth * pixelSize) / 2 + px * pixelSize, this.y - (spriteHeight * pixelSize) / 2 + py * pixelSize, pixelSize, pixelSize);
      };
      const hairColor = this.isPlayer ? '#f2a952' : this.getHairColor(); const clothesColor = this.isPlayer ? '#b820b8' : this.color;
      const skinColor = this.isPlayer ? '#fa54f3' : this.getSkinColor();
      const sprite = [[0, 0, 1, 1, 1, 1, 0, 0], [0, 1, 1, 1, 1, 1, 1, 0], [0, 1, 2, 1, 1, 2, 1, 0], [0, 1, 1, 3, 3, 1, 1, 0], [0, 1, 1, 1, 1, 1, 1, 0], [0, 0, 4, 4, 4, 4, 0, 0], [0, 4, 4, 4, 4, 4, 4, 0], [0, 4, 4, 4, 4, 4, 4, 0], [0, 4, 4, 0, 0, 4, 4, 0], [0, 5, 5, 0, 0, 5, 5, 0], [0, 5, 5, 0, 0, 5, 5, 0], [0, 6, 6, 0, 0, 6, 6, 0]];
      const colorMap: { [key: number]: string | null } = { 0: null, 1: hairColor, 2: '#000000', 3: skinColor, 4: clothesColor, 5: this.isPlayer ? '#daf051' : '#2c3e50', 6: this.isPlayer ? '#f2a952' : '#8b4513' };
      for (let y = 0; y < sprite.length; y++) { for (let x = 0; x < sprite[y].length; x++) { const colorIndex = sprite[y][x]; if (colorIndex !== 0) { let color = colorMap[colorIndex]; if (color) { drawPixel(x, y, color); } } } }
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(this.x - (spriteWidth * pixelSize) / 2, this.y + (spriteHeight * pixelSize) / 2, spriteWidth * pixelSize, pixelSize);
      const barWidth = spriteWidth * pixelSize; const barHeight = pixelSize; const barY = this.y - (spriteHeight * pixelSize) / 2 - 4;
      ctx.fillStyle = '#8b0000'; ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
      ctx.fillStyle = this.energy > 30 ? '#00ff00' : '#ffff00'; if (this.energy < 15) ctx.fillStyle = '#ff0000';
      ctx.fillRect(this.x - barWidth / 2, barY, barWidth * (this.energy / 100), barHeight);
      if (this.wellFedFrenzyTicks > 0) {
        const pulse = Math.sin(worldTime * 20) * 0.5 + 0.5; const heartSize = (2 + pulse) * pixelSize;
        const heartX = this.x - heartSize / 2; const heartY = this.y - (spriteHeight * pixelSize) / 2 - 10;
        ctx.fillStyle = '#ff69b4'; ctx.fillRect(heartX, heartY, heartSize, heartSize);
      }
      if (this.isPlayer) {
        ctx.font = '10px monospace'; ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#000000'; ctx.lineWidth = 2;
        ctx.strokeText('Tú', this.x - 6, this.y - 20); ctx.fillText('Tú', this.x - 6, this.y - 20);
      }
      ctx.restore();
    }
    getSkinColor(): string { return ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524'][this.skinColorIndex]; }
    getHairColor(): string { return ['#8b4513', '#daa520', '#000000', '#654321', '#d2691e', '#2f4f4f'][this.hairColorIndex]; }
    receiveFood(amount: number = 40): void { this.energy = 100; this.health = 100; this.wellFedFrenzyTicks = 600; }
    receiveMedicine(level: number = 2): void {
      if (this.isPlayer || this.age < MAX_LIFESPAN) {
        this.medicalLevel = Math.min(5, this.medicalLevel + level); this.health = Math.min(100, this.health + 20 * level); this.healEffect = 100;
      }
    }
}