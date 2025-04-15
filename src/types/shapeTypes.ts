// 例: src/types/shapeTypes.ts （ファイルパスはプロジェクトに合わせてください）

/**
 * キャンバス上に描画される図形（Shape）の基本的なデータ構造を定義します。
 */
export interface Shape {
  /**
   * 図形を一意に識別するためのID (例: "0-A1", "1-B2")
   */
  id: string;

  /**
   * 図形の左上のX座標
   */
  x: number;

  /**
   * 図形の左上のY座標
   */
  y: number;

  /**
   * 図形の幅
   */
  width: number;

  /**
   * 図形の高さ
   */
  height: number;

  /**
   * 図形内に表示されるラベルテキスト (例: "ポンプ A", "熱交換器 B")
   */
  label: string;

  /**
   * この図形が属するグループ（または機能、系統など）を示す文字列の配列。
   * (例: ["冷水", "蒸気"], ["電気"])
   * これにより、フィルタリングや線の色分けに使用されます。
   */
  type: string[];

  // --- オプション: 必要に応じて追加する可能性のあるプロパティ ---
  /**
   * 図形の色（特定の状態を示す場合など）
   */
  // color?: string;

  /**
   * その他のカスタムデータ
   */
  // data?: any;
}

/**
 * 図形の具体的な種類を示す型 (もし使う場合)
 * 例: 四角形、円、カスタム形状など
 * 前のコード例では直接は使用されていませんでした。
 * もし不要であれば、この型定義とインポート文 (`import { ..., ShapeType }`) から
 * ShapeType を削除してください。
 */
export type ShapeType = "Rectangle" | "Circle" | "CustomNode";

/**
 * 機器のタイプや系統のタイプを示す型エイリアス (もし使う場合)
 * '冷水', '温水' などの文字列リテラルを型として定義することで、
 * タイプミスの防止などに役立ちます。
 */
export type EquipmentType = "冷水" | "温水" | "電気" | "蒸気";
