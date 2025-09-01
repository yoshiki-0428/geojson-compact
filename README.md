# GeoCompact - GeoJSON圧縮&最適化ツール

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.2-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.0-purple" alt="Vite">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</div>

## 🚀 概要

GeoCompactは、WebブラウザでGeoJSONファイルを即座に圧縮・最適化し、リアルタイムでマップ表示できる無料ツールです。完全にクライアントサイド処理で動作し、ユーザーのプライバシーを保護します。

### ✨ 主な機能

- **⚡ 即座に圧縮** - 貼り付けと同時に自動圧縮、設定不要
- **🗺️ リアルタイムマップ表示** - OpenStreetMapで即座にビジュアル化
- **📊 圧縮統計** - 圧縮前後のサイズと削減率を表示
- **📝 履歴管理** - 最新10件の圧縮履歴をlocalStorageに自動保存
- **🔒 完全プライバシー** - すべての処理はブラウザ内で完結
- **📱 レスポンシブ対応** - モバイル・タブレット・デスクトップ対応

## 🛠️ 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite 5
- **スタイリング**: Tailwind CSS + shadcn/ui
- **地図表示**: React-Leaflet + OpenStreetMap
- **状態管理**: React Hooks
- **データ保存**: localStorage API

## 📦 インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/geocompact.git
cd geocompact

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 🚀 デプロイ

### Netlifyへのデプロイ

1. GitHubリポジトリをNetlifyに接続
2. ビルド設定:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. 環境変数の設定（必要に応じて）

### ビルド

```bash
npm run build
```

ビルド成果物は`dist`フォルダに生成されます。

## 🎯 使い方

1. **GeoJSONの入力**
   - テキストエリアに直接貼り付け
   - ファイルをドラッグ&ドロップ
   - 「ファイル選択」ボタンから選択

2. **自動圧縮**
   - 入力後0.5秒で自動的に圧縮処理開始
   - 座標精度の最適化（小数点以下6桁）
   - 不要な空白・プロパティの削除

3. **結果の確認**
   - リアルタイムでマップ表示
   - 圧縮統計の確認
   - ワンクリックでコピーまたはダウンロード

4. **履歴の活用**
   - 最新10件の圧縮履歴から選択
   - ワンクリックで過去のデータを復元

## 🔧 開発

### 開発コマンド

```bash
# 開発サーバー
npm run dev

# TypeScriptチェック
npm run build

# プレビュー
npm run preview

# Lint
npm run lint
```

### プロジェクト構成

```
geocompact/
├── src/
│   ├── components/        # Reactコンポーネント
│   │   ├── ui/           # shadcn/uiコンポーネント
│   │   ├── GeoJSONInput.tsx
│   │   ├── MapView.tsx
│   │   ├── HistoryPanel.tsx
│   │   ├── ResultsPanel.tsx
│   │   └── AdPlacement.tsx
│   ├── utils/            # ユーティリティ関数
│   │   ├── geojson-compressor.ts
│   │   └── history-manager.ts
│   ├── lib/              # ライブラリ設定
│   ├── App.tsx           # メインアプリケーション
│   ├── main.tsx          # エントリーポイント
│   └── index.css         # グローバルスタイル
├── public/               # 静的ファイル
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 📈 パフォーマンス最適化

- **遅延読み込み**: 必要なコンポーネントのみ読み込み
- **デバウンス処理**: 入力後0.5秒待機してから圧縮実行
- **Web Workers対応準備**: 大容量ファイルの処理に対応

## 🔒 セキュリティ

- **完全ローカル処理**: データはサーバーに送信されません
- **XSS対策**: React標準のエスケープ処理
- **安全な出力**: JSONのバリデーション実施

## 📝 ライセンス

MIT License

## 🤝 貢献

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📧 お問い合わせ

- Twitter: [@geocompact](https://twitter.com)
- GitHub Issues: [Issues](https://github.com/yourusername/geocompact/issues)

## 🙏 謝辞

- [OpenStreetMap](https://www.openstreetmap.org/) - 地図データ
- [Leaflet](https://leafletjs.com/) - 地図表示ライブラリ
- [shadcn/ui](https://ui.shadcn.com/) - UIコンポーネント
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク

---

**GeoCompact** - シンプルで高速なGeoJSON圧縮ツール 🗺️