import { Stage, Layer, Rect, Group, Text, Arrow, Line } from "react-konva";
import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import { useStore } from "../stores/shapeStores";
import { KonvaEventObject } from "konva/lib/Node"; // KonvaEventObject をインポート

// Shapeの型定義 (必要であればより具体的に)
interface ShapeData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: string[];
}

// Lineの型定義 (必要であればより具体的に)
interface LineData {
  id: number;
  from: string;
  to: string;
  width: number;
  color: string;
  type: string;
}

const Canvas9 = () => {
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { shapes, setShapes } = useStore();

  // selectedShape の型を ShapeData | null にする
  const [selectedShape, setSelectedShape] = useState<ShapeData | null>(null);

  useEffect(() => {
    const updateStageSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        setStageSize({ width, height });
      }
    };
    updateStageSize();
    window.addEventListener("resize", updateStageSize);
    return () => {
      window.removeEventListener("resize", updateStageSize);
    };
  }, []);

  const [isDraggingStage, setIsDraggingStage] = useState(false); // Stageをドラッグ中かのフラグ
  const stageRef = useRef<any>(null); // Stageの参照
  const [lines, setLines] = useState<LineData[]>([]); // Lineの型を使用
  const lineIdCounter = useRef(0);

  const handleDragMove = (e: KonvaEventObject<DragEvent>, id: string) => {
    const newX = e.target.x();
    const newY = e.target.y();
    const updatedShapes = shapes.map((shape) =>
      shape.id === id ? { ...shape, x: newX, y: newY } : shape
    );
    setShapes(updatedShapes);
  };

  const GRID_SIZE = 100;
  const Grid = () => {
    // Gridコンポーネントは変更なし
    const EXTEND = 2000;
    const gridLines = [];
    for (let i = -EXTEND; i < stageSize.width + EXTEND; i += GRID_SIZE) {
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[i, -EXTEND, i, stageSize.height + EXTEND]}
          stroke="lightgray"
          strokeWidth={0.5}
          listening={false} // グリッドはイベントを拾わない
        />
      );
    }
    for (let j = -EXTEND; j < stageSize.height + EXTEND; j += GRID_SIZE) {
      gridLines.push(
        <Line
          key={`h-${j}`}
          points={[-EXTEND, j, stageSize.width + EXTEND, j]}
          stroke="lightgray"
          strokeWidth={0.5}
          listening={false} // グリッドはイベントを拾わない
        />
      );
    }
    return <>{gridLines}</>;
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>, id: string) => {
    // ドラッグ終了時のスナップ処理は変更なし
    const newX =
      Math.round((e.target.x() - GRID_SIZE) / (GRID_SIZE * 2)) * GRID_SIZE * 2 +
      GRID_SIZE;
    const newY =
      Math.round((e.target.y() - GRID_SIZE) / (GRID_SIZE * 2)) * GRID_SIZE * 2 +
      GRID_SIZE;
    const updatedShapes = shapes.map((shape) =>
      shape.id === id ? { ...shape, x: newX, y: newY } : shape
    );
    setShapes(updatedShapes);
  };

  // --- ▼▼▼ 変更箇所 ▼▼▼ ---
  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // クリックされたのがStage自体か確認
    if (e.target === e.target.getStage()) {
      // 背景クリック時に選択を解除
      setSelectedShape(null);
      // Stageのドラッグを開始
      setIsDraggingStage(true);
      stageRef.current.draggable(true); // draggable属性で制御するなら不要
    } else {
      // Shapeなどがクリックされた場合はStageのドラッグを無効に
      setIsDraggingStage(false);
      stageRef.current.draggable(false); // draggable属性で制御するなら不要
    }
  };

  const handleStageMouseUp = () => {
    // Stageのドラッグを終了
    setIsDraggingStage(false);
    // stageRef.current.draggable(false); // draggable属性で制御するなら不要
  };
  // --- ▲▲▲ 変更箇所 ▲▲▲ ---

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    // 型を WheelEvent に
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    // ズーム処理は変更なし
    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const limitedScale = Math.max(0.1, Math.min(5, newScale));
    stage.scale({ x: limitedScale, y: limitedScale });
    stage.position({
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    });
  };

  const handleShapeClick = (shape: ShapeData) => {
    // 型を ShapeData に
    setSelectedShape(shape);
  };

  const handleLinkClick = (line: LineData) => {
    // 型を LineData に
    const newLines = lines.filter((l) => l.id !== line.id);
    setLines(newLines);
  };

  const typeColorMap: { [key: string]: string } = {
    冷水: "#00BFFF",
    温水: "#FF7F50",
    蒸気: "#B0C4DE",
    電気: "#FFD700",
  };

  const handleTextClick = (
    selectedShapeId: string,
    targetShapeId: string, // 引数名を変更 (shapeId -> targetShapeId)
    types: string[]
  ) => {
    if (!selectedShape) return;

    // ライン追加ロジックは変更なし
    const newLines: LineData[] = []; // 型を使用
    const addedTypes: string[] = []; // 追加されたTypeを記録

    types.forEach((t) => {
      const exists = lines.some(
        (line) =>
          line.from === selectedShape.id &&
          line.to === targetShapeId && // targetShapeId を使用
          line.type === t // line.type は文字列と仮定（コードから判断）
      );

      if (!exists) {
        newLines.push({
          id: lineIdCounter.current++,
          from: selectedShape.id,
          to: targetShapeId, // targetShapeId を使用
          width: 3,
          color: typeColorMap[t] || "black",
          type: t,
        });
        addedTypes.push(t); // 追加されたTypeを記録
      }
    });

    if (newLines.length > 0) {
      setLines((prevLines) => [...prevLines, ...newLines]);

      // 関連するShapeのtypeを更新 (追加されたTypeのみ)
      const updatedShapes = shapes.map((shape) => {
        if (shape.id === targetShapeId || shape.id === selectedShapeId) {
          // まだそのShapeに含まれていないTypeのみを追加
          const typesToAdd = addedTypes.filter((t) => !shape.type.includes(t));
          if (typesToAdd.length > 0) {
            return { ...shape, type: [...shape.type, ...typesToAdd] };
          }
        }
        return shape;
      });
      setShapes(updatedShapes);
    }
  };

  const labels = ["冷水", "温水", "電気", "蒸気"];
  // ColumnSelectorコンポーネントは変更なし
  type ColumnSelectorProps = {
    id: string;
    label: string;
    selectedValues: string[];
    setSelectedValues: (values: string[]) => void;
  };
  const ColumnSelector = ({
    id,
    label,
    selectedValues,
    setSelectedValues,
  }: ColumnSelectorProps) => {
    const handleCheckboxChange = (option: string) => {
      if (selectedValues.includes(option)) {
        setSelectedValues(selectedValues.filter((v) => v !== option));
      } else {
        setSelectedValues([...selectedValues, option]);
      }
    };
    return (
      <div className="mb-2">
        {" "}
        <p className="block font-bold">{label}</p>{" "}
        <div className="flex space-x-4">
          {" "}
          {labels.map((option) => (
            <label
              key={`${id}-${option}`}
              className="flex items-center space-x-2 cursor-pointer"
            >
              {" "}
              <input
                type="checkbox"
                name={id}
                value={option}
                checked={selectedValues.includes(option)}
                onChange={() => handleCheckboxChange(option)}
              />{" "}
              <span>{option}</span>{" "}
            </label>
          ))}{" "}
        </div>{" "}
      </div>
    );
  };
  const [leftLabels, setLeftLabels] = useState<string[]>([]);
  // handleUpdateType, useEffect内の初期化は変更なし
  const handleUpdateType = (targetId: string, newType: string) => {
    useStore.setState((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === targetId
          ? {
              ...shape,
              type: shape.type.includes(newType)
                ? shape.type
                : [...shape.type, newType],
            }
          : shape
      ),
    }));
  };
  useEffect(() => {
    const updateTypes = () => {
      handleUpdateType("0-A1", "冷水");
      handleUpdateType("0-A2", "温水");
      handleUpdateType("0-A3", "電気");

      handleUpdateType("1-B1", "蒸気");
      handleUpdateType("1-B1", "冷水");
      handleUpdateType("1-B2", "電気");
      handleUpdateType("1-B3", "冷水");
      handleUpdateType("1-B3", "蒸気");

      handleUpdateType("2-C1", "冷水");
      handleUpdateType("2-C2", "温水");
      handleUpdateType("2-C3", "電気");

      handleUpdateType("3-D1", "冷水");
      handleUpdateType("3-D1", "蒸気");
      handleUpdateType("3-D2", "電気");
      handleUpdateType("3-D3", "温水");
      handleUpdateType("3-D3", "蒸気");

      handleUpdateType("4-E1", "蒸気");
      handleUpdateType("4-E2", "冷水");
      handleUpdateType("4-E3", "温水");
    };
    updateTypes();
  }, []);
  // createIntermediatePoints, getArrowPoints関数は変更なし
  const createIntermediatePoints = (middle1: any, middle2: any) => {
    if (middle1.x !== middle2.x) {
      let newY;
      if (middle2.y >= middle1.y) {
        newY = middle1.y + 100;
      } else {
        newY = middle1.y - 100;
      }
      const intermediate1 = { x: middle1.x, y: newY };
      const intermediate2 = { x: middle2.x, y: newY };
      return [intermediate1, intermediate2];
    }
    return [];
  };
  const getArrowPoints = (fromShape: any, toShape: any, type: any) => {
    const index = labels.indexOf(type);
    const divisor = labels.length + 1;
    const multiplier = index + 1;
    const startX = fromShape.x + fromShape.width;
    const endX = toShape.x;
    const startY = fromShape.y + (fromShape.height * multiplier) / divisor;
    const endY = toShape.y + (toShape.height * multiplier) / divisor;
    const middle1 = { x: startX + (100 * multiplier) / divisor, y: startY };
    const middle2 = { x: endX - (100 - (100 * multiplier) / divisor), y: endY };
    const areMiddlesEqual = middle1.x === middle2.x && middle1.y === middle2.y;
    if (areMiddlesEqual) {
      return [startX, startY, endX, endY];
    }
    const intermediatePoints = createIntermediatePoints(middle1, middle2);
    if (intermediatePoints.length > 0) {
      const [inter1, inter2] = intermediatePoints;
      return [
        startX,
        startY,
        middle1.x,
        middle1.y,
        inter1.x,
        inter1.y,
        inter2.x,
        inter2.y,
        middle2.x,
        middle2.y,
        endX,
        endY,
      ];
    }
    return [
      startX,
      startY,
      middle1.x,
      middle1.y,
      middle2.x,
      middle2.y,
      endX,
      endY,
    ];
  };

  // --- ▼▼▼ JSX 描画部分の変更 ▼▼▼ ---
  const FADED_OPACITY = 0.3; // 薄く表示する際の不透明度

  const handleExport = () => {
    const uri = stageRef.current.toDataURL();

    // ダウンロード用リンクを作成
    const link = document.createElement("a");
    link.download = "canvas-export.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="flex flex-col h-screen ">
      <Header />
      <div className="flex-1 flex justify-center flex-col items-center w-full pt-30">
        {/* 左側のカラム */}
        <div className="flex justify-start items-start space-x-4 m-1">
          <div className="p-1">
            <ColumnSelector
              id="left"
              label="グループ"
              selectedValues={leftLabels}
              setSelectedValues={setLeftLabels}
            />
            <button
              onClick={handleExport}
              className="mb-2 px-4 py-1 bg-blue-500 text-white rounded"
            >
              エクスポート
            </button>
          </div>
        </div>
        {/* メインエリア */}
        <div className="flex-1 flex flex-row justify-center items-center w-full">
          {/* 左パネル（プロパティ、リンク追加） */}
          <div className="w-[20%] h-[90%] border-2 border-black flex flex-col justify-between overflow-hidden ">
            {/* プロパティ表示 */}
            <div className="h-1/2 flex justify-start items-start border-b border-black p-4 bg-gray-100 overflow-y-auto">
              {/* ... プロパティ表示部分は変更なし ... */}
              <div className="w-full">
                {" "}
                <h1 className="text-xl font-semibold text-gray-800 mb-4">
                  {" "}
                  プロパティ{" "}
                </h1>{" "}
                {selectedShape && (
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    {" "}
                    <p className="text-sm text-gray-600 mb-3">
                      {" "}
                      <span className="font-semibold">ID:</span>{" "}
                      {selectedShape.id}{" "}
                    </p>{" "}
                    <p className="text-sm text-gray-600 mb-3">
                      {" "}
                      <span className="font-semibold">ラベル:</span>{" "}
                      {selectedShape.label}{" "}
                    </p>{" "}
                    <p className="text-sm text-gray-600 mb-3">
                      {" "}
                      <span className="font-semibold">x:</span>{" "}
                      {selectedShape.x}{" "}
                    </p>{" "}
                    <p className="text-sm text-gray-600 mb-3">
                      {" "}
                      <span className="font-semibold">Y:</span>{" "}
                      {selectedShape.y}{" "}
                    </p>{" "}
                    <p className="text-sm text-gray-600 mb-3">
                      {" "}
                      <span className="font-semibold">グループ:</span>{" "}
                      {selectedShape.type.join("、")}{" "}
                    </p>{" "}
                  </div>
                )}{" "}
              </div>
            </div>
            {/* リンク追加 */}
            <div className="h-1/2 flex flex-col justify-start items-start border-b border-black p-6 bg-gray-100">
              {/* ... リンク追加部分は変更なし ... */}
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                {" "}
                リンクを追加{" "}
              </h1>{" "}
              <div className="overflow-x-auto overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 justify-items-center items-center p-4 w-full">
                {" "}
                {selectedShape ? (
                  shapes
                    .filter((shape) => {
                      return selectedShape.x < shape.x;
                    })
                    .map((shape) => (
                      <p
                        key={shape.id}
                        className="text-sm text-gray-600 cursor-pointer p-4 border-2 border-gray-300 rounded-lg shadow-lg hover:bg-gray-200 transform transition-all duration-200 ease-in-out hover:scale-105 w-full"
                        onClick={() =>
                          handleTextClick(
                            selectedShape.id,
                            shape.id,
                            leftLabels
                          )
                        }
                      >
                        {" "}
                        <span className="font-semibold">
                          {shape.label}
                        </span>{" "}
                      </p>
                    ))
                ) : (
                  <p className="text-sm text-gray-500">
                    {" "}
                    選択された形状がありません。{" "}
                  </p>
                )}{" "}
              </div>
            </div>
          </div>

          {/* 右パネル（Konva Stage） */}
          <div
            ref={containerRef}
            className="w-[75%] h-[90%] border-2 border-black flex justify-center items-center overflow-hidden cursor-grab" // ドラッグ可能を示すカーソル
            style={{ cursor: isDraggingStage ? "grabbing" : "grab" }} // ドラッグ中のカーソル変更
          >
            <Stage
              width={stageSize.width}
              height={stageSize.height}
              ref={stageRef}
              onMouseDown={handleStageMouseDown} // 変更したハンドラを適用
              onMouseUp={handleStageMouseUp} // 変更したハンドラを適用
              onWheel={handleWheel}
              draggable={isDraggingStage} // isDraggingStageステートで制御
            >
              <Layer>
                <Grid />
                {/* Lines (Arrows) */}
                {lines
                  .filter((line) => leftLabels.includes(line.type))
                  .map((line) => {
                    const fromShape = shapes.find((s) => s.id === line.from);
                    const toShape = shapes.find((s) => s.id === line.to);
                    if (!fromShape || !toShape) return null;

                    // Lineの透明度を計算
                    const isLineConnected =
                      selectedShape &&
                      (line.from === selectedShape.id ||
                        line.to === selectedShape.id);
                    const lineOpacity = selectedShape
                      ? isLineConnected
                        ? 1
                        : FADED_OPACITY
                      : 1;

                    const points = getArrowPoints(
                      fromShape,
                      toShape,
                      line.type
                    );

                    return (
                      <Arrow
                        key={line.id} // keyは一意なline.idを使う方が良い
                        points={points}
                        stroke={line.color}
                        fill={line.color}
                        strokeWidth={line.width}
                        lineCap="round"
                        lineJoin="round"
                        onClick={(e) => {
                          // クリックイベント
                          e.cancelBubble = true; // Stageへの伝播を防ぐ
                          handleLinkClick(line);
                        }}
                        onTap={(e) => {
                          // タップイベント（モバイル対応）
                          e.cancelBubble = true;
                          handleLinkClick(line);
                        }}
                        opacity={lineOpacity} // ★ Opacity を適用
                      />
                    );
                  })}

                {/* Shapes (Groups) */}
                {shapes
                  .filter((shape) =>
                    shape.type.some((t) => leftLabels.includes(t))
                  )
                  .map((shape) => {
                    // Shapeの透明度を計算
                    const isSelected =
                      selectedShape && shape.id === selectedShape.id;
                    const shapeOpacity = selectedShape
                      ? isSelected
                        ? 1
                        : FADED_OPACITY
                      : 1;

                    return (
                      <Group
                        key={shape.id}
                        x={shape.x}
                        y={shape.y}
                        draggable // Shapeは常にドラッグ可能
                        onDragStart={() => {
                          // Shapeドラッグ開始時はStageドラッグを無効化
                          setIsDraggingStage(false);
                          // 必要であればドラッグ開始時に選択状態にする
                          // handleShapeClick(shape);
                        }}
                        onDragMove={(e) => handleDragMove(e, shape.id)}
                        onDragEnd={(e) => handleDragEnd(e, shape.id)}
                        onClick={(e) => {
                          // クリックイベント
                          e.cancelBubble = true; // Stageへの伝播を防ぐ
                          handleShapeClick(shape);
                        }}
                        onTap={(e) => {
                          // タップイベント（モバイル対応）
                          e.cancelBubble = true;
                          handleShapeClick(shape);
                        }}
                        opacity={shapeOpacity} // ★ Opacity を適用
                      >
                        <Rect
                          width={shape.width}
                          height={shape.height}
                          fill={isSelected ? "lightblue" : "white"} // 選択色を維持
                          stroke="black"
                          strokeWidth={2}
                          // listening={false} // Groupでイベントを拾うのでRectでは不要かも
                        />
                        <Text
                          text={shape.label}
                          fontSize={16}
                          fill="black"
                          width={shape.width}
                          height={shape.height}
                          align="center"
                          verticalAlign="middle"
                          listening={false} // Textはイベントを拾わない
                        />
                      </Group>
                    );
                  })}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
  // --- ▲▲▲ JSX 描画部分の変更 ▲▲▲ ---
};

export default Canvas9;
