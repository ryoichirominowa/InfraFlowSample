// src/components/GridLayer.tsx
import React from "react";
import { Line } from "react-konva";
import Konva from "konva"; // Stageの型のため

interface GridLayerProps {
  width: number;
  height: number;
  gridSize: number;
  stageRef: React.RefObject<Konva.Stage | null>; // Stageへの参照を受け取る
}

const GridLayer: React.FC<GridLayerProps> = ({
  width,
  height,
  gridSize,
  stageRef,
}) => {
  const gridLines = [];

  // ステージのスケールと位置を取得（存在すれば）
  const stage = stageRef?.current;
  const scale = stage ? stage.scaleX() : 1;
  const stageX = stage ? stage.x() : 0;
  const stageY = stage ? stage.y() : 0;

  // 表示範囲に基づいてグリッドを描画
  const viewRect = {
    x: -stageX / scale,
    y: -stageY / scale,
    width: width / scale,
    height: height / scale,
  };

  const startX = Math.floor(viewRect.x / gridSize) * gridSize;
  const endX = Math.ceil((viewRect.x + viewRect.width) / gridSize) * gridSize;
  const startY = Math.floor(viewRect.y / gridSize) * gridSize;
  const endY = Math.ceil((viewRect.y + viewRect.height) / gridSize) * gridSize;

  // 垂直線
  for (
    let i = Math.floor(startX / gridSize);
    i <= Math.ceil(endX / gridSize);
    i++
  ) {
    const x = i * gridSize;
    gridLines.push(
      <Line
        key={`v-${i}`}
        points={[x, startY, x, endY]} // 描画範囲を限定
        stroke="lightgray"
        strokeWidth={0.5 / scale} // スケールに応じて調整
        listening={false}
      />
    );
  }

  // 水平線
  for (
    let j = Math.floor(startY / gridSize);
    j <= Math.ceil(endY / gridSize);
    j++
  ) {
    const y = j * gridSize;
    gridLines.push(
      <Line
        key={`h-${j}`}
        points={[startX, y, endX, y]} // 描画範囲を限定
        stroke="lightgray"
        strokeWidth={0.5 / scale} // スケールに応じて調整
        listening={false}
      />
    );
  }

  return <>{gridLines}</>;
};

export default GridLayer;
