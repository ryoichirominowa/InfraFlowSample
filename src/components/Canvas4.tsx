import { Stage, Layer, Rect, Group, Text, Arrow } from "react-konva";
import { useEffect, useRef, useState } from "react";
import Header from "./Header";

type Shape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};
const Canvas4 = () => {
  const boxSize = 100;
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

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
  const [leftCount, setLeftCount] = useState(0);
  const [middleCount, setMiddleCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [anotherCount, setAnotherCount] = useState(0);
  const [excetraCount, setExcetraCount] = useState(0);

  const generateShapes = () => {
    const shapes = [];

    for (let i = 0; i < leftCount; i++) {
      shapes.push({
        id: `0-${i}`,
        x: 50,
        y: i * 150 + 50,
        width: boxSize,
        height: boxSize,
        label: `L${i + 1}`,
      });
    }
    for (let i = 0; i < middleCount; i++) {
      shapes.push({
        id: `1-${i}`,
        x: 250,
        y: i * 150 + 50,
        width: boxSize,
        height: boxSize,
        label: `M${i + 1}`,
      });
    }
    for (let i = 0; i < rightCount; i++) {
      shapes.push({
        id: `2-${i}`,
        x: 450,
        y: i * 150 + 50,
        width: boxSize,
        height: boxSize,
        label: `R${i + 1}`,
      });
    }
    for (let i = 0; i < anotherCount; i++) {
      shapes.push({
        id: `3-${i}`,
        x: 650,
        y: i * 150 + 50,
        width: boxSize,
        height: boxSize,
        label: `A${i + 1}`,
      });
    }
    for (let i = 0; i < excetraCount; i++) {
      shapes.push({
        id: `4-${i}`,
        x: 850,
        y: i * 150 + 50,
        width: boxSize,
        height: boxSize,
        label: `E${i + 1}`,
      });
    }
    return shapes;
  };

  const [shapes, setShapes] = useState<Shape[]>(generateShapes);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<any>(null);
  const [lines, setLines] = useState<
    { id: number; from: string; to: string; width: number; color: string }[]
  >([]);
  const lineIdCounter = useRef(0); // 一意のID用カウンター

  const handleDragMove = (e: any, id: string) => {
    setShapes((prevShapes: Shape[]) =>
      prevShapes.map((shape) => {
        if (shape.id !== id) return shape;
        let newX = e.target.x();
        let newY = e.target.y();
        //newX = Math.max(0, Math.min(stageWidth - shape.width, newX));
        //newY = Math.max(0, Math.min(stageHeight - shape.height, newY));

        e.target.x(newX);
        e.target.y(newY);

        return { ...shape, x: newX, y: newY };
      })
    );
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
  } | null>(null);
  const handleShapeClick = (shape: any) => {
    setSelectedShape(shape);
  };
  const handleLinkClick = (line: any) => {
    const newLines = lines.filter((s) => s.id !== line.id);
    setLines(newLines);
  };

  useEffect(() => {
    setShapes(generateShapes());
  }, [leftCount, middleCount, rightCount, anotherCount, excetraCount]);
  const [_isPropertiesVisible, _setIsPropertiesVisible] = useState(false);

  // const handleShowProperties = () => {
  //   setIsPropertiesVisible(true);
  // };

  // const handleCloseProperties = () => {
  //   setIsPropertiesVisible(false);
  // };

  // const handleClose = () => {
  //   // 閉じるボタンの処理
  //   setSelectedShape(null);
  // };
  // Textをクリックした時の処理
  const handleTextClick = (shapeId: string) => {
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
          color: "black",
        };

        // lines に新しい line を追加
        setLines((prevLines) => [...prevLines, newLine]);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen ">
      <Header />
      <div className="flex-1 flex justify-center flex-col items-center w-full pt-30">
        <div className="flex justify-center items-center space-x-4 m-1">
          <div>
            <label htmlFor="leftCount" className="block">
              L列
            </label>
            <input
              id="leftCount"
              type="number"
              value={leftCount}
              onChange={(e) => setLeftCount(Number(e.target.value))}
              placeholder="Left"
              className="p-2 border"
            />
          </div>

          <div>
            <label htmlFor="middleCount" className="block">
              M列
            </label>
            <input
              id="middleCount"
              type="number"
              value={middleCount}
              onChange={(e) => setMiddleCount(Number(e.target.value))}
              placeholder="Middle"
              className="p-2 border"
            />
          </div>

          <div>
            <label htmlFor="rightCount" className="block">
              R列
            </label>
            <input
              id="rightCount"
              type="number"
              value={rightCount}
              onChange={(e) => setRightCount(Number(e.target.value))}
              placeholder="Right"
              className="p-2 border"
            />
          </div>

          <div>
            <label htmlFor="anotherCount" className="block">
              A列
            </label>
            <input
              id="anotherCount"
              type="number"
              value={anotherCount}
              onChange={(e) => setAnotherCount(Number(e.target.value))}
              placeholder="Another"
              className="p-2 border"
            />
          </div>

          <div>
            <label htmlFor="excetraCount" className="block">
              E列
            </label>
            <input
              id="excetraCount"
              type="number"
              value={excetraCount}
              onChange={(e) => setExcetraCount(Number(e.target.value))}
              placeholder="Excetra"
              className="p-2 border"
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
                        onClick={() => handleTextClick(shape.id)} // Textクリック時にlineを追加
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
                {lines.map((line, i) => {
                  const fromShape = shapes.find((s) => s.id === line.from);
                  const toShape = shapes.find((s) => s.id === line.to);
                  if (!fromShape || !toShape) return null;
                  // from の同じ ID を持つライン数を取得
                  const fromShapes = lines.filter((l) => l.from === line.from);
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
                {shapes.map((shape) => (
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

export default Canvas4;
