import { IEntity } from "@/types";

export const drawWorldBase = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.imageSmoothingEnabled = false; 
    ctx.fillStyle = '#228b22'; 
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#32cd32';
    for (let x = 0; x < width; x += 8) { 
        for (let y = 0; y < height; y += 8) { 
            if (Math.random() < 0.3) { ctx.fillRect(x, y, 2, 2); } 
        } 
    }
    ctx.fillStyle = '#8b4513';
    for (let i = 0; i < 10; i++) {
        const treeX = (i * 123 + 456) % width; 
        const treeY = (i * 789 + 101) % height;
        ctx.fillRect(treeX, treeY, 4, 8); 
        ctx.fillStyle = '#006400'; 
        ctx.fillRect(treeX - 2, treeY - 4, 8, 8); 
        ctx.fillStyle = '#8b4513';
    }
};

export const drawHeart = (ctx: CanvasRenderingContext2D, player: IEntity) => {
    const heartMatrix = [[0, 1, 0, 1, 0], [1, 1, 1, 1, 1], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0]];
    const pixelSize = 3; 
    const heartWidth = heartMatrix[0].length * pixelSize;
    const startX = player.x - heartWidth / 2; 
    const startY = player.y - 35;
    ctx.fillStyle = '#ff69b4';
    for (let y = 0; y < heartMatrix.length; y++) {
        for (let x = 0; x < heartMatrix[y].length; x++) {
            if (heartMatrix[y][x] === 1) { 
                ctx.fillRect(startX + x * pixelSize, startY + y * pixelSize, pixelSize, pixelSize); 
            }
        }
    }
};

export const drawScream = (ctx: CanvasRenderingContext2D, player: IEntity) => {
    ctx.font = 'bold 20px monospace'; 
    ctx.fillStyle = '#ffdd00'; 
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3; 
    ctx.textAlign = 'center';
    ctx.strokeText("¡ahhhh!", player.x, player.y - 25); 
    ctx.fillText("¡ahhhh!", player.x, player.y - 25);
};