---
theme: default
colorSchema: dark
title: 小説を読んでいたらCI/CDを構築していた
info: |
  小説のMarkdown原稿をGitで管理し、GitHub Actionsで書式検査・縦書きEPUB生成・Google Drive同期を行う個人制作の技術LT。
  安価なLLMによる自動校閲も試したが、実原稿での実測を経て品質保証としての限界を確認した。
class: text-center
layout: cover
transition: slide-left
mdc: true
drawings:
  persist: false
---

<div class="mx-auto max-w-5xl">
  <div class="mb-8 text-lg tracking-widest text-sky-300">個人制作 × GitHub Actions</div>
  <h1 class="text-5xl leading-tight font-bold">小説を読んでいたら<br>CI/CDを構築していた</h1>
  <div class="mt-10 text-2xl text-slate-300">Markdownを管理し、検査し、縦書きEPUBにして読む</div>
  <div class="mt-14 text-base text-slate-400">Git / Pull Request / Python / EPUB / Google Drive</div>
</div>

<!--
趣味でAIエージェントも使いながら小説を制作しています。
今日は小説の書き方や生成プロンプトではなく、原稿を管理し、確認し、自分の端末で読むまでの周辺作業を紹介します。
CI/CDの実装コードもAIが生成したものを多く含みます。手作業でコードを書いた苦労話ではなく、出来上がった仕組みと検証結果の報告です。
-->

---
layout: default
---

# 小説なのに、周辺作業がソフトウェア開発っぽい

<div class="mt-10 grid grid-cols-3 gap-6">
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
    <div class="text-sky-300 text-xl font-semibold">原稿を変える</div>
    <div class="mt-5 text-lg leading-9 text-slate-200">改稿する<br>設定を更新する<br>別案と比較する</div>
    <div class="mt-6 text-sm text-slate-400">差分・履歴が欲しい</div>
  </div>
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
    <div class="text-emerald-300 text-xl font-semibold">原稿を確かめる</div>
    <div class="mt-5 text-lg leading-9 text-slate-200">記法を確認する<br>ビルドできるか調べる<br>読み直す</div>
    <div class="mt-6 text-sm text-slate-400">毎回同じ作業がある</div>
  </div>
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
    <div class="text-violet-300 text-xl font-semibold">読む形にする</div>
    <div class="mt-5 text-lg leading-9 text-slate-200">縦書きにする<br>EPUBを生成する<br>端末へ届ける</div>
    <div class="mt-6 text-sm text-slate-400">原稿の更新に追従したい</div>
  </div>
</div>

<div class="mt-10 rounded-xl border border-sky-500/35 bg-sky-950/25 px-6 py-4 text-xl">
  このうち、繰り返せる処理を <span class="font-bold text-sky-300">GitHub Actions</span> に任せてみた。
</div>

<!--
文章そのものとは別に、バージョン管理、規約チェック、閲覧用ファイルへの変換が必要になりました。
小説に特別なCI/CDが必要だという話ではありません。自分が繰り返していた作業を見ると、一般的な開発のパイプラインに置き換えられそうだったということです。
-->

---
layout: default
---

# 原稿・設定・ツールを、同じリポジトリへ

<div class="grid grid-cols-5 gap-7 mt-9 items-start">
  <div class="col-span-2 rounded-xl bg-slate-900/75 border border-slate-700 p-5 font-mono text-base leading-9">
    <div class="text-sky-300">ai-novel-alpha/</div>
    <div>├─ novel/proto2/</div>
    <div>├─ CHARACTERS.md</div>
    <div>├─ docs/</div>
    <div>├─ AGENTS.md</div>
    <div>├─ tools/kindle/</div>
    <div>└─ .github/workflows/</div>
  </div>
  <div class="col-span-3 space-y-5">
    <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
      <div class="text-xl font-semibold mb-3">制作の単位が Pull Request</div>
      <div class="text-lg leading-8 text-slate-300">原稿・設定・ツールの変更を差分として確認し、採用するものをマージする。</div>
    </div>
    <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
      <div class="text-xl font-semibold mb-3">原稿と組版を分離</div>
      <div class="text-lg leading-8 text-slate-300">Markdownは内容・見出し構造、PythonとCSSは表示・出版形式を担当する。</div>
    </div>
  </div>
