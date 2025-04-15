// src/components/ShapeGroup.tsx
import React from "react";
import { Group, Rect, Text } from "react-konva";
import { ShapeData } from "../types"; // types.ts からインポート
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva"; // Konvaの型を取得するためにインポート

interface ShapeGroupProps {
  shape: ShapeData;
  isSelected: boolean;
  gridSize: number; // ドラッグ終了時のスナップで使用する場合
  onDragMove: (e: KonvaEventObject<DragEvent>, id: string) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>, id: string) => void;
  onClick: (shape: ShapeData) => void;
  onDragStart?: (e: KonvaEventObject<DragEvent>) => void; // 必要に応じて追加
}

const ShapeGroup: React.FC<ShapeGroupProps> = ({
  shape,
  isSelected,
  gridSize, // 必要であれば onDragEnd 内で使う
  onDragMove,
  onDragEnd,
  onClick,
  onDragStart,
}) => {
  return (
    <Group
      key={shape.id}
      id={shape.id} // KonvaノードのIDとしても設定しておくと便利
      x={shape.x}
      y={shape.y}
      draggable
      onDragStart={onDragStart}
      onDragMove={(e) => onDragMove(e, shape.id)}
      onDragEnd={(e) => onDragEnd(e, shape.id)}
      onClick={() => onClick(shape)}
      onTap={() => onClick(shape)} // タップイベントも考慮
    >
      <Rect
        width={shape.width}
        height={shape.height}
        fill={isSelected ? "lightblue" : "white"}
        stroke="black"
        strokeWidth={2}
        shadowColor="black"
        shadowBlur={isSelected ? 10 : 0}
        shadowOpacity={0.3}
        cornerRadius={4} // 少し角丸に
      />
      <Text
        text={shape.label}
        fontSize={16}
        fill="black"
        width={shape.width}
        height={shape.height}
        align="center"
        verticalAlign="middle"
        listening={false} // テキストはイベントを受け取らない
      />
    </Group>
  );
};

export default ShapeGroup;
