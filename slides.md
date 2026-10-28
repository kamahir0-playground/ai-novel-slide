---
theme: default
colorSchema: dark
themeConfig:
  primary: '#38bdf8'
title: 小説を読んでいたらCI/CDを構築していた
info: |
  AIで作った小説をKindleで読むことを出発点に、Markdownから縦書きEPUBを生成し、GitHub ActionsとGoogle Drive APIで管理・配信する個人用の「なんちゃってCI/CD」。
  AIによる内容校閲の試行と、採用を見直した経緯にも短く触れる。
class: text-center
layout: cover
transition: slide-left
mdc: true
drawings:
  persist: false
defaults:
  background: /images/background.jpg
  backgroundSize: cover
  backgroundPosition: center
---

<h1 class="text-5xl leading-tight font-bold">小説を読んでいたら<br>CI/CDを構築していた</h1>

<!--
- AI小説をKindleで読みたい → 個人制作の話
- 原稿→EPUB→更新版を届ける作業をGitHub Actions化 → CI/CDに近い形
- 申請説明: GitHub Actions / Google Drive API / AI の「なんちゃってCI/CD」
- AI生成コード多め。構成と運用の紹介（苦労話ではない）
-->

---
layout: default
---

# 出発点は、AIで作った小説をKindleで読むこと

<div class="mt-10 grid grid-cols-5 gap-6 items-center">
  <div class="col-span-2 rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center">
    <div class="text-5xl mb-5">📖</div>
    <div class="text-2xl font-semibold">小説の原稿</div>
    <div class="mt-4 text-lg text-slate-300">AIも使って制作<br>Markdownで保存</div>
  </div>
  <div class="col-span-1 text-center text-5xl text-slate-500">→</div>
  <div class="col-span-2 rounded-2xl border border-sky-500/40 bg-sky-950/20 p-8 text-center">
    <div class="text-5xl mb-5">📱</div>
    <div class="text-2xl font-semibold">Kindleで読みたい</div>
    <div class="mt-4 text-lg text-slate-300">縦書き・右開きで<br>実際に読める形へ</div>
  </div>
</div>

<div class="mt-10 text-center text-xl text-slate-300">小説を作る話ではなく、<span class="font-semibold text-white">原稿を読むまでの仕組み</span>の話です。</div>

<!--
- 目的: AI制作小説をKindleで読む
- Markdown→電子書籍変換から仕組みが増えた
- 取り込みはスマホのDriveアプリ + Kindleアプリ
- 「Kindle端末で読みたい」出発点と、今の取り込み経路は別物として説明
-->

---
layout: default
---

# まずはMarkdownを、縦書きEPUBにする

<div class="mt-10 rounded-2xl border border-slate-700 bg-slate-900/60 p-7">
  <div class="grid grid-cols-5 gap-4 items-center text-center">
    <div class="col-span-2 rounded-xl bg-slate-800 p-6">
      <div class="text-sky-300 text-2xl font-semibold mb-4">Markdown</div>
      <div class="font-mono text-base text-left leading-8 text-slate-200"># 作品タイトル<br>## 章タイトル<br><br>本文……</div>
    </div>
    <div class="col-span-1">
      <div class="text-3xl text-slate-400">→</div>
      <div class="mt-3 text-sm text-slate-400">Python<br>組版・検証</div>
    </div>
    <div class="col-span-2 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-6">
      <div class="text-emerald-300 text-2xl font-semibold mb-4">EPUB</div>
      <div class="text-xl leading-9">縦書き・右開き<br>章番号・目次<br>Kindleで読むためのファイル</div>
    </div>
  </div>
</div>

<div class="mt-7 rounded-xl bg-slate-800/70 p-5 font-mono text-lg text-center">task kindle -- novel/proto2/proto2-ep01.md</div>
<div class="mt-4 text-base text-slate-400">内部ではPython・HTML/CSS・Vivliostyle CLIを利用。生成後にEPUBの構成も検証する。</div>