</div>

<div class="mt-6 text-sm text-slate-400">ソース：リポジトリ README / docs/MANUSCRIPT_FORMAT.md</div>

<!--
本文、人物設定、執筆規約、EPUBを作るコード、CI/CDの定義までGit管理しています。
AIに草稿やコードを書かせる場合も、Gitの差分で変更を確認できる点が便利です。
ここでは改稿案が複数あっても、同時に同じ話の正史になるとは限りません。採用の判断は人間がします。
-->

---
layout: default
---

# 気づけば、原稿のCI/CDになっていた

<div class="mt-7 rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
  <div class="rounded-lg bg-slate-800 px-6 py-3 text-center text-xl font-semibold">Markdown原稿を変更 → Pull Request / master</div>
  <div class="text-center my-3 text-2xl text-slate-500">↓</div>
  <div class="grid grid-cols-2 gap-5">
    <div class="rounded-xl border border-emerald-500/40 bg-emerald-950/15 p-5">
      <div class="text-emerald-300 text-xl font-bold mb-4">CI｜検査する</div>
      <div class="rounded-lg bg-slate-800 p-4">Markdown Lint</div>
      <div class="mt-3 rounded-lg bg-slate-800 p-4">ビルド・テスト・EPUB検証</div>
      <div class="mt-5 text-sm text-slate-400">結果で作業の成否が分かる</div>
    </div>
    <div class="rounded-xl border border-sky-500/40 bg-sky-950/15 p-5">
      <div class="text-sky-300 text-xl font-bold mb-4">CD｜読むために届ける</div>
      <div class="rounded-lg bg-slate-800 p-4">縦書きEPUBを成果物にする</div>
      <div class="mt-3 rounded-lg bg-slate-800 p-4">Google Driveへ同期する</div>
      <div class="mt-5 text-sm text-slate-400">公開配信ではなく個人用プレビュー</div>
    </div>
  </div>
</div>

<div class="mt-5 text-base text-slate-300">意味の整合性を探すLLM校閲も実装したが、<span class="font-semibold text-amber-300">品質ゲートとは別扱い</span>にしている。</div>

<!--
ここではCIをチェック、CDを閲覧用成果物の生成・同期という意味で使っています。
Webサービスのデプロイではありません。自分で読むためのEPUBをGoogle Driveに送ります。
LLM校閲も実装しましたが、書式チェックやビルドと同じ信頼性で成否を判定できるわけではありません。この話は後半にまとめます。
-->

---
layout: default
---

# 何を変更したかで、動く処理を分ける

<div class="mt-9 grid grid-cols-3 gap-5">
  <div class="rounded-2xl border border-emerald-500/35 bg-slate-900/70 p-5">
    <div class="text-emerald-300 text-lg font-bold">原稿を変更</div>
    <div class="mt-5 text-lg leading-8">書式を検査<br>対象原稿をEPUB化<br>PR用プレビューに同期</div>
    <div class="mt-5 text-sm text-slate-400">原稿差分を対象にする</div>
  </div>
  <div class="rounded-2xl border border-sky-500/35 bg-slate-900/70 p-5">
    <div class="text-sky-300 text-lg font-bold">ビルダーを変更</div>
    <div class="mt-5 text-lg leading-8">Kindle用テスト<br>全原稿を再ビルド<br>組版への影響を確認</div>
    <div class="mt-5 text-sm text-slate-400">CSSやテンプレートも入力</div>
  </div>
  <div class="rounded-2xl border border-violet-500/35 bg-slate-900/70 p-5">
    <div class="text-violet-300 text-lg font-bold">masterを更新</div>
    <div class="mt-5 text-lg leading-8">変更に応じてビルド<br>master用の保存先へ同期<br>PRプレビューと分離</div>
    <div class="mt-5 text-sm text-slate-400">配信先もブランチで分ける</div>
  </div>
</div>

