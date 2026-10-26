# Slidev Presentation Template

[Slidev](https://sli.dev/) を使った汎用プレゼンテーションスライド作成テンプレートです。  
Markdownでスライドを高速に作成でき、コードハイライト・図解・コンポーネント埋め込み・PDF書き出し・GitHub Pages公開に対応しています。

---

## 🚀 このテンプレートの使い方

### 1. GitHub 上で新しいスライドを作る場合（推奨）
このリポジトリを **GitHubの「Template Repository」** として登録しておくと、画面上部の **「Use this template」**（テンプレートを使用）ボタンから、綺麗な初期コミット履歴で新しいスライドリポジトリをワンクリック作成できます。

> **💡 なぜ Fork ではなく Template なのか？**  
> - **Fork**: コミット履歴が引き継がれ、同一GitHubアカウント内に複数作れず、親リポジトリへのPRがデフォルトになるなどの制限があります。  
> - **Template**: コミット履歴のない独立した新規リポジトリとして作成でき、同一アカウント内にいくつでも新規スライド用リポジトリを作れます。

### 2. ローカルから直接使う場合
```bash
# degit を使ってクローンする場合（.git履歴なしで取得）
npx degit <あなたのGitHubユーザー名>/slidev-template my-new-presentation
cd my-new-presentation

# 依存関係のインストール（自動でgitフックも設定されます）
npm install
```

---

## 🛠️ コマンド一覧

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーを起動し、ブラウザで自動オープン（デフォルト: `http://localhost:3030`） |
| `npm run build` | 静的HTML（SPA）として `dist/` にビルド |
| `npm run export` | PDFファイルとしてエクスポート（要: Playwright） |
| `npm run export:png` | 各スライドをPNG画像としてエクスポート |
| `npm run export:pptx` | PowerPoint（`.pptx`）としてエクスポート（動画を自動GIF化して正確に埋め込み） |

---

## 📁 ディレクトリ構成

```text
.
├── .github/workflows/deploy.yml # GitHub Pages自動デプロイ
├── .githooks/pre-commit         # 大容量ファイルコミット防止フック
├── components/                  # カスタムVueコンポーネント置き場
├── public/
│   ├── images/                  # 画像ファイル置き場
│   └── videos/                  # 動画ファイル置き場
├── scripts/
│   ├── check_staged_size.js     # 50MB超メディアファイルの検知スクリプト
│   └── export_pptx_with_gifs.mjs# 動画GIF埋め込み対応PPTXエクスポート
├── styles/
│   └── index.css                # 日本語フォント・カード・バッジ等カスタムCSS
├── package.json
├── README.md
└── slides.md                    # スライド本文（Markdown）
```

---

## 🔒 大容量ファイルの誤コミット防止（Safety Hook）

スライドに動画（`.mov`, `.mp4`）や高解像度画像を配置する際、誤ってGitの容量上限（GitHubは100MBでpush拒否、50MBで警告）を超えるファイルを追加してしまうトラブルを防ぐため、**50MB以上のファイルが含まれているとコミットを自動ブロックするGitフック**が内包されています。

- `npm install` 実行時に `prepare` スクリプトによって自動的に有効化されます。
- ブロックされた場合は、メッセージの指示に従って `git reset HEAD <ファイル名>` でステージングを解除し、圧縮や動画変換を行ってください。

---

## 🎞️ PowerPoint / Google スライドへのエクスポート（動画対応）

通常の Slidev の PPTX 書き出しでは動画が静止画になってしまいますが、本テンプレートの `npm run export:pptx` を使用すると：

1. スライド内の `<video>` 要素を自動検知
2. `ffmpeg` で軽量なループ GIF アニメーションに変換
3. **ブラウザ（Playwright）上でレンダリングされた `<video>` の DOM 座標を自動計測**
4. スライド画像の上からミリ単位で正確な位置・サイズに GIF をオーバーレイ配置した `dist/slides.pptx` を生成
5. スピーカーノート（原稿）も PPTX のノートに自動反映

> **💡 ヒント:**  
> 生成された `dist/slides.pptx` を Google ドライブにアップロードして「Google スライドで開く」と、ブラウザ上や社内共有でも動画が自動ループ再生された状態でプレゼンできます。  
> ※ 動画の GIF 変換にはマシン環境に `ffmpeg` が必要です（入っていない場合は静止画スライドとして出力されます）。

---

## 🎨 スライド作成の基本・カスタマイズ

### 1. スライドの区切り
スライドは `---` で区切ります。

```markdown
---
layout: default
---

# タイトル

内容を記述
```

### 2. レイアウト
- `layout: default`: 通常のコンテンツスライド
- `layout: center`: センター揃え（章の区切りなど）
- `layout: two-cols`: 2カラムスライド（`::right::` で左右を分割）

### 3. アイコンの利用
`@iconify-json/carbon` および `@iconify-json/ri` が設定されているため、Markdown内で直接アイコンタグを使用できます。

```html
<carbon:user /> 発表者名
<carbon:logo-github /> GitHub
<carbon:warning class="text-amber-400" /> 注意事項
```

### 4. スピーカーノート
各スライドの末尾にHTMLコメントで記述すると、プレゼンターモード（`P`キー）で発表原稿として表示されます。

```markdown
<!--
【スピーカーノート】
ここに話す内容の原稿を書きます。
-->
```

---

## 🤖 AIとペアプログラミングしてスライドを作成するコツ

AI（Antigravity、ChatGPT、Claudeなど）にスライド作成を依頼する際は、以下のように指示すると高品質な `slides.md` を出力できます。

```text
【指示例】
以下のテーマ・対象読者で、Slidev用の `slides.md` を作成してください。

- テーマ: ○○○○○○
- 想定時間 / ページ数: 15分（約15〜20ページ）
- 対象読者: ○○○○○○
- 全体トーン: 技術カンファレンス向けの明瞭で論理的なトーン
- 要件:
  - 課題提起 → 解決策 → 実装例 → メリット/デメリット → まとめ の構成
  - コードスニペットの行ハイライトや、Mermaidによるフロー図を含める
  - 各スライドに発表者用のスピーカーノート（<!-- ... -->）を必ず記載する
```

---

## 🌐 GitHub Pages への公開手順

1. GitHubリポジトリの **Settings > Pages** を開きます。
2. **Build and deployment > Source** を **GitHub Actions** に変更します。
3. `main` ブランチにプッシュすると、`.github/workflows/deploy.yml` が自動実行され、スライドが公開されます。
