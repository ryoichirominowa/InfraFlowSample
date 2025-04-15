import { Stage, Layer, Rect, Group, Text, Arrow, Line } from "react-konva";
import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import { useStore } from "../stores/shapeStores";
import { KonvaEventObject } from "konva/lib/Node";

const Canvas8 = () => {
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
  interface Line {
    id: number;
    from: string;
    to: string;
    type: string;
    color: string;
    width: number;
  }
  const [lines, setLines] = useState<Line[]>([]); // 初期データ設定
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
  const GRID_SIZE = 100; // グリッドのサイズ
  const Grid = () => {
    const EXTEND = 2000; // グリッドをどれだけ広げるか（必要に応じて調整）

    const gridLines = [];

    for (let i = -EXTEND; i < stageSize.width + EXTEND; i += GRID_SIZE) {
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[i, -EXTEND, i, stageSize.height + EXTEND]}
          stroke="lightgray"
          strokeWidth={0.5}
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
        />
      );
    }

    return <>{gridLines}</>;
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>, id: string) => {
    const newX =
      Math.round((e.target.x() - GRID_SIZE) / (GRID_SIZE * 2)) * GRID_SIZE * 2 +
      GRID_SIZE;
    const newY =
      Math.round((e.target.y() - GRID_SIZE) / (GRID_SIZE * 2)) * GRID_SIZE * 2 +
      GRID_SIZE;

    // shapesを更新してスナップ後の座標を保存
    const updatedShapes = shapes.map((shape) =>
      shape.id === id ? { ...shape, x: newX, y: newY } : shape
    );
    setShapes(updatedShapes);
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

  const handleTextClick = (
    selectedShapeId: string,
    shapeId: string,
    types: string[]
  ) => {
    if (!selectedShape) return;

    const newLines: typeof lines = [];
    const newTypes: string[] = [];

    types.forEach((t) => {
      const exists = lines.some(
        (line) =>
          line.from === selectedShape.id &&
          line.to === shapeId &&
          line.type.includes(t) // line.type は配列前提
      );

      if (!exists) {
        newLines.push({
          id: lineIdCounter.current++,
          from: selectedShape.id,
          to: shapeId,
          width: 3,
          color: typeColorMap[t] || "black",
          type: t, // 単一typeを持つ配列
        });
        newTypes.push(t);
      }
    });

    if (newLines.length > 0) {
      setLines((prevLines) => [...prevLines, ...newLines]);

      const updatedShapes = shapes.map((shape) => {
        if (shape.id === shapeId || shape.id === selectedShapeId) {
          const addedTypes = newTypes.filter((t) => !shape.type.includes(t));
          return {
            ...shape,
            type: [...shape.type, ...addedTypes],
          };
        }
        return shape;
      });

      setShapes(updatedShapes);
    }
  };

  const labels = ["冷水", "温水", "電気", "蒸気"];

  type ColumnSelectorProps = {
    id: string;
    label: string;
    selectedValues: string[]; // 複数選択対応
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
        // チェック解除
        setSelectedValues(selectedValues.filter((v) => v !== option));
      } else {
        // チェック追加
        setSelectedValues([...selectedValues, option]);
      }
    };

    return (
      <div className="mb-2">
        <p className="block font-bold">{label}</p>
        <div className="flex space-x-4">
          {labels.map((option) => (
            <label
              key={`${id}-${option}`}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                name={id}
                value={option}
                checked={selectedValues.includes(option)}
                onChange={() => handleCheckboxChange(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const [leftLabels, setLeftLabels] = useState<string[]>([]);
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
  interface Point {
    x: number;
    y: number;
  }
  const [linesWithPoints, setLinesWithPoints] = useState<LineWithPoints[]>([]);
  interface LineWithPoints extends Line {
    points: number[];
  }
  // lines または shapes が変更されたら linesWithPoints を再計算
  useEffect(() => {
    setLinesWithPoints(
      lines
        .map((line) => {
          const fromShape = shapes.find((s) => s.id === line.from);
          const toShape = shapes.find((s) => s.id === line.to);
          if (!fromShape || !toShape) {
            // 接続先のシェイプが見つからない場合は描画しない
            return null;
          }
          const points = getArrowPoints(fromShape, toShape, line.type);
          return { ...line, points };
        })
        .filter((item): item is LineWithPoints => item !== null) // null を除去し型ガード
    );
  }, [lines, shapes]); // 依存配列に lines と shapes を指定
  // Arrow クリック時の処理
  const handleArrowClick = (clickedLineId: number) => {
    console.log("click");
    setLinesWithPoints((currentLines) =>
      currentLines.map((line) => {
        if (line.id === clickedLineId) {
          const newPoints = [...line.points]; // 必ず新しい配列を作成して変更
          console.log(newPoints);
          // getArrowPoints のロジックに基づいて加算対象のインデックスを決定
          // points 配列の長さで中間点の有無を判断 (8要素 = 中間点なし, 12要素 = 中間点あり)
          const hasIntermediatePoints = newPoints.length === 12;

          // 指定された座標点に対応するインデックスの値に 10 を加算
          // 配列の境界チェックも念のため行う

          if (newPoints.length > 1) newPoints[1] += 10; // startY
          if (newPoints.length > 2) newPoints[2] += 10; // middle1.x
          if (newPoints.length > 3) newPoints[3] += 10; // middle1.y

          const middle2xIndex = hasIntermediatePoints ? 8 : 4;
          if (newPoints.length > middle2xIndex) newPoints[middle2xIndex] += 10; // middle2.x

          const middle2yIndex = hasIntermediatePoints ? 9 : 5;
          if (newPoints.length > middle2yIndex) newPoints[middle2yIndex] += 10; // middle2.y

          const endYIndex = hasIntermediatePoints ? 11 : 7;
          if (newPoints.length > endYIndex) newPoints[endYIndex] += 10; // endY
          console.log(newPoints);
          return { ...line, points: newPoints };
        }
        return line;
      })
    );
  };
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

    const middle1 = {
      x: startX + (100 * multiplier) / divisor,
      y: startY,
    };
    const middle2 = {
      x: endX - (100 - (100 * multiplier) / divisor),
      y: endY,
    };

    const areMiddlesEqual = middle1.x === middle2.x && middle1.y === middle2.y;

    if (areMiddlesEqual) {
      return [startX, startY, endX, endY];
    }

    // 中間点を作成する処理を挿入
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

    // 中間点不要の場合
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

  return (
    <div className="flex flex-col h-screen ">
      <Header />
      <div className="flex-1 flex justify-center flex-col items-center w-full pt-30">
        <div className="flex justify-start items-start space-x-4 m-1">
          <div className="p-1">
            <ColumnSelector
              id="left"
              label="グループ"
              selectedValues={leftLabels}
              setSelectedValues={setLeftLabels}
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
                      <span className="font-semibold">グループ:</span>{" "}
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
                        onClick={() =>
                          handleTextClick(
                            selectedShape.id,
                            shape.id,
                            leftLabels
                          )
                        } // Textクリック時にlineを追加
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
                <Grid />
                {linesWithPoints
                  .filter((line) => leftLabels.includes(line.type)) // 必要に応じてフィルタリング
                  .map((line) => {
                    // map の key は一意な line.id を使うのが望ましい
                    return (
                      <Arrow
                        key={line.id}
                        points={line.points}
                        stroke={line.color}
                        fill={line.color}
                        strokeWidth={line.width}
                        lineCap="round"
                        lineJoin="round"
                        // クリックハンドラを新しい関数に変更
                        onClick={() => handleArrowClick(line.id)}
                        // タッチデバイス用
                        onTap={() => handleArrowClick(line.id)}
                      />
                    );
                  })}
                {shapes
                  .filter((shape) =>
                    shape.type.some((t) => leftLabels.includes(t))
                  )
                  .map((shape) => (
                    <Group
                      key={shape.id}
                      x={shape.x}
                      y={shape.y}
                      draggable
                      onDragStart={() => setIsDragging(false)}
                      onDragMove={(e) => handleDragMove(e, shape.id)}
                      onDragEnd={(e) => handleDragEnd(e, shape.id)}
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

export default Canvas8;