<div class="mt-9 rounded-xl bg-slate-800/70 px-6 py-4 text-xl text-center">毎回すべてを実行せず、<span class="font-semibold text-white">変更の種類に応じた仕事だけ</span>を動かす。</div>

<!--
変更内容によって、必要な処理が違います。
原稿だけが変わったときは対象となる原稿の処理を行い、ビルダー側の実装や表示資産が変わったら全原稿の再検証が必要です。
PRのプレビューとmasterの成果物は、保存先を分けています。起動条件の具体的な実装はNovel CDのワークフローとbuild_inputs.pyにあります。
-->

---
layout: default
---

# Markdownの書式は、Pythonで確実に調べる

<div class="mt-10 grid grid-cols-2 gap-8">
  <div>
    <div class="text-lg font-semibold text-emerald-300 mb-4">原稿のルール</div>
    <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
      <pre class="!bg-transparent !m-0 text-lg leading-9"><code># 作品タイトル
## 章タイトル
### 節タイトル

本文……</code></pre>
    </div>
    <div class="mt-5 text-base text-slate-300 leading-8">見出しの順序・章番号・場面転換など、対応するMarkdownを限定する。</div>
  </div>
  <div>
    <div class="text-lg font-semibold text-sky-300 mb-4">実行するコマンド</div>
    <div class="rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-5 font-mono text-lg">python3 tools/kindle/lint.py --all</div>
    <div class="mt-6 text-lg leading-9 text-slate-300">形式上の規則は、同じ入力に同じ結果を返すプログラムへ。</div>
    <div class="mt-5 text-base text-slate-400">小説の内容に正解を求めるのとは、問題の性質が違う。</div>
  </div>
</div>

<!--
原稿は何でも書ける汎用Markdownではなく、ビルダーが対応したサブセットに限定しています。
章番号は原稿に手書きせず、生成時に付けます。場面転換には独立行の記号を使います。
こうしたルールは機械的にチェックできるので、LLMを使わない方が安定します。
-->

---
layout: default
---

# Markdownから、縦書きEPUBを生成する

<div class="mt-8 rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
  <div class="grid grid-cols-3 gap-4 items-center text-center">
    <div class="rounded-xl bg-slate-800 p-5">
      <div class="text-sky-300 text-xl font-bold mb-2">Markdown</div>
      <div class="text-base text-slate-300">作品タイトル・章・本文</div>
    </div>
    <div class="rounded-xl bg-slate-800 p-5">
      <div class="text-emerald-300 text-xl font-bold mb-2">Python＋組版処理</div>
      <div class="text-base text-slate-300">HTML / CSS / Vivliostyle</div>
    </div>
    <div class="rounded-xl border border-sky-500/45 bg-sky-950/30 p-5">
      <div class="text-sky-300 text-xl font-bold mb-2">EPUB</div>
      <div class="text-base text-slate-300">縦書き・右開き</div>
    </div>
  </div>
  <div class="mt-5 text-center text-slate-400 text-sm">原稿 → 構造化と組版 → 成果物の検証</div>
</div>

<div class="mt-7 grid grid-cols-2 gap-5">
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-4">
    <div class="font-mono text-lg">task kindle -- novel/proto2/proto2-ep01.md</div>
  </div>
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-4 text-base text-slate-300">
    目次とリンク先・章番号・縦書き設定などをビルド時に検証
  </div>
</div>

<div class="mt-6 text-sm text-slate-400">ソース：tools/kindle/README.md / docs/MANUSCRIPT_FORMAT.md</div>

<!--
EPUBの生成もPythonのツールで自動化しています。内部でVivliostyle CLIを利用する構成です。
縦書き・右開きにし、章や節の目次を作り、章番号を本文と目次で一致させています。
生成しただけで終わらず、パッケージの要素や目次のリンク先、縦書き指定も検証します。
-->

---
layout: default
---

# 「小説を読む」ための細かい組版もコードにする

