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
const Canvas2 = () => {
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
        id: `left-${i}`,
        x: 0,
        y: i * 150,
        width: boxSize,
        height: boxSize,
        label: `L${i + 1}`,
      });
    }
    for (let i = 0; i < middleCount; i++) {
      shapes.push({
        id: `middle-${i}`,
        x: 200,
        y: i * 150,
        width: boxSize,
        height: boxSize,
        label: `M${i + 1}`,
      });
    }
    for (let i = 0; i < rightCount; i++) {
      shapes.push({
        id: `right-${i}`,
        x: 400,
        y: i * 150,
        width: boxSize,
        height: boxSize,
        label: `R${i + 1}`,
      });
    }
    for (let i = 0; i < anotherCount; i++) {
      shapes.push({
        id: `another-${i}`,
        x: 600,
        y: i * 150,
        width: boxSize,
        height: boxSize,
        label: `A${i + 1}`,
      });
    }
    for (let i = 0; i < excetraCount; i++) {
      shapes.push({
        id: `excetra-${i}`,
        x: 800,
        y: i * 150,
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
  useEffect(() => {
    const newLines: {
      id: number;
      from: string;
      to: string;
      width: number;
      color: string;
    }[] = [];

    shapes.forEach((left) => {
      if (left.id.startsWith("left")) {
        shapes.forEach((middle) => {
          if (middle.id.startsWith("middle") && Math.random() < 0.5) {
            if (
              !newLines.some(
                (line) => line.from === left.id && line.to === middle.id
              )
            ) {
              newLines.push({
                id: lineIdCounter.current++, // 一意のIDを付与
                from: left.id,
                to: middle.id,
                width: 3,
                color: "black",
              });
            }
          }
        });
      }
    });

    shapes.forEach((middle) => {
      if (middle.id.startsWith("middle")) {
        shapes.forEach((right) => {
          if (right.id.startsWith("right") && Math.random() < 0.5) {
            if (
              !newLines.some(
                (line) => line.from === middle.id && line.to === right.id
              )
            ) {
              newLines.push({
                id: lineIdCounter.current++, // 一意のIDを付与
                from: middle.id,
                to: right.id,
                width: 3,
                color: "black",
              });
            }
          }
        });
      }
    });
    shapes.forEach((right) => {
      if (right.id.startsWith("right")) {
        shapes.forEach((another) => {
          if (another.id.startsWith("another") && Math.random() < 0.5) {
            if (
              !newLines.some(
                (line) => line.from === right.id && line.to === another.id
              )
            ) {
              newLines.push({
                id: lineIdCounter.current++, // 一意のIDを付与
                from: right.id,
                to: another.id,
                width: 3,
                color: "black",
              });
            }
          }
        });
      }
    });
    shapes.forEach((another) => {
      if (another.id.startsWith("another")) {
        shapes.forEach((excetra) => {
          if (excetra.id.startsWith("excetra") && Math.random() < 0.5) {
            if (
              !newLines.some(
                (line) => line.from === another.id && line.to === excetra.id
              )
            ) {
              newLines.push({
                id: lineIdCounter.current++, // 一意のIDを付与
                from: another.id,
                to: excetra.id,
                width: 3,
                color: "black",
              });
            }
          }
        });
      }
    });

    setLines(newLines); // 状態を更新
  }, [leftCount, middleCount, rightCount, anotherCount, excetraCount]); // 依存配列に追加

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
  const [_selectedShape, setSelectedShape] = useState<{
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

  // const handleClose = () => {
  //   setSelectedShape(null);
  // };
  useEffect(() => {
    setShapes(generateShapes());
  }, [leftCount, middleCount, rightCount, anotherCount, excetraCount]);

  return (
    <div className="flex flex-col h-screen ">
      <Header />
      <div className="flex-1 flex justify-center flex-col items-center ">
        <div className="flex justify-center items-center space-x-4 m-1 mt-2">
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

        <div
          ref={containerRef}
          className="w-[70%] h-[70%] border-2 border-black flex justify-center items-center overflow-hidden mt-2"
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
                const fromIndex = fromShapes.findIndex((l) => l.id === line.id);
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
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default Canvas2;
