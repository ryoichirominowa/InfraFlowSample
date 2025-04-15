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
const Canvas3 = () => {
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
  const boxSize = 100;

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
  useEffect(() => {
    const newLines: {
      id: number;
      from: string;
      to: string;
      width: number;
      color: string;
      type: string;
    }[] = [];

    shapes.forEach((left) => {
      if (Math.random() < 0.3) {
        newLines.push({
          id: lineIdCounter.current++, // 一意のIDを付与
          from: left.id,
          to: left.id,
          width: 3,
          color: "#D4A017",
          type: "input",
        });
        newLines.push({
          id: lineIdCounter.current++, // 一意のIDを付与
          from: left.id,
          to: left.id,
          width: 3,
          color: "blue",
          type: "input",
        });
        newLines.push({
          id: lineIdCounter.current++, // 一意のIDを付与
          from: left.id,
          to: left.id,
          width: 3,
          color: "blue",
          type: "input",
        });
        newLines.push({
          id: lineIdCounter.current++, // 一意のIDを付与
          from: left.id,
          to: left.id,
          width: 3,
          color: "blue",
          type: "output",
        });
      } else if (Math.random() < 0.6) {
        newLines.push({
          id: lineIdCounter.current++, // 一意のIDを付与
          from: left.id,
          to: left.id,
          width: 3,
          color: "blue",
          type: "input",
        });
        newLines.push({
          id: lineIdCounter.current++, // 一意のIDを付与
          from: left.id,
          to: left.id,
          width: 3,
          color: "blue",
          type: "output",
        });
      } else {
        newLines.push({
          id: lineIdCounter.current++, // 一意のIDを付与
          from: left.id,
          to: left.id,
          width: 3,
          color: "#D4A017",
          type: "input",
        });
        newLines.push({
          id: lineIdCounter.current++, // 一意のIDを付与
          from: left.id,
          to: left.id,
          width: 3,
          color: "#D4A017",
          type: "output",
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
                if (!fromShape) return null;
                // `input` と `output` を分けて取得
                const inputShapes = lines.filter(
                  (s) => s.from === line.from && s.type === "input"
                );
                const outputShapes = lines.filter(
                  (s) => s.from === line.from && s.type === "output"
                );

                // 自分のインデックスを取得
                const index = (
                  line.type === "input" ? inputShapes : outputShapes
                ).findIndex((l) => l.id === line.id);

                // 中央基準でY座標を調整
                const totalInputs = inputShapes.length || 1;
                const totalOutputs = outputShapes.length || 1;
                const centerY = fromShape.y + fromShape.height / 2; // 中央Y座標

                let startX, startY, endX, endY;
                if (line.type === "input") {
                  startX = fromShape.x - 50;
                  startY =
                    centerY +
                    (index - (totalInputs - 1) / 2) *
                      (fromShape.height / totalInputs);
                  endX = fromShape.x;
                  endY =
                    centerY +
                    (index - (totalInputs - 1) / 2) *
                      (fromShape.height / totalInputs);
                } else {
                  startX = fromShape.x + fromShape.width;
                  startY =
                    centerY +
                    (index - (totalOutputs - 1) / 2) *
                      (fromShape.height / totalOutputs);
                  endX = fromShape.x + fromShape.width + 50;
                  endY =
                    centerY +
                    (index - (totalOutputs - 1) / 2) *
                      (fromShape.height / totalOutputs);
                }

                {
                  /* {lines.map((line, i) => {
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
              } */
                }

                return (
                  <Arrow
                    key={i}
                    points={[startX, startY, endX, endY]}
                    stroke={line.color}
                    fill={line.color}
                    strokeWidth={4}
                    lineCap="round"
                    lineJoin="round"
                    onClick={() => handleLinkClick(line)}
                    shadowColor="black" // 黒い影（枠）をつける
                    shadowBlur={2} // ぼかし具合（値を大きくすると太く見える）
                    shadowOffsetX={1} // 横方向の影の位置
                    shadowOffsetY={1} // 縦方向の影の位置
                    shadowOpacity={0.8} // 影の透明度
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

export default Canvas3;