<div class="mt-8 grid grid-cols-3 gap-5">
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
    <div class="text-lg font-bold text-sky-300">章番号・目次</div>
    <div class="mt-6 font-mono text-xl text-center">## 章タイトル</div>
    <div class="my-5 text-center text-slate-500 text-2xl">↓</div>
    <div class="text-lg text-center">第1章として表示<br>目次にも反映</div>
  </div>
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
    <div class="text-lg font-bold text-emerald-300">縦中横</div>
    <div class="mt-6 font-mono text-xl text-center">A3判 / 12人</div>
    <div class="my-5 text-center text-slate-500 text-2xl">↓</div>
    <div class="text-lg text-center">短い英数字だけ<br>縦書きで正立</div>
  </div>
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
    <div class="text-lg font-bold text-violet-300">場面転換</div>
    <div class="mt-6 font-mono text-xl text-center">---</div>
    <div class="my-5 text-center text-slate-500 text-2xl">↓</div>
    <div class="text-lg text-center">装飾と余白は<br>CSSに任せる</div>
  </div>
</div>

<div class="mt-9 rounded-xl bg-slate-800/70 px-6 py-4 text-lg text-center">原稿を<span class="font-semibold text-white">表示の都合で書き換えない</span>。組版はビルダーの責務にする。</div>

<!--
たとえば英数字を縦書きで自然に見せるためだけに、原稿中のAや3を全角に変えることはしません。
ビルダーが安全な短い組み合わせを縦中横として扱います。長い数字や略語は無理に一文字へ詰めません。
場面転換も原稿は意味を示すだけにして、実際の装飾はCSSへ任せます。本文と表示を分ける利点が出ている部分です。
-->

---
layout: default
---

# ビルドとDrive同期は、ジョブも権限も分ける

<div class="mt-8 rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
  <div class="grid grid-cols-5 gap-4 items-center">
    <div class="col-span-2 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-5">
      <div class="text-xl text-emerald-300 font-semibold">Build ジョブ</div>
      <div class="mt-4 text-lg leading-8">Lint / 必要なテスト<br>EPUBを生成・検証<br>Actions Artifactへ保存</div>
      <div class="mt-3 text-sm text-slate-400">Driveの認証情報を使わない</div>
    </div>
    <div class="col-span-1 text-center text-4xl text-slate-500">→</div>
    <div class="col-span-2 rounded-xl border border-sky-500/40 bg-sky-950/20 p-5">
      <div class="text-xl text-sky-300 font-semibold">Deploy ジョブ</div>
      <div class="mt-4 text-lg leading-8">Artifactを取得<br>保存先を判定<br>Google Driveへ同期</div>
      <div class="mt-3 text-sm text-slate-400">外部サービスへの操作を分離</div>
    </div>
  </div>
</div>

<div class="mt-8 grid grid-cols-2 gap-5">
  <div class="rounded-xl bg-slate-800/70 px-5 py-4">ビルド成功と同期成功を<span class="font-semibold text-white">別々に把握</span>できる</div>
  <div class="rounded-xl bg-slate-800/70 px-5 py-4">同期で失敗しても、検証済みEPUBの結果を<span class="font-semibold text-white">残せる</span></div>
</div>

<!--
GitHub ActionsのBuild & Syncは、ビルドとデプロイを独立したジョブにしています。
最初のジョブにはGoogle Driveの認証情報が不要です。検証したEPUBを短命なActions Artifactとして渡し、次のジョブで同期します。
この分離はセキュリティ面だけでなく、何が失敗したかを区別できる点でも役立ちます。
-->

---
layout: default
---

# PRではプレビュー、masterでは自分用の最新版

<div class="mt-10 grid grid-cols-2 gap-7">
  <div class="rounded-2xl border border-sky-500/40 bg-slate-900/70 p-6">
    <div class="text-sky-300 text-xl font-bold">Pull Request</div>
    <div class="mt-6 rounded-lg bg-slate-800 px-5 py-4 text-center text-lg">ブランチごとのプレビュー</div>
    <div class="mt-5 text-lg leading-8 text-slate-300">別案を試しても、masterの成果物に上書きしない。</div>
    <div class="mt-4 text-sm text-slate-400">PR終了などに応じて片付ける</div>
  </div>
  <div class="rounded-2xl border border-emerald-500/40 bg-slate-900/70 p-6">
    <div class="text-emerald-300 text-xl font-bold">master</div>
    <div class="mt-6 rounded-lg bg-slate-800 px-5 py-4 text-center text-lg">master用のEPUB</div>
    <div class="mt-5 text-lg leading-8 text-slate-300">採用した原稿を、普段読む保存先に同期する。</div>
    <div class="mt-4 text-sm text-slate-400">未変更ファイルは再同期を避ける</div>
  </div>
