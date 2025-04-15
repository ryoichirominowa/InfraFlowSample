// src/components/KonvaStageContainer.tsx
import React from "react";
import { Stage, Layer } from "react-konva";
import { ShapeData, LineData } from "../types";
import GridLayer from "./GridLayer";
import ShapeGroup from "./ShapeGroup";
import ConnectingArrow from "./ConnectingArrow";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva"; // Konvaの型のため

interface KonvaStageContainerProps {
  stageSize: { width: number; height: number };
  stageRef: React.RefObject<Konva.Stage | null>;
  shapes: ShapeData[];
  lines: LineData[];
  selectedShape: ShapeData | null;
  leftLabel: string;
  gridSize: number;
  isStageDragging: boolean; // ステージ自体のドラッグ状態
  onStageMouseDown: (e: KonvaEventObject<MouseEvent>) => void;
  onStageMouseUp: (e: KonvaEventObject<MouseEvent>) => void;
  onWheel: (e: KonvaEventObject<WheelEvent>) => void;
  // Shape/Line handlers
  onShapeDragMove: (e: KonvaEventObject<DragEvent>, id: string) => void;
  onShapeDragEnd: (e: KonvaEventObject<DragEvent>, id: string) => void;
  onShapeClick: (shape: ShapeData) => void;
  onLinkClick: (line: LineData) => void;
  onShapeDragStart?: (e: KonvaEventObject<DragEvent>) => void;
}

const KonvaStageContainer: React.FC<KonvaStageContainerProps> = ({
  stageSize,
  stageRef,
  shapes,
  lines,
  selectedShape,
  leftLabel,
  gridSize,
  isStageDragging,
  onStageMouseDown,
  onStageMouseUp,
  onWheel,
  onShapeDragMove,
  onShapeDragEnd,
  onShapeClick,
  onLinkClick,
  onShapeDragStart,
}) => {
  return (
    <Stage
      width={stageSize.width}
      height={stageSize.height}
      ref={stageRef}
      onMouseDown={onStageMouseDown}
      onMouseUp={onStageMouseUp}
      onWheel={onWheel}
      draggable={isStageDragging} // ステージのドラッグ可否
    >
      <Layer>
        <GridLayer
          width={stageSize.width}
          height={stageSize.height}
          gridSize={gridSize}
          stageRef={stageRef} // GridLayerに参照を渡す
        />
        {/* Shapes */}
        {shapes
          .filter((s) => s.type.includes(leftLabel))
          .map((shape) => (
            <ShapeGroup
              key={shape.id}
              shape={shape}
              isSelected={selectedShape?.id === shape.id}
              gridSize={gridSize}
              onDragMove={onShapeDragMove}
              onDragEnd={onShapeDragEnd}
              onClick={onShapeClick}
              onDragStart={onShapeDragStart}
            />
          ))}
        {/* Lines */}
        {lines
          .filter((l) => l.type === leftLabel)
          .map((line) => {
            const fromShape = shapes.find((s) => s.id === line.from);
            const toShape = shapes.find((s) => s.id === line.to);
            return (
              <ConnectingArrow
                key={line.id}
                line={line}
                fromShape={fromShape}
                toShape={toShape}
                allLines={lines} // オフセット計算用に全てのラインを渡す
                onClick={onLinkClick}
              />
            );
          })}
      </Layer>
    </Stage>
  );
};

export default KonvaStageContainer;