<!--
- 原稿はMarkdownサブセット
- Pythonビルダー + Vivliostyle CLI → 縦書き・右開きEPUB
- 章番号・目次は生成側で付与
- ファイル構成・目次リンク・縦書き設定も検証
-->

---
layout: default
---

# Kindleを、配信の終点にはしなかった

<div class="mt-10 grid grid-cols-2 gap-7">
  <div class="rounded-2xl border border-emerald-500/40 bg-slate-900/70 p-8">
    <div class="text-emerald-300 text-xl font-semibold">ライブラリへ送る</div>
    <div class="mt-7 text-3xl font-bold">自動化の手段がある</div>
    <div class="mt-5 text-lg text-slate-300">EPUBをKindle側へ渡す経路は用意できる。</div>
  </div>
  <div class="rounded-2xl border border-amber-500/40 bg-slate-900/70 p-8">
    <div class="text-amber-300 text-xl font-semibold">不要になった版を消す</div>
    <div class="mt-7 text-3xl font-bold">自動管理できない</div>
    <div class="mt-5 text-lg text-slate-300">調べた範囲では、投入済みの版を同じように自動削除できなかった。</div>
  </div>
</div>

<div class="mt-10 border-l-4 border-sky-400 pl-6 text-xl leading-9">
  改稿や別案のたびにファイルが増えるなら、<br>
  <span class="font-semibold text-white">追加だけでなく、整理・削除できる場所</span>に配信したい。
</div>

<!--
- Kindleライブラリへの自動投入も検討
- 投入は一方向自動化可 / 不要版の自動削除は今回の連携では不可
- Kindle全機能の否定ではなく、使える経路での判断
- 別案・PRプレビュー → 追加だけでなく整理・削除できる場所が必要
-->

---
layout: default
---

# Google Driveまでを自動化する

<div class="mt-6 grid grid-cols-5 gap-4 items-stretch text-center">
  <div class="col-span-2 rounded-2xl border border-sky-500/40 bg-sky-950/20 p-6">
    <div class="text-sky-300 text-lg font-bold">ここまで自動</div>
    <div class="mt-5 text-xl leading-9">原稿の変更<br>↓<br>GitHub Actions<br>↓<br>EPUB生成・検証<br>↓<br>Google Drive</div>
  </div>
  <div class="col-span-1 flex flex-col justify-center items-center">
    <div class="text-4xl text-slate-500">→</div>
    <div class="mt-3 text-base text-amber-300 font-semibold">ここで区切る</div>
  </div>
  <div class="col-span-2 rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
    <div class="text-slate-300 text-lg font-bold">ここから手動</div>
    <div class="mt-5 text-xl leading-9">スマホのDriveアプリ<br>↓<br>EPUBをKindleアプリで開く<br>↓<br>ライブラリへインポート<br>↓<br>読む</div>
  </div>
</div>

<div class="mt-5 text-center text-lg leading-snug text-slate-300">Google Driveは<span class="font-semibold text-white">閲覧用EPUBを置く場所</span>であり、Kindleへの自動配信ではない。</div>

<!--
- 自動配信の終点 = Google Drive
- ActionsでEPUB生成 → Drive APIで同期（PRプレビュー・整理も可）
- 読む: Driveアプリ → Kindleアプリ → ライブラリ（手動）
-->

---
layout: default
---

# 原稿もツールも、GitとPRで管理する

<div class="mt-8 grid grid-cols-5 gap-8 items-start">
  <div class="col-span-2 rounded-xl bg-slate-900/75 border border-slate-700 p-6 font-mono text-base leading-9">
    <div class="text-sky-300 font-semibold">ai-novel-alpha/</div>
    <div>├─ novel/proto2/</div>
    <div>├─ CHARACTERS.md</div>
    <div>├─ docs/</div>
    <div>├─ AGENTS.md</div>
    <div>├─ tools/kindle/</div>
    <div>├─ tools/drive/</div>
    <div>└─ .github/workflows/</div>
  </div>
  <div class="col-span-3 space-y-5">
    <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
      <div class="text-xl font-semibold">原稿の変更もPull Requestへ</div>
      <div class="mt-4 text-lg leading-8 text-slate-300">差分を見て、改稿や別案から採用するものを選ぶ。</div>
    </div>
    <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
      <div class="text-xl font-semibold">生成・検査・配信のコードも同居</div>
      <div class="mt-4 text-lg leading-8 text-slate-300">原稿と、その原稿を読むための仕組みを一緒に管理する。</div>
    </div>
  </div>
