---
theme: default
colorSchema: dark
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
---

<div class="mx-auto max-w-5xl">
  <div class="mb-8 text-lg tracking-widest text-sky-300">個人制作の、なんちゃってCI/CD</div>
  <h1 class="text-5xl leading-tight font-bold">小説を読んでいたら<br>CI/CDを構築していた</h1>
  <div class="mt-10 text-2xl text-slate-300">Kindleで読みたい → EPUB → GitHub Actions → Google Drive</div>
  <div class="mt-14 text-base text-slate-400">GitHub Actions / Python / EPUB / Google Drive API / AI</div>
</div>

<!--
AIで作った小説をKindleで読んでみたい、というところから始まった個人制作の話です。
原稿を電子書籍に変換して、更新した版を自分で読める場所まで届ける。その周辺作業をGitHub Actionsに載せた結果、CI/CDに似た仕組みになりました。
申請時の説明は「GitHub Actions、GCP Google Drive API、AIなどを活用したなんちゃってCI/CD」です。
実装コードにもAI生成のものを多く使っています。手書きで作り上げた苦労話ではなく、実際の構成と運用の紹介です。
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
最初の目的は、AIを使って制作した小説をKindle端末で読んでみることでした。
そのために、原稿のMarkdownを電子書籍の形式に変換するところから仕組みが増えていきました。
今の取り込み操作はスマホのGoogle DriveアプリとKindleアプリで行っています。Kindle端末を使いたいという出発点と、現在の取り込み経路は区別して説明します。
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
原稿はMarkdownのサブセットとして管理しています。Pythonのビルダーが構造を解釈し、HTML/CSSやVivliostyle CLIを使って縦書き・右開きのEPUBを生成します。
章番号を原稿へ直接書き込むのではなく、目次も含めて生成側で付けます。
EPUBを出力するだけでなく、必要なファイル、目次リンク、縦書きの設定なども検証しています。
ここまでは、読むためのファイルを作る処理です。
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
EPUBを作ったあと、最初はKindleのライブラリまで自動で届けることも検討しました。
調べたところ、ライブラリへの投入は一方向に自動化できます。しかし、自分が調べた連携方法では、不要になった版を同じように自動削除できませんでした。
この話はKindle一般のあらゆる機能が不可能だという主張ではなく、今回の用途で利用できる自動化経路についての判断です。
原稿の別案やPRごとのプレビューを扱うので、自動で配信する場所では後片付けまで管理できることを重視しました。
-->

---
layout: default
---

# Google Driveまでを自動化する

<div class="mt-8 grid grid-cols-5 gap-4 items-stretch text-center">
  <div class="col-span-2 rounded-2xl border border-sky-500/40 bg-sky-950/20 p-7">
    <div class="text-sky-300 text-lg font-bold">ここまで自動</div>
    <div class="mt-6 text-xl leading-10">原稿の変更<br>↓<br>GitHub Actions<br>↓<br>EPUB生成・検証<br>↓<br>Google Drive</div>
  </div>
  <div class="col-span-1 flex flex-col justify-center items-center">
    <div class="text-4xl text-slate-500">→</div>
    <div class="mt-4 text-base text-amber-300 font-semibold">ここで区切る</div>
  </div>
  <div class="col-span-2 rounded-2xl border border-slate-700 bg-slate-900/70 p-7">
    <div class="text-slate-300 text-lg font-bold">ここから手動</div>
    <div class="mt-6 text-xl leading-10">スマホのDriveアプリ<br>↓<br>EPUBをKindleアプリで開く<br>↓<br>ライブラリへインポート<br>↓<br>読む</div>
  </div>
</div>

<div class="mt-8 text-center text-lg text-slate-300">Google Driveは<span class="font-semibold text-white">閲覧用EPUBを置く場所</span>であり、Kindleへの自動配信ではない。</div>

<!--
そこで、自動配信の終点はGoogle Driveにしました。
GitHub ActionsでEPUBを作り、Google Drive APIを通じて同期します。DriveならPRプレビューの置き分けや、不要な版の整理も実装できます。
読むときはスマホのGoogle DriveアプリでEPUBを選び、Kindleアプリで開いてライブラリにインポートしています。この最後の操作は手動です。
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
原稿だけでなく、登場人物の設定、書式規約、EPUB生成コード、Drive同期コード、GitHub Actionsの定義も同じリポジトリにあります。
本文やコードの生成にAIを使う場合も、Gitの差分で変更を確認できます。
第2話などの別案を別PRで作ることもあります。どれを採用するかはCIが決めるのではなく、人間が決めます。
-->

---
layout: default
---

# これが「なんちゃってCI/CD」の全体像

<div class="mt-7 rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
  <div class="rounded-xl bg-slate-800 px-6 py-4 text-center text-xl font-semibold">Markdownを変更 → PR / master</div>
  <div class="my-3 text-center text-3xl text-slate-500">↓</div>
  <div class="grid grid-cols-2 gap-6">
    <div class="rounded-xl border border-emerald-500/40 bg-emerald-950/15 p-6">
      <div class="text-emerald-300 text-2xl font-bold">CI｜確認する</div>
      <div class="mt-5 text-lg leading-10">Markdown Lint<br>必要なテスト<br>EPUB生成・検証</div>
    </div>
    <div class="rounded-xl border border-sky-500/40 bg-sky-950/15 p-6">
      <div class="text-sky-300 text-2xl font-bold">CD｜届ける</div>
      <div class="mt-5 text-lg leading-10">EPUBをArtifactとして受け渡し<br>Google Drive APIで同期<br>PR / masterで保存先を分離</div>
    </div>
  </div>
