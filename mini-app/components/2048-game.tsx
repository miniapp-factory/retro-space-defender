"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const GRID_SIZE = 4;
const TILE_VALUES = [2, 4];
const TILE_PROBABILITIES = [0.9, 0.1];

function randomTileValue() {
  return Math.random() < TILE_PROBABILITIES[0] ? TILE_VALUES[0] : TILE_VALUES[1];
}

function emptyPositions(grid: number[][]) {
  const positions: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) positions.push([r, c]);
    }
  }
  return positions;
}

function addRandomTile(grid: number[][]) {
  const empties = emptyPositions(grid);
  if (empties.length === 0) return grid;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[r][c] = randomTileValue();
  return newGrid;
}

function slideAndMerge(row: number[]) {
  const nonZero = row.filter(v => v !== 0);
  const merged: number[] = [];
  let skip = false;
  for (let i = 0; i < nonZero.length; i++) {
    if (skip) {
      skip = false;
      continue;
    }
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      merged.push(nonZero[i] * 2);
      skip = true;
    } else {
      merged.push(nonZero[i]);
    }
  }
  while (merged.length < GRID_SIZE) merged.push(0);
  return merged;
}

function transpose(grid: number[][]) {
  return grid[0].map((_, i) => grid.map(row => row[i]));
}

function reverse(grid: number[][]) {
  return grid.map(row => [...row].reverse());
}

export function Game2048() {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    let g = addRandomTile(addRandomTile(grid));
    setGrid(g);
  }, []);

  const move = (direction: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    let newGrid = [...grid];
    let moved = false;
    let newScore = score;

    const apply = (arr: number[]) => {
      const merged = slideAndMerge(arr);
      if (!moved && !arr.every((v, i) => v === merged[i])) moved = true;
      return merged;
    };

    if (direction === "left") {
      newGrid = newGrid.map(apply);
    } else if (direction === "right") {
      newGrid = reverse(newGrid).map(apply);
      newGrid = reverse(newGrid);
    } else if (direction === "up") {
      newGrid = transpose(newGrid);
      newGrid = newGrid.map(apply);
      newGrid = transpose(newGrid);
    } else if (direction === "down") {
      newGrid = transpose(newGrid);
      newGrid = reverse(newGrid).map(apply);
      newGrid = reverse(newGrid);
      newGrid = transpose(newGrid);
    }

    if (!moved) return;

    newGrid = addRandomTile(newGrid);
    newScore = newGrid.flat().reduce((s, v) => s + v, 0);

    setGrid(newGrid);
    setScore(newScore);
    setWon(newGrid.flat().some(v => v === 2048));
    if (!emptyPositions(newGrid).length && !newGrid.flat().some((v, i, arr) => {
      const r = Math.floor(i / GRID_SIZE);
      const c = i % GRID_SIZE;
      return (r < GRID_SIZE - 1 && arr[i] === arr[i + GRID_SIZE]) ||
             (c < GRID_SIZE - 1 && arr[i] === arr[i + 1]);
    })) {
      setGameOver(true);
    }
  };

  const handleKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        move("up");
        break;
      case "ArrowDown":
        move("down");
        break;
      case "ArrowLeft":
        move("left");
        break;
      case "ArrowRight":
        move("right");
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [grid, gameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {grid.flat().map((v, i) => (
          <div
            key={i}
            className={`flex items-center justify-center h-16 w-16 rounded-md text-2xl font-bold ${
              v === 0
                ? "bg-gray-200"
                : v <= 4
                ? "bg-yellow-200"
                : v <= 8
                ? "bg-yellow-300"
                : v <= 16
                ? "bg-yellow-400"
                : v <= 32
                ? "bg-yellow-500"
                : v <= 64
                ? "bg-yellow-600"
                : v <= 128
                ? "bg-yellow-700"
                : v <= 256
                ? "bg-yellow-800"
                : v <= 512
                ? "bg-yellow-900"
                : "bg-red-500"
            }`}
          >
            {v !== 0 && v}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => move("up")}>↑</Button>
        <Button onClick={() => move("down")}>↓</Button>
        <Button onClick={() => move("left")}>←</Button>
        <Button onClick={() => move("right")}>→</Button>
      </div>
      <div className="text-xl">Score: {score}</div>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl font-bold">
            {won ? "You won!" : "Game Over"}
          </div>
          <Share text={`I scored ${score} in 2048! ${url}`} />
        </div>
      )}
    </div>
  );
}
