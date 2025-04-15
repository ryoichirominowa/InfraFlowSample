import { create } from "zustand";

const columns = ["A", "B", "C", "D", "E"];
const shapes: Shape[] = [];

for (let col = 0; col < 5; col++) {
  for (let row = 1; row <= 4; row++) {
    shapes.push({
      id: `${col}-${columns[col]}${row}`,
      x: 100 + col * 200,
      y: 100 + (row - 1) * 200,
      width: 100,
      height: 100,
      fill: "white",
      label: `${columns[col]}${row}`,
      type: [],
    });
  }
}

export type Shape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  label: string;
  type: string[];
};

type Store = {
  shapes: Shape[];
  setShapes: (newShapes: Shape[]) => void;
};

export const useStore = create<Store>((set) => ({
  shapes,
  setShapes: (newShapes) => set({ shapes: newShapes }),
}));