</div>

<div class="mt-9 rounded-xl border border-slate-700 bg-slate-900/60 p-5 text-lg">
  <span class="font-semibold text-white">CD = 公開</span> とは限らない。ここでは「自分が読むために、最新版を届ける」こと。
</div>

<!--
私がここで配信と呼んでいるのは、出版サイトへの一般公開ではありません。
PRの別案はプレビューとして保存し、masterの採用版とは混ぜません。
変更のないEPUBを毎回アップロードしないように、同期の最適化や不要なプレビューの片付けも実装しています。
-->

---
layout: default
---

# ちなみに、AIによる内容校閲もCIに入れてみた

<div class="mt-8 grid grid-cols-3 gap-5 items-stretch">
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
    <div class="text-lg font-semibold text-emerald-300">① 原稿を分割</div>
    <div class="mt-5 text-lg leading-8">章・場面単位で<br>局所的な問題を探す<br>事実を抽出する</div>
  </div>
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
    <div class="text-lg font-semibold text-sky-300">② 全体を照合</div>
    <div class="mt-5 text-lg leading-8">時間・人数・人物<br>条件や状態の推移を<br>章をまたいで確認</div>
  </div>
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
    <div class="text-lg font-semibold text-violet-300">③ 原文で再検証</div>
    <div class="mt-5 text-lg leading-8">別解釈を検討し<br>疑義と引用を<br>PRコメントへ</div>
  </div>
</div>

<div class="mt-9 rounded-xl border border-sky-500/30 bg-sky-950/25 px-6 py-5 text-xl text-center">
  仮説：<span class="font-bold text-white">格安LLMでも、工夫すれば自動でかなり校閲できるのでは？</span>
</div>

<div class="mt-5 text-sm text-slate-400">実際にGPT-6 Lunaを用いる校閲ワークフローを実装・運用した。</div>

<!--
内容の整合性も自動化してみたくなり、安価なLLMを組み込みました。
まずチャンクごとに文章を調べて事実を抽出し、その索引を使って全体を照合し、疑義は原文で確認するという構成です。
小さな加工テストでは期待どおりに動くこともありました。ただ、そこから実原稿の品質保証を言えるかどうかは別問題でした。
-->

---
layout: default
---

# 約1セントのAI校閲。でも、見逃しは残った

<div class="mt-5 text-base text-slate-300">既存改善方式A：平均推計 <span class="font-semibold text-white">約 $0.0108 / 回</span>。実原稿3本を各3回検査。</div>

<div class="mt-6 grid grid-cols-2 gap-5">
  <div class="rounded-2xl border border-emerald-500/45 bg-emerald-950/20 p-5">
    <div class="text-lg font-semibold text-emerald-300">検出できた疑義</div>
    <div class="mt-3 text-5xl font-bold text-white">各 3/3</div>
    <div class="mt-4 text-lg leading-8 text-slate-200">無線機の貸出条件<br>参加者名簿から消えた人物</div>
    <div class="mt-2 text-sm text-slate-400">それぞれ3回とも最終報告に残った</div>
  </div>
  <div class="rounded-2xl border border-amber-500/45 bg-amber-950/15 p-5">
    <div class="text-lg font-semibold text-amber-300">見逃した問題候補</div>
    <div class="mt-3 text-5xl font-bold text-white">0/3</div>
    <div class="mt-4 text-lg leading-8 text-slate-200">「6人中4位」と<br>「二人差」という順位表現</div>
    <div class="mt-2 text-sm text-slate-400">独立レビューでは疑義、Aは未指摘</div>
  </div>
</div>

<div class="mt-5 rounded-xl bg-slate-800/70 px-5 py-4 text-base text-slate-300 leading-7">
  改良案も万能ではない。<span class="font-semibold text-white">意味正規化Bでは話者を誤認</span>し、<span class="font-semibold text-white">原文併用Cでは長文で不完全応答</span>が発生。
