// src/types.ts
export interface ShapeData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: string[];
}

export interface LineData {
  id: number;
  from: string;
  to: string;
  width: number;
  color: string;
  type: string;
}
