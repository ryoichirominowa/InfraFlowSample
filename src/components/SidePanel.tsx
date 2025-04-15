// src/components/SidePanel.tsx
import React from "react";
import { ShapeData, LineData } from "../types";
import ColumnSelector from "./ColumnSelector";

interface SidePanelProps {
  selectedShape: ShapeData | null;
  shapes: ShapeData[];
  lines: LineData[];
  leftLabel: string;
  availableLabels: string[]; // 選択肢として渡す
  setLeftLabel: (label: string) => void;
  handleTextClick: (shapeId: string, type: string) => void; // リンク追加時のハンドラ
}

const SidePanel: React.FC<SidePanelProps> = ({
  selectedShape,
  shapes,
  lines,
  leftLabel,
  availableLabels,
  setLeftLabel,
  handleTextClick,
}) => {
  // リンク可能なシェイプのリストを計算
  const linkableShapes = selectedShape
    ? shapes
        .filter((shape) => {
          if (shape.id === selectedShape.id) return false; // 自分自身は除外
          // selectedShape.id の頭の数を取り出す
          const selectedIdPrefix = parseInt(selectedShape.id.split("-")[0]);
          // shape.id の頭の数を取り出す
          const shapeIdPrefix = parseInt(shape.id.split("-")[0]);
          // 既にリンクが存在するかチェック
          const isShapeLinked = lines.some(
            (line) =>
              (line.from === selectedShape.id && line.to === shape.id) ||
              (line.from === shape.id && line.to === selectedShape.id)
          );
          // selectedより後(以上)のID かつ 未リンク
          return shapeIdPrefix >= selectedIdPrefix && !isShapeLinked;
        })
        .sort((a, b) => a.label.localeCompare(b.label)) // ラベルでソート
    : [];

  return (
    <div className="w-[20%] h-[90%] border-2 border-black flex flex-col justify-between overflow-hidden">
      {/* Property Panel */}
      <div className="h-1/2 flex flex-col justify-start items-start border-b border-black p-4 bg-gray-100 overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sticky top-0 bg-gray-100 py-2 w-full">
          プロパティ
        </h2>
        {selectedShape ? (
          <div className="bg-white p-3 rounded-lg shadow w-full">
            <p className="text-sm mb-1">
              <span className="font-semibold">ID:</span> {selectedShape.id}
            </p>
            <p className="text-sm mb-1">
              <span className="font-semibold">ラベル:</span>{" "}
              {selectedShape.label}
            </p>
            <p className="text-sm mb-1">
              <span className="font-semibold">X:</span> {selectedShape.x}
            </p>
            <p className="text-sm mb-1">
              <span className="font-semibold">Y:</span> {selectedShape.y}
            </p>
            <p className="text-sm">
              <span className="font-semibold">グループ:</span>{" "}
              {selectedShape.type.join("、")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 w-full">
            形状を選択してください。
          </p>
        )}
      </div>

      {/* Link Addition Panel */}
      <div className="h-1/2 flex flex-col justify-start items-start p-4 bg-gray-100 overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sticky top-0 bg-gray-100 py-2 w-full">
          リンクを追加
        </h2>
        {selectedShape ? (
          <div className="w-full">
            <ColumnSelector
              id="link-type"
              label="追加するリンクの種類"
              options={availableLabels}
              selectedValue={leftLabel}
              setSelectedValue={setLeftLabel}
            />
            <h3 className="text-md font-semibold mt-4 mb-2">リンク先を選択:</h3>
            <div className="grid grid-cols-2 gap-2">
              {linkableShapes.length > 0 ? (
                linkableShapes.map((shape) => (
                  <button
                    key={shape.id}
                    className="text-xs text-gray-700 bg-white cursor-pointer p-2 border border-gray-300 rounded shadow hover:bg-blue-100 hover:border-blue-400 transition-all duration-150 ease-in-out w-full text-center truncate"
                    onClick={() => handleTextClick(shape.id, leftLabel)}
                    title={shape.label} // ホバーでフルラベル表示
                  >
                    <span className="font-semibold">{shape.label}</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-2">
                  リンク可能な形状がありません。
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            リンクを追加するには、まず開始形状を選択してください。
          </p>
        )}
      </div>
    </div>
  );
};

export default SidePanel;