</div>

<div class="mt-5 text-center text-xl font-semibold text-white">安く問題を「発見」できても、<span class="text-amber-300">追加の校閲を省けるほどの保証にはならなかった。</span></div>
<div class="mt-3 text-xs text-slate-400">3原稿×3方式×3反復＝27セル。独立レビューの問題候補には未裁定のものも含む。費用は実請求額ではなく推計。</div>
<div class="mt-1 text-xs text-slate-400">出典：<a href="https://github.com/kamahir0/ai-novel-alpha/pull/123">実験 PR #123</a> ／ <a href="https://github.com/kamahir0/ai-novel-alpha/pull/124">評価記録 PR #124</a></div>

<!--
このスライドでは「正常完走した回数」より、そもそもの目的である検出の有用性を中心に紹介します。
既存改善方式Aは、PR #116の無線機貸出条件とPR #118の参加者消失を、それぞれ3回中3回、最終報告に残しました。約1セントで問題を見つけられるのは良い点です。
一方、PR #117の「6人中4位」に対する「二人差」という表現は、独立レビューで問題候補として挙がったものの、Aでは3回とも最終指摘になりませんでした。ただし独立レビューは確定正解ではなく、会話の文脈には別解釈の余地があります。ほかにも未指摘の候補があります。
索引の欠落を補おうとした意味正規化方式Bでは、原文の話者を誤帰属させ、それが偽陽性につながりました。Bの正規化文と原文を併用するCでは、PR #118の2回で出力上限による不完全応答が発生しました。
全条件では3原稿×3方式×3反復＝27セルを実行し、25セルが正常完走しています。ただし完走率は検出精度ではないため、スライド上では主役にしていません。Aの平均推計校閲費用は保存された9セル合計から算出した約$0.0108/回で、全ジョブの実請求額ではありません。
私の運用では結局、高性能AIでの再確認と人による判断を省けません。よって「格安LLMを自動実行すれば品質保証を代替できる」という当初の期待には届かなかったと考えています。
-->

---
layout: center
class: text-center
title: まとめ
---

<div class="max-w-5xl mx-auto">
  <div class="text-sky-300 tracking-widest text-lg mb-8">まとめ</div>
  <h1 class="text-4xl leading-tight font-bold">小説を読むために作ったCI/CD。<br>残す価値は、処理ごとに違った。</h1>
  <div class="mt-11 grid grid-cols-2 gap-5 text-left">
    <div class="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6">
      <div class="text-xl font-bold text-emerald-300">続ける</div>
      <div class="mt-4 text-lg leading-8">Markdown Lint<br>EPUBの生成・検証<br>Driveへの同期</div>
    </div>
    <div class="rounded-2xl border border-amber-500/40 bg-amber-950/15 p-6">
      <div class="text-xl font-bold text-amber-300">運用を見直す</div>
      <div class="mt-4 text-lg leading-8">安価なLLMによる自動校閲<br>指摘ゼロを品質保証とみなさない<br>必要なら強いAIと人間で確認</div>
    </div>
  </div>
  <div class="mt-10 text-xl font-semibold text-white">「自動化できる」と「自動化する価値がある」は、同じではなかった。</div>
  <div class="mt-7 text-sm text-slate-400">※ AI校閲の停止は方針検討段階。発表資料作成時点では、本番ワークフローに実装が残っている。</div>
  <div class="mt-7 text-base text-slate-500">ありがとうございました</div>
</div>

<!--
小説の制作フローに開発用の道具を持ち込むと、書式チェックやEPUBの生成・同期は繰り返しの作業を減らせました。
一方、AI校閲は安価に回せても、問題なしを信頼して追加の確認を省くところまでは到達していません。
今回の発表で言いたかったのはAIがすごい・だめという話ではなく、どの処理を機械に任せると自分の作業が本当に楽になるか、という判断です。
発表時点のリポジトリ状態が変わっていれば、AI校閲についての注記は事実に合わせて更新してください。
-->
