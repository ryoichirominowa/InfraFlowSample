import { Stage, Layer, Rect, Arrow, Group, Text } from "react-konva";
import { useState, useEffect, useRef } from "react";
import Header from "./Header";

const LOCAL_STORAGE_KEY = "canvasShapes";

type Shape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

const Canvas = () => {
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

  const loadShapes = (): Shape[] => {
    const storedShapes = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedShapes) {
      return JSON.parse(storedShapes);
    }
    return [
      {
        id: "rect1",
        x: 100,
        y: 100,
        width: 110,
        height: 230,
        label: "コンプレッサ",
      },
      {
        id: "rect2",
        x: 300,
        y: 100,
        width: 100,
        height: 50,
        label: "エアータンク",
      },
      {
        id: "rect3",
        x: 300,
        y: 300,
        width: 140,
        height: 70,
        label: "クーリングタワー",
      },
      {
        id: "rect4",
        x: 100,
        y: 300,
        width: 150,
        height: 70,
        label: "蒸気ボイラ",
      },
      {
        id: "rect5",
        x: 500,
        y: 300,
        width: 100,
        height: 50,
        label: "給水タンク",
      },
      { id: "rect6", x: 500, y: 300, width: 90, height: 90, label: "軟水装置" },
    ];
  };

  const [shapes, setShapes] = useState<Shape[]>(loadShapes);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<any>(null);

  const [lines] = useState<
    { from: string; to: string; width: number; color: string }[]
  >([
    { from: "rect1", to: "rect2", width: 3, color: "black" },
    { from: "rect2", to: "rect3", width: 3, color: "black" },
    { from: "rect3", to: "rect4", width: 3, color: "black" },
    { from: "rect3", to: "rect5", width: 3, color: "black" },
    { from: "rect1", to: "rect6", width: 3, color: "black" },
  ]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(shapes));
  }, [shapes]);

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

  const handleClose = () => {
    setSelectedShape(null);
  };

  return (
    <div className="flex flex-col h-screen ">
      <Header />
      <div className="flex-1 flex justify-center items-center">
        <div
          ref={containerRef}
          className="w-[70%] h-[70%] border-2 border-black flex justify-center items-center overflow-hidden"
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
                const startCenterX = fromShape.x + fromShape.width / 2;
                const startCenterY = fromShape.y + fromShape.height / 2;
                const endCenterX = toShape.x + toShape.width / 2;
                const endCenterY = toShape.y + toShape.height / 2;

                // const startX = fromShape.x + fromShape.width / 2;
                // const startY = fromShape.y + fromShape.height / 2;
                // const endX = toShape.x + toShape.width / 2;
                // const endY = toShape.y + toShape.height / 2;
                let startX, startY, endX, endY;
                let middleX1, middleY1, middleX2, middleY2;
                if (
                  endCenterX - startCenterX < endCenterY - startCenterY &&
                  startCenterX - endCenterX < endCenterY - startCenterY
                ) {
                  startX = fromShape.x + fromShape.width / 2;
                  startY = fromShape.y + fromShape.height;
                  endX = toShape.x + toShape.width / 2;
                  endY = toShape.y;
                  middleX1 = startX;
                  middleY1 = (endY + startY) / 2;
                  middleX2 = endX;
                  middleY2 = (endY + startY) / 2;
                } else if (
                  endCenterX - startCenterX > endCenterY - startCenterY &&
                  startCenterX - endCenterX > endCenterY - startCenterY
                ) {
                  startX = fromShape.x + fromShape.width / 2;
                  startY = fromShape.y;
                  endX = toShape.x + toShape.width / 2;
                  endY = toShape.y + toShape.height;
                  middleX1 = startX;
                  middleY1 = (endY + startY) / 2;
                  middleX2 = endX;
                  middleY2 = (endY + startY) / 2;
                } else if (
                  endCenterX - startCenterX < endCenterY - startCenterY &&
                  startCenterX - endCenterX > endCenterY - startCenterY
                ) {
                  startX = fromShape.x;
                  startY = fromShape.y + fromShape.height / 2;
                  endX = toShape.x + toShape.width;
                  endY = toShape.y + toShape.height / 2;
                  middleX1 = (endX + startX) / 2;

                  middleY1 = startY;
                  middleX2 = (endX + startX) / 2;
                  middleY2 = endY;
                } else {
                  startX = fromShape.x + fromShape.width;
                  startY = fromShape.y + fromShape.height / 2;
                  endX = toShape.x;
                  endY = toShape.y + toShape.height / 2;
                  middleX1 = (endX + startX) / 2;

                  middleY1 = startY;
                  middleX2 = (endX + startX) / 2;
                  middleY2 = endY;
                }

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
                    fill={line.color} // 矢印の先端を塗りつぶす
                    strokeWidth={line.width}
                    lineCap="round"
                    lineJoin="round"
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
                    key={shape.id}
                    width={shape.width}
                    height={shape.height}
                    fill="white"
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
              {selectedShape && (
                <Group
                  x={selectedShape.x + selectedShape.width + 10}
                  y={selectedShape.y}
                >
                  <Rect
                    width={150}
                    height={100}
                    fill="white"
                    stroke="black"
                    strokeWidth={1}
                  />
                  <Text
                    text={`ID: ${selectedShape.id}`}
                    fontSize={14}
                    fill="black"
                    x={10}
                    y={10}
                  />
                  <Text
                    text={`ラベル: ${selectedShape.label}`}
                    fontSize={14}
                    fill="black"
                    x={10}
                    y={30}
                  />
                  <Text
                    text={`サイズ: ${selectedShape.width}x${selectedShape.height}`}
                    fontSize={14}
                    fill="black"
                    x={10}
                    y={50}
                  />
                  <Text
                    text="閉じる"
                    fontSize={14}
                    fill="red"
                    x={10}
                    y={70}
                    onClick={handleClose}
                  />
                </Group>
              )}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