</div>

<!--
- 原稿・設定・規約・ツール・workflow を同一リポジトリ
- AI生成もGit差分で確認
- 別案は別PR / 採用は人間が決める（CIではない）
-->

---
layout: default
---

# これが「なんちゃってCI/CD」の全体像

<div class="mt-5 rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
  <div class="rounded-xl bg-slate-800 px-6 py-3 text-center text-xl font-semibold">Markdownを変更 → PR / master</div>
  <div class="my-2 text-center text-3xl text-slate-500">↓</div>
  <div class="grid grid-cols-2 gap-5">
    <div class="rounded-xl border border-emerald-500/40 bg-emerald-950/15 p-5">
      <div class="text-emerald-300 text-2xl font-bold">CI｜確認する</div>
      <div class="mt-4 text-lg leading-9">Markdown Lint<br>必要なテスト<br>EPUB生成・検証</div>
    </div>
    <div class="rounded-xl border border-sky-500/40 bg-sky-950/15 p-5">
      <div class="text-sky-300 text-2xl font-bold">CD｜届ける</div>
      <div class="mt-4 text-lg leading-9">EPUBをArtifactとして受け渡し<br>Google Drive APIで同期<br>PR / masterで保存先を分離</div>
    </div>
  </div>
</div>

<div class="mt-5 text-center text-lg leading-snug text-slate-300">一般公開する仕組みではなく、<span class="font-semibold text-white">自分が読むためのビルド＆配信</span>。</div>

<!--
- PRで検査・ビルド・配信する構成
- 本番デプロイではなく自分用EPUB同期 → 「なんちゃってCI/CD」
- 機械判定（Lint等）と曖昧な処理（内容校閲）は区別
-->

---
layout: default
---

# CI：原稿の形式とEPUBの成立を調べる

<div class="mt-9 grid grid-cols-2 gap-7">
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-7">
    <div class="text-emerald-300 text-xl font-semibold">Markdown Lint</div>
    <div class="mt-6 font-mono text-base rounded-lg bg-slate-800 px-4 py-4">python3 tools/kindle/lint.py --all</div>
    <div class="mt-6 text-lg leading-9 text-slate-300">見出し構造・場面転換など、ビルダーが対応する記法を確認する。</div>
  </div>
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-7">
    <div class="text-sky-300 text-xl font-semibold">ビルド・検証</div>
    <div class="mt-6 text-lg leading-10">必要なPythonテスト<br>EPUB生成<br>目次リンク・縦書き設定の検証</div>
    <div class="mt-4 text-base text-slate-400">EPUBを生成できるか、読める構成かを確認</div>
  </div>
</div>

<div class="mt-10 border-l-4 border-emerald-400 pl-6 text-lg text-slate-200">小説の面白さは判定しない。<span class="font-semibold text-white">機械的に判定できる範囲だけ</span>を検査する。</div>

<!--
- Markdownはビルダー対応範囲に制限
- Python Lint（見出し・場面転換など）
- テスト + EPUBビルド・構成検証（文芸評価ではない）
-->

---
layout: default
---

# EPUB側に寄せた、小さな組版処理

<div class="mt-8 grid grid-cols-3 gap-6">
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
    <div class="text-sky-300 text-xl font-bold">章番号・目次</div>
    <div class="mt-7 text-center font-mono text-lg">## 章タイトル</div>
    <div class="my-5 text-center text-3xl text-slate-500">↓</div>
    <div class="text-lg text-center leading-8">章番号を自動付与<br>目次にも反映</div>
  </div>
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
    <div class="text-emerald-300 text-xl font-bold">縦中横</div>
    <div class="mt-7 text-center font-mono text-lg">12人 / A3判</div>
    <div class="my-5 text-center text-3xl text-slate-500">↓</div>
    <div class="text-lg text-center leading-8">短い英数字を<br>縦書き向けに表示</div>
  </div>
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
    <div class="text-violet-300 text-xl font-bold">場面転換</div>
    <div class="mt-7 text-center font-mono text-lg">区切り記号</div>
    <div class="my-5 text-center text-3xl text-slate-500">↓</div>
    <div class="text-lg text-center leading-8">余白・装飾は<br>CSS側で指定</div>
  </div>
