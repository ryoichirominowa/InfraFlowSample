import { Stage, Layer, Rect, Group, Text, Arrow } from "react-konva";
import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import { useStore } from "../stores/shapeStores";

const Canvas5 = () => {
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { shapes, setShapes } = useStore();

  useEffect(() => {
    const updateStageSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        setStageSize({ width, height });
      }
    };

    // 初回レンダリング時にサイズを設定
    updateStageSize();

    // ウィンドウリサイズ時にサイズを更新
    window.addEventListener("resize", updateStageSize);

    // クリーンアップ
    return () => {
      window.removeEventListener("resize", updateStageSize);
    };
  }, []); // 空配列で一度だけ実行されるように設定

  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<any>(null);
  const [lines, setLines] = useState<
    {
      id: number;
      from: string;
      to: string;
      width: number;
      color: string;
      type: string;
    }[]
  >([]);
  const lineIdCounter = useRef(0); // 一意のID用カウンター

  const handleDragMove = (e: any, id: string) => {
    // shapesを更新する
    // const updatedShapes = shapes.map((shape) =>
    //   shape.id === id ? { ...shape, x: newX, y: newY } : shape
    // );

    // // setShapesでストアのshapesを更新
    // setShapes(updatedShapes);
    const newX = e.target.x();
    const newY = e.target.y();

    // shapesを更新する
    const updatedShapes = shapes.map((shape) =>
      shape.id === id ? { ...shape, x: newX, y: newY } : shape
    );
    setShapes(updatedShapes); // ここで配列全体を渡します
  };

  const handleStageMouseDown = (e: any) => {
    if (e.target === e.target.getStage()) {
      setIsDragging(true);
      stageRef.current.draggable(true);
      stageRef.current.startDrag();
    }
  };

  const handleStageMouseUp = () => {
    setIsDragging(false);
    if (stageRef.current) {
      stageRef.current.draggable(false);
    }
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

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
  const [selectedShape, setSelectedShape] = useState<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    type: string[];
  } | null>(null);
  const handleShapeClick = (shape: any) => {
    setSelectedShape(shape);
  };
  const handleLinkClick = (line: any) => {
    const newLines = lines.filter((s) => s.id !== line.id);
    setLines(newLines);
  };
  // type と color のマッピング
  const typeColorMap: { [key: string]: string } = {
    冷水: "#00BFFF", // type1 の場合、赤
    温水: "#FF7F50", // type2 の場合、青
    蒸気: "#B0C4DE", // type3 の場合、緑
    電気: "#FFD700", // type3 の場合、緑
    // 他の type と色の組み合わせを追加
  };

  // Textをクリックした時の処理
  const handleTextClick = (shapeId: string, type: string) => {
    if (selectedShape) {
      // すでに同じ from と to の組み合わせがあるかチェック
      const exists = lines.some(
        (line) => line.from === selectedShape.id && line.to === shapeId
      );

      if (!exists) {
        const newLine = {
          id: lineIdCounter.current++, // 一意のIDを生成
          from: selectedShape.id, // 選択中の図形のID
          to: shapeId, // クリックした図形のID
          width: 3,
          color: typeColorMap[type] || "black", // type に基づいて色を設定。デフォルトは黒,
          type: type,
        };

        // lines に新しい line を追加
        setLines((prevLines) => [...prevLines, newLine]);
        // shapeId に一致する shape の type 配列に type を追加
        const updatedShapes = shapes.map((shape) => {
          if (shape.id === shapeId) {
            // type 配列に type がすでに存在しない場合のみ追加
            if (!shape.type.includes(type)) {
              return { ...shape, type: [...shape.type, type] };
            }
          }
          return shape;
        });

        // shapes を更新
        setShapes(updatedShapes);
      }
    }
  };
  const labels = ["冷水", "温水", "電気", "蒸気"];

  const ColumnSelector = ({
    id,
    label,
    selectedValue,
    setSelectedValue,
  }: any) => {
    return (
      <div className="mb-2 ">
        <p className="block font-bold">{label}</p>
        <div className="flex space-x-4">
          {labels.map((option) => (
            <label
              key={`${id}-${option}`}
              className="flex items-center space-x-2"
            >
              <input
                type="radio"
                name={id}
                value={option}
                checked={selectedValue === option}
                onChange={(e) => setSelectedValue(e.target.value)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };
  const [leftLabel, setLeftLabel] = useState(labels[0]);
  const handleUpdateType = (targetId: string, newType: string) => {
    useStore.setState((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === targetId
          ? {
              ...shape,
              type: shape.type.includes(newType)
                ? shape.type
                : [...shape.type, newType], // newTypeが既に含まれている場合は追加しない
            }
          : shape
      ),
    }));
  };
  useEffect(() => {
    // handleUpdateTypeをuseEffect内で呼び出し、初回レンダリング時のみ実行
    const updateTypes = () => {
      handleUpdateType("0-A1", "冷水");
      handleUpdateType("0-A2", "温水");
      handleUpdateType("0-A3", "電気");
      handleUpdateType("0-A4", "蒸気");
      handleUpdateType("1-B1", "蒸気");
      handleUpdateType("1-B1", "冷水");
      handleUpdateType("1-B2", "電気");
      handleUpdateType("1-B3", "冷水");
      handleUpdateType("1-B3", "蒸気");
      handleUpdateType("1-B4", "温水");
      handleUpdateType("2-C1", "冷水");
      handleUpdateType("2-C2", "温水");
      handleUpdateType("2-C3", "電気");
      handleUpdateType("2-C4", "蒸気");
      handleUpdateType("3-D1", "冷水");
      handleUpdateType("3-D1", "蒸気");
      handleUpdateType("3-D2", "電気");
      handleUpdateType("3-D3", "温水");
      handleUpdateType("3-D3", "蒸気");
      handleUpdateType("3-D4", "蒸気");
      handleUpdateType("4-E1", "蒸気");
      handleUpdateType("4-E2", "冷水");
      handleUpdateType("4-E3", "温水");
      handleUpdateType("4-E4", "電気");
    };

    updateTypes();
  }, []); // 初回レンダリング時のみ実行

  return (
    <div className="flex flex-col h-screen ">
      <Header />
      <div className="flex-1 flex justify-center flex-col items-center w-full pt-30">
        <div className="flex justify-start items-start space-x-4 m-1">
          <div className="p-1">
            <ColumnSelector
              id="left"
              label="属性"
              selectedValue={leftLabel}
              setSelectedValue={setLeftLabel}
            />
          </div>
        </div>
        <div className="flex-1 flex  flex-row justify-center items-center w-full">
          <div
            ref={containerRef}
            className="w-[20%] h-[90%] border-2 border-black flex flex-col justify-between overflow-hidden "
          >
            <div className="h-1/2 flex justify-start items-start border-b border-black p-4 bg-gray-100">
              <div className="w-full">
                <h1 className="text-xl font-semibold text-gray-800 mb-4">
                  プロパティ
                </h1>
                {selectedShape && (
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold">ID:</span>{" "}
                      {selectedShape.id}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold">ラベル:</span>{" "}
                      {selectedShape.label}
                    </p>

                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold">x:</span>{" "}
                      {selectedShape.x}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold">Y:</span>{" "}
                      {selectedShape.y}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold">属性:</span>{" "}
                      {selectedShape.type.join("、")}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="h-1/2 flex flex-col justify-start items-start border-b border-black p-6 bg-gray-100">
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                リンクを追加
              </h1>

              <div className="overflow-x-auto overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 justify-items-center items-center p-4">
                {selectedShape ? (
                  shapes
                    .filter((shape) => {
                      // selectedShape.id の頭の数を取り出す
                      const selectedIdPrefix = parseInt(
                        selectedShape.id.split("-")[0]
                      );

                      // shape.id の頭の数を取り出す
                      const shapeIdPrefix = parseInt(shape.id.split("-")[0]);

                      // 条件に合うshapeのみフィルタリング
                      const isShapeLinked = lines.some(
                        (line) =>
                          (line.from === selectedShape.id &&
                            line.to === shape.id) ||
                          (line.from === shape.id &&
                            line.to === selectedShape.id)
                      );

                      // 形状が選ばれており、リンクされていないものを返す
                      return shapeIdPrefix > selectedIdPrefix && !isShapeLinked;
                    })
                    .map((shape) => (
                      <p
                        key={shape.id}
                        className="text-sm text-gray-600 cursor-pointer p-4 border-2 border-gray-300 rounded-lg shadow-lg hover:bg-gray-200 transform transition-all duration-200 ease-in-out hover:scale-105 w-full"
                        onClick={() => handleTextClick(shape.id, leftLabel)} // Textクリック時にlineを追加
                      >
                        <span className="font-semibold">{shape.label}</span>
                      </p>
                    ))
                ) : (
                  <p className="text-sm text-gray-500">
                    選択された形状がありません。
                  </p>
                )}
              </div>
            </div>
          </div>
          <div
            ref={containerRef}
            className="w-[75%] h-[90%] border-2 border-black flex justify-center items-center overflow-hidden"
          >
            <Stage
              width={stageSize.width}
              height={stageSize.height}
              ref={stageRef}
              onMouseDown={handleStageMouseDown}
              onMouseUp={handleStageMouseUp}
              onWheel={handleWheel}
              draggable={isDragging}
            >
              <Layer>
                {lines
                  .filter((l) => l.type === leftLabel)
                  .map((line, i) => {
                    const fromShape = shapes.find((s) => s.id === line.from);
                    const toShape = shapes.find((s) => s.id === line.to);
                    if (!fromShape || !toShape) return null;
                    // from の同じ ID を持つライン数を取得
                    const fromShapes = lines.filter(
                      (l) => l.from === line.from
                    );
                    const toShapes = lines.filter((l) => l.to === line.to);

                    // 現在のラインのインデックスを取得
                    const fromIndex = fromShapes.findIndex(
                      (l) => l.id === line.id
                    );
                    const toIndex = toShapes.findIndex((l) => l.id === line.id);

                    // オフセット値（中央基準で均等配置）
                    const fromOffset =
                      (fromIndex + 1) *
                      (fromShape.height / (fromShapes.length + 1));
                    const toOffset =
                      (toIndex + 1) * (toShape.height / (toShapes.length + 1));

                    // 矢印の開始位置（中央基準）
                    const startX = fromShape.x + fromShape.width;
                    const startY = fromShape.y + fromOffset;

                    // 矢印の終了位置（中央基準）
                    const endX = toShape.x;
                    const endY = toShape.y + toOffset;
                    const middleX1 = (startX + endX) / 2;
                    const middleY1 = startY;
                    const middleX2 = (startX + endX) / 2;
                    const middleY2 = endY;

                    return (
                      <Arrow
                        key={i}
                        points={[
                          startX,
                          startY,
                          middleX1,
                          middleY1,
                          middleX2,
                          middleY2,
                          endX,
                          endY,
                        ]}
                        stroke={line.color}
                        fill={line.color}
                        strokeWidth={line.width}
                        lineCap="round"
                        lineJoin="round"
                        onClick={() => handleLinkClick(line)}
                      />
                    );
                  })}
                {shapes
                  .filter((l) => l.type.includes(leftLabel))
                  .map((shape) => (
                    <Group
                      key={shape.id}
                      x={shape.x}
                      y={shape.y}
                      draggable
                      onDragStart={() => setIsDragging(false)}
                      onDragMove={(e) => handleDragMove(e, shape.id)}
                      onClick={() => handleShapeClick(shape)}
                    >
                      <Rect
                        width={shape.width}
                        height={shape.height}
                        fill={
                          selectedShape && selectedShape.id === shape.id
                            ? "lightblue"
                            : "white"
                        }
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Text
                        text={shape.label}
                        fontSize={16}
                        fill="black"
                        width={shape.width}
                        height={shape.height}
                        align="center"
                        verticalAlign="middle"
                      />
                    </Group>
                  ))}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvas5;
