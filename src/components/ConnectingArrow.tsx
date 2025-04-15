// src/components/ConnectingArrow.tsx
import React from "react";
import { Arrow } from "react-konva";
import { ShapeData, LineData } from "../types";

interface ConnectingArrowProps {
  line: LineData;
  fromShape: ShapeData | undefined;
  toShape: ShapeData | undefined;
  allLines: LineData[]; // オフセット計算用
  onClick: (line: LineData) => void;
}

const ConnectingArrow: React.FC<ConnectingArrowProps> = ({
  line,
  fromShape,
  toShape,
  allLines,
  onClick,
}) => {
  if (!fromShape || !toShape) return null;

  // オフセット計算 (元のロジック)
  const fromShapes = allLines.filter(
    (l) => l.from === line.from && l.type === line.type
  ); // 同じタイプで絞る
  const toShapes = allLines.filter(
    (l) => l.to === line.to && l.type === line.type
  ); // 同じタイプで絞る
  const fromIndex = fromShapes.findIndex((l) => l.id === line.id);
  const toIndex = toShapes.findIndex((l) => l.id === line.id);

  const fromOffset =
    fromShapes.length > 0
      ? (fromIndex + 1) * (fromShape.height / (fromShapes.length + 1))
      : fromShape.height / 2; // fallback
  const toOffset =
    toShapes.length > 0
      ? (toIndex + 1) * (toShape.height / (toShapes.length + 1))
      : toShape.height / 2; // fallback

  const startX = fromShape.x + fromShape.width;
  const startY = fromShape.y + fromOffset;
  const endX = toShape.x;
  const endY = toShape.y + toOffset;

  // 経路計算 (元のシンプルなロジック)
  const middleX = (startX + endX) / 2;
  const points = [startX, startY, middleX, startY, middleX, endY, endX, endY];

  return (
    <Arrow
      key={line.id}
      points={points}
      stroke={line.color}
      fill={line.color}
      strokeWidth={line.width}
      pointerLength={8}
      pointerWidth={8}
      lineCap="round"
      lineJoin="round"
      onClick={() => onClick(line)}
      onTap={() => onClick(line)}
    />
  );
};

export default ConnectingArrow;