</div>

<div class="mt-10 text-center text-xl text-slate-200">原稿は内容を記述し、<span class="font-semibold text-white">表示の都合はビルダーが引き受ける</span>。</div>

<!--
- 章番号は生成時採番
- 短い英数字 → 縦中横 / 場面転換 → CSS
- 本文と組版を分離（原稿の書き換えを減らす）
-->

---
layout: default
---

# 変更内容によって、処理対象を変える

<div class="mt-10 grid grid-cols-3 gap-5">
  <div class="rounded-2xl border border-sky-500/35 bg-slate-900/70 p-6">
    <div class="text-sky-300 text-xl font-bold">原稿だけ変更</div>
    <div class="mt-7 text-lg leading-9">対象原稿を検査<br>対象EPUBを生成<br>プレビューへ同期</div>
  </div>
  <div class="rounded-2xl border border-emerald-500/35 bg-slate-900/70 p-6">
    <div class="text-emerald-300 text-xl font-bold">ビルダーを変更</div>
    <div class="mt-7 text-lg leading-9">関連テストを実行<br>全原稿を再ビルド<br>組版への影響を確認</div>
  </div>
  <div class="rounded-2xl border border-violet-500/35 bg-slate-900/70 p-6">
    <div class="text-violet-300 text-xl font-bold">masterに反映</div>
    <div class="mt-7 text-lg leading-9">変更に応じてビルド<br>master用Driveへ同期<br>プレビューと分離</div>
  </div>
</div>

<div class="mt-10 rounded-xl bg-slate-800/70 p-5 text-center text-xl">原稿を1つ変えるたびに、<span class="font-semibold text-white">全作品を再生成しない</span>。</div>

<!--
- 変更ファイルで再ビルド範囲を切り替え
- 原稿のみ → 対象中心 / ビルダー・表示資産 → 全原稿
- workflow + build_inputs.py で判定
-->

---
layout: default
---

# CD：PRは試し読み、masterは普段用

<div class="mt-5 grid grid-cols-2 gap-5">
  <div class="rounded-2xl border border-sky-500/40 bg-slate-900/70 p-6">
    <div class="text-sky-300 text-xl font-bold">Pull Request</div>
    <div class="mt-4 rounded-lg bg-slate-800 p-3 text-center text-xl">別案ごとのプレビュー</div>
    <div class="mt-4 text-lg leading-8 text-slate-300">masterと混ぜずに同期。<br>PR終了時などに不要な置き場を片付ける。</div>
  </div>
  <div class="rounded-2xl border border-emerald-500/40 bg-slate-900/70 p-6">
    <div class="text-emerald-300 text-xl font-bold">master</div>
    <div class="mt-4 rounded-lg bg-slate-800 p-3 text-center text-xl">採用版の保存先</div>
    <div class="mt-4 text-lg leading-8 text-slate-300">確定した原稿を同期。<br>未変更EPUBの再アップロードは避ける。</div>
  </div>
</div>

<div class="mt-5 rounded-xl border border-slate-700 bg-slate-900/60 p-5">
  <div class="grid grid-cols-5 gap-4 items-center text-center">
    <div class="col-span-2"><span class="text-lg font-semibold text-emerald-300">Buildジョブ</span><div class="mt-2 text-base text-slate-300">EPUB生成・検証<br>Actions Artifactに保存</div></div>
    <div class="col-span-1 text-3xl text-slate-500">→</div>
    <div class="col-span-2"><span class="text-lg font-semibold text-sky-300">Deployジョブ</span><div class="mt-2 text-base text-slate-300">Artifactを取得<br>Drive APIで同期</div></div>
  </div>
  <div class="mt-4 border-t border-slate-700 pt-3 text-center text-sm leading-snug text-slate-400">Drive認証情報はBuildジョブでは使わない。Buildと同期の成功・失敗も分けて把握する。</div>