</div>

<div class="mt-7 text-center text-lg text-slate-300">一般公開する仕組みではなく、<span class="font-semibold text-white">自分が読むためのビルド＆配信</span>。</div>

<!--
開発用語で言えば、PRに対して検査・ビルドし、結果を配信する構成です。
ただしWebサービスの本番デプロイではありません。自分で読むためのEPUBをGoogle Driveへ同期するだけなので、「なんちゃってCI/CD」と呼んでいます。
Lintやビルドのように失敗を判定できる処理と、後で紹介する内容校閲のような曖昧な処理は区別しています。
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
Markdownは自由な書式ではなく、このEPUBビルダーが対応する範囲に制限しています。
見出しの階層や場面転換の記法などはPythonのLintで確認します。
そのほか、必要なテストとEPUBのビルド・構成検証を行います。これは文芸的な評価ではなく、入力や成果物の技術的な検査です。
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
例えば章番号を原稿に直接書かず、EPUBの生成時に採番します。
短い英数字は縦中横として処理し、場面転換の区切りはCSSで見た目を付けます。
原稿を電子書籍の表示都合に合わせて何度も書き換えなくてよいように、本文と組版を分離しています。
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
変更されたファイルによって再ビルドの範囲を変えています。
原稿だけの変更なら対象ファイルを中心に、ビルダーの処理や表示に関わる資産が変わった場合は全原稿を再検証します。
この判定はワークフローとbuild_inputs.pyなどのコードで処理しています。
-->

---
layout: default
---

# CD：PRは試し読み、masterは普段用

<div class="mt-7 grid grid-cols-2 gap-6">
  <div class="rounded-2xl border border-sky-500/40 bg-slate-900/70 p-7">
    <div class="text-sky-300 text-xl font-bold">Pull Request</div>
    <div class="mt-5 rounded-lg bg-slate-800 p-4 text-center text-xl">別案ごとのプレビュー</div>
    <div class="mt-5 text-lg leading-9 text-slate-300">masterと混ぜずに同期。<br>PR終了時などに不要な置き場を片付ける。</div>
  </div>
  <div class="rounded-2xl border border-emerald-500/40 bg-slate-900/70 p-7">
    <div class="text-emerald-300 text-xl font-bold">master</div>
    <div class="mt-5 rounded-lg bg-slate-800 p-4 text-center text-xl">採用版の保存先</div>
    <div class="mt-5 text-lg leading-9 text-slate-300">確定した原稿を同期。<br>未変更EPUBの再アップロードは避ける。</div>
  </div>
</div>

<div class="mt-7 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
  <div class="grid grid-cols-5 gap-4 items-center text-center">
    <div class="col-span-2"><span class="text-lg font-semibold text-emerald-300">Buildジョブ</span><div class="mt-2 text-base text-slate-300">EPUB生成・検証<br>Actions Artifactに保存</div></div>
    <div class="col-span-1 text-3xl text-slate-500">→</div>
    <div class="col-span-2"><span class="text-lg font-semibold text-sky-300">Deployジョブ</span><div class="mt-2 text-base text-slate-300">Artifactを取得<br>Drive APIで同期</div></div>
  </div>
</div>
<div class="mt-4 text-sm text-slate-400">Drive認証情報はBuildジョブでは使わない。Buildと同期の成功・失敗も分けて把握する。</div>

<!--
PRごとに別案を試せるよう、プレビューの保存先とmasterの保存先を分けています。
PRを閉じたときなどに不要なプレビューを削除し、master側では未変更の成果物を再同期しないようにしています。ここでKindleライブラリではなくDriveを選んだ理由が効いてきます。
BuildジョブにはDriveの認証情報を渡さず、検証済みのEPUBをActions Artifactに保存してからDeployジョブへ渡します。
ただし、このジョブ分離だけでセキュリティが全面的に保証されるわけではありません。ここでは担当と認証情報を分けている、という実装上の事実を紹介します。
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
AIは小説の制作やCI/CDのコード生成にも使っています。ここで紹介するのは、それとは別に試した「AIによる内容校閲」です。
安価なLLMを使い、原稿を分割して局所解析と全体照合を行い、矛盾の疑義をPRに出す仕組みを実装しました。
実原稿3本を用いたA/B/Cの比較では合計27回のうち25回が正常完走しましたが、完走は検出性能の証明ではありません。指摘漏れがあり、意味正規化方式では話者の誤帰属、原文併用方式では出力上限による失敗も確認しました。
評価に用いた独立レビューもAIによるもので、問題候補がすべて確定した誤りというわけではありません。
意味正規化の新方式は採用を見送りました。さらに自動校閲CI全体も廃止する方向ですが、この資料の時点では本番ワークフローに実装が残っています。
この発表の中心はAI校閲ではなく、読むためのCI/CDです。
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
出発点は、AIで作った小説をKindleで読んでみたい、ということでした。
MarkdownからEPUBを作り、GitHub Actionsで検査し、Google Driveへ届けるところまで自動化しています。Kindleアプリのライブラリへの取り込みは、今もスマホから手動で行っています。
今回はKindle側の削除まで自動管理できなかったため、Driveを配信の終点にしました。
小説制作にGitとCI/CDを持ち込んだ個人用の仕組みとして、現在はこんな形で動かしています。
-->