</div>

<!--
- PRプレビュー / master でDrive保存先を分離
- PR終了時にプレビュー削除 / masterは未変更EPUBの再同期を避ける
- Build → Artifact → Deploy（BuildにDrive認証なし）
- ジョブ分離 = 担当・認証の分離（全面セキュリティ保証ではない）
-->

---
layout: default
---

# AIによる内容校閲も追加したが、見直す方針

<div class="mt-8 grid grid-cols-2 gap-6">
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-7">
    <div class="text-sky-300 text-xl font-bold">試したこと</div>
    <div class="mt-6 text-lg leading-9">安価なLLMで<br>人物・時間・条件の矛盾を探し<br>PRへ疑義を報告する</div>
  </div>
  <div class="rounded-2xl border border-amber-500/40 bg-slate-900/70 p-7">
    <div class="text-amber-300 text-xl font-bold">実原稿で見えた限界</div>
    <div class="mt-6 text-lg leading-9">指摘できない疑義が残る<br>改良案で話者誤認も発生<br>長文では不完全応答も発生</div>
  </div>
</div>

<div class="mt-7 text-xl text-center font-semibold">内容の品質保証を任せる用途には届かず、<span class="text-amber-300">自動校閲CIは廃止の方向</span>。</div>
<div class="mt-4 text-sm text-slate-400 text-center">3原稿 × 3方式 × 3回の比較を実施（27試行中25試行が正常完走）。指摘候補の正誤には未裁定部分あり。</div>
<div class="mt-4 text-sm text-slate-400 text-center">参照：<a href="https://github.com/kamahir0/ai-novel-alpha/pull/123" class="underline">実験PR #123</a> / <a href="https://github.com/kamahir0/ai-novel-alpha/pull/124" class="underline">検証記録PR #124</a></div>

<!--
- 制作・コード生成AIとは別の「内容校閲」試行
- 安価LLM / 分割解析 / 矛盾疑義をPRへ
- 27試行中25完走（完走≠検出性能）/ 漏れ・話者誤帰属・出力上限
- 評価もAI / 指摘は確定誤りではない
- 自動校閲CIは廃止方向（workflowには残存）/ 本編は読むためのCI/CD
-->

---
layout: center
class: text-center
title: まとめ
---

<div class="max-w-5xl mx-auto">
  <div class="text-sky-300 tracking-widest text-lg mb-8">まとめ</div>
  <h1 class="text-4xl leading-tight font-bold">Kindleで小説を読みたかったら、<br>Driveまでの「なんちゃってCI/CD」ができた。</h1>
  <div class="mt-12 grid grid-cols-3 gap-5 text-left">
    <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div class="text-sky-300 font-bold text-xl">作る</div>
      <div class="mt-4 text-lg leading-8">Markdownから<br>縦書きEPUB</div>
    </div>
    <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div class="text-emerald-300 font-bold text-xl">確かめる</div>
      <div class="mt-4 text-lg leading-8">PRでLint・<br>ビルド・検証</div>
    </div>
    <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div class="text-violet-300 font-bold text-xl">届ける</div>
      <div class="mt-4 text-lg leading-8">Driveに同期して<br>必要な版だけKindleへ</div>
    </div>
  </div>
  <div class="mt-10 text-xl text-slate-200">自動化の終点は、<span class="font-semibold text-white">追加も後片付けも管理できるGoogle Drive</span>。</div>
  <div class="mt-9 text-base text-slate-400">ありがとうございました</div>
</div>

<!--
- 出発点: AI小説をKindleで読みたい
- MD→EPUB→Actions検査→Driveまで自動 / Kindle取り込みは手動
- Kindleで削除管理できない → Driveを終点に
- 個人用 Git + CI/CD の現状
-->
