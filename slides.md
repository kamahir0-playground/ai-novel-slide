---
theme: default
colorSchema: dark
title: 小説の原稿をCIで確かめ、EPUBで読むまで
info: |
  小説制作にGitHub Actionsを使った個人開発の事例。
  Markdown Lint、LLMによる校閲支援、EPUB生成、Google Drive同期について、実装と検証の範囲を分けて紹介する。
class: text-center
layout: cover
transition: slide-left
mdc: true
drawings:
  persist: false
---

<div class="mx-auto max-w-4xl">
  <div class="mb-8 text-slate-400 text-lg tracking-wide">個人制作のワークフローを紹介する技術LT</div>
  <h1 class="text-5xl leading-tight font-bold">小説の原稿をCIで確かめ、<br>EPUBで読むまで</h1>
  <div class="mt-9 text-2xl text-slate-300">Markdown / Pull Request / LLM / GitHub Actions</div>
  <div class="mt-14 text-base text-slate-400">作業の自動化と、AI校閲で分かった限界</div>
</div>

<!--
趣味でAIエージェントと小説を書いています。
今日は文章生成のプロンプトより、書いた原稿をどう確認し、読むための形式にするか、という周辺の仕組みを紹介します。
CI/CDという言葉を使っていますが、読者向けの自動公開ではありません。制作中の原稿を扱う個人用のワークフローです。
-->

---
layout: default
---

# 原稿をGitで管理している

<div class="grid grid-cols-5 gap-7 mt-9 items-start">
  <div class="col-span-2 rounded-xl bg-slate-900/70 border border-slate-700 p-5 font-mono text-base leading-9">
    <div class="text-sky-300">repo/</div>
    <div>├─ novel/</div>
    <div class="pl-5 text-slate-300">└─ proto2/</div>
    <div>├─ CHARACTERS.md</div>
    <div>├─ docs/</div>
    <div>├─ AGENTS.md</div>
    <div>└─ .github/workflows/</div>
  </div>
  <div class="col-span-3 space-y-5">
    <div class="rounded-xl bg-slate-900/70 border border-slate-700 p-5">
      <div class="text-xl font-semibold mb-2">制作の流れ</div>
      <div class="text-lg text-slate-300 leading-8">人間が方向性を決める → AIが草稿を作る → PRで差分を確認 → 採用するものをマージ</div>
    </div>
    <div class="rounded-xl bg-slate-900/70 border border-slate-700 p-5">
      <div class="text-xl font-semibold mb-2">確認したいこと</div>
      <div class="text-lg text-slate-300 leading-8">書式は揃っているか。離れた章で事実が食い違わないか。スマホで通して読むとどう感じるか。</div>
    </div>
  </div>
</div>

<div class="mt-7 text-sm text-slate-400">小説の良し悪しをCIで判定することは目的にしていません。</div>

<!--
本文や設定資料をMarkdownで管理しています。AIとの共同執筆でも、差分が読めることと、前の版に戻れることが便利でした。
困っていたのは、執筆以外に繰り返し発生する確認作業です。
書式・整合性・閲覧用の変換は性質が違うので、それぞれ別の方法で扱うことにしました。
-->

---
layout: default
---

# CIとCDを別の仕事として分ける

<div class="mt-6 rounded-xl border border-slate-700 bg-slate-900/50 p-5">
  <div class="rounded-lg bg-slate-800 py-3 text-center text-xl font-semibold">原稿の変更 → Pull Request</div>
  <div class="text-center my-3 text-2xl text-slate-500">↓</div>
  <div class="grid grid-cols-2 gap-5">
    <div class="rounded-xl border border-emerald-500/40 p-5">
      <div class="text-emerald-300 text-xl font-semibold mb-4">CI｜原稿を確認する</div>
      <div class="rounded-lg bg-slate-800 px-4 py-3">Pythonで書式をLint</div>
      <div class="text-center text-slate-500 text-lg my-2">＋</div>
      <div class="rounded-lg bg-slate-800 px-4 py-3">LLMで整合性の候補を探す</div>
      <div class="mt-4 text-sm text-slate-400">結果はPRコメントで確認。AIの指摘は参考情報。</div>
    </div>
    <div class="rounded-xl border border-sky-500/40 p-5">
      <div class="text-sky-300 text-xl font-semibold mb-4">CD｜読める形に届ける</div>
      <div class="rounded-lg bg-slate-800 px-4 py-3">Markdown → 縦書きEPUB</div>
      <div class="text-center text-slate-500 text-lg my-2">↓</div>
      <div class="rounded-lg bg-slate-800 px-4 py-3">Google Driveへ同期</div>
      <div class="mt-4 text-sm text-slate-400">PRとmasterで保存先を分ける。</div>
    </div>
  </div>
</div>

<div class="mt-5 text-sm text-slate-400">すべてが毎回動くわけではなく、変更ファイルとPRの状態で起動条件を分けています。</div>

<!--
CIは原稿の確認、CDは閲覧用ファイルの作成と同期、と役割を分けています。
AI校閲は、修正を強制する品質ゲートではなく、PRに追加の観点を渡す仕組みです。
Driveは公開サイトではなく、自分が原稿を読むための同期先です。以降、それぞれの処理を具体的に見ます。
-->

---
layout: default
---

# 形式のチェックはPythonで行う

<div class="grid grid-cols-2 gap-8 mt-10">
  <div>
    <div class="text-lg font-semibold text-emerald-300 mb-4">原稿側の約束</div>
    <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
      <div class="font-mono text-lg leading-9 text-slate-200">
        <div># 作品タイトル</div>
        <div>## 章タイトル</div>
        <div>### 節タイトル</div>
        <div class="h-4"></div>
        <div class="text-slate-400">本文……</div>
      </div>
    </div>
    <div class="mt-5 text-base text-slate-300 leading-8">見出し階層、章番号の扱い、場面転換の記法などを検査する。</div>
  </div>
  <div>
    <div class="text-lg font-semibold text-sky-300 mb-4">CIで実行する処理</div>
    <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-5 font-mono text-base">python tools/kindle/lint.py --all</div>
    <div class="mt-6 text-lg leading-9 text-slate-300">形式上の規則は、同じ入力に同じ結果を返すスクリプトに任せる。</div>
    <div class="mt-5 text-sm text-slate-400">LLMには、文脈を読まないと判断しにくい問題を担当させる。</div>
  </div>
</div>

<!--
EPUBへの変換を安定させるため、原稿側のMarkdownにルールを設けています。
これは普通のLintとしてPythonで検査します。言語モデルを呼ぶ理由がない部分です。
CI用のワークフローとは別に、EPUBビルドでもLintを実行しています。
-->

---
layout: default
---

# LLM校閲は「部分を見る → 全体を照合する」

<div class="space-y-3 mt-8">
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-center">
    <div class="font-semibold text-lg">1. 原稿を章・場面などの単位に分割</div>
  </div>
  <div class="text-center text-slate-500">↓</div>
  <div class="grid grid-cols-3 gap-4">
    <div class="rounded-xl border border-emerald-500/35 bg-emerald-950/25 p-4 text-center">チャンク A<br><span class="text-sm text-slate-300">文章の指摘＋事実抽出</span></div>
    <div class="rounded-xl border border-emerald-500/35 bg-emerald-950/25 p-4 text-center">チャンク B<br><span class="text-sm text-slate-300">文章の指摘＋事実抽出</span></div>
    <div class="rounded-xl border border-emerald-500/35 bg-emerald-950/25 p-4 text-center">チャンク C…<br><span class="text-sm text-slate-300">最大4並列で解析</span></div>
  </div>
  <div class="text-center text-slate-500">↓</div>
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-center">
    <div class="font-semibold text-lg">2. 抽出した事実をまとめ、章をまたぐ矛盾候補を探す</div>
    <div class="text-sm text-slate-400 mt-1">数量・時点・資料の版・人物の認識などを区別する</div>
  </div>
  <div class="text-center text-slate-500">↓</div>
  <div class="rounded-xl border border-sky-500/35 bg-sky-950/25 p-4 text-center">
    <div class="font-semibold text-lg">3. 候補があれば原文に戻って再検証し、PRに報告</div>
  </div>
</div>

<div class="mt-5 text-sm text-slate-400">抽出した事実にも誤りがあり得るため、原文の引用を照合する処理を入れています。</div>

<!--
全文を一度に評価する代わりに、まず局所的な文章の問題と事実の索引をチャンクごとに得ます。
次に索引を集約し、離れた章の間の矛盾候補を探します。候補が見つかった場合は原文に戻って再検証します。
ここでいう「確定」はパイプライン内の判定であり、人間による確認を不要にする意味ではありません。
-->

---
layout: default
---

# 数字が違うだけでは、矛盾とは言えない

<div class="grid grid-cols-2 gap-6 mt-10">
  <div class="rounded-xl border border-amber-500/35 bg-slate-900/70 p-6">
    <div class="text-amber-300 font-semibold mb-4 text-lg">見かけ上は食い違う</div>
    <div class="text-3xl text-center font-bold my-6">17件 → 13件 → 0件</div>
    <div class="text-slate-300 leading-8">章ごとに未処理の件数が変わっている。</div>
  </div>
  <div class="rounded-xl border border-emerald-500/35 bg-slate-900/70 p-6">
    <div class="text-emerald-300 font-semibold mb-4 text-lg">文脈を加えると両立する</div>
    <div class="text-xl text-center font-semibold my-6">調査が進んで、<br>残件数が減った</div>
    <div class="text-slate-300 leading-8">同一時点の同一数量を述べているとは限らない。</div>
  </div>
</div>

<div class="mt-9 rounded-xl bg-slate-900/60 border border-slate-700 px-6 py-4">
  <div class="text-lg">LLMには、指摘する前に <span class="text-emerald-300 font-semibold">「矛盾ではない自然な読み方」</span> を探させる。</div>
  <div class="mt-2 text-base text-slate-400">時間経過／全体と抜粋／提案と確定／人物ごとの認識差</div>
</div>

<!--
校閲CIを作るうえで難しかったのは、誤検出の扱いでした。
件数が減っていても、時間が経過して処理が進んだだけかもしれません。人物の発言が違っていても、意図された認識差かもしれません。
そのため、違和感を列挙する前に、正常な解釈がないか検討するようにしています。ただし、この方法だけで誤検出がなくなるわけではありません。
-->

---
layout: default
---

# 評価では、テストケースの作り方にも悩んだ

<div class="grid grid-cols-2 gap-6 mt-8">
  <div class="rounded-xl border border-slate-700 bg-slate-900/65 p-5">
    <div class="text-lg font-semibold text-amber-300 mb-3">最初のケース（Run 3）</div>
    <div class="text-lg leading-8">「冒頭から3ページ」<br>「作品は8ページ」</div>
    <div class="mt-4 text-base text-slate-300">抜粋3ページと全体8ページなら矛盾しない。正解条件が曖昧だった。</div>
  </div>
  <div class="rounded-xl border border-slate-700 bg-slate-900/65 p-5">
    <div class="text-lg font-semibold text-emerald-300 mb-3">修正したケース（Run 4）</div>
    <div class="text-lg leading-8">「月曜時点の同じ最終稿は全編3ページ」<br>「同じ最終稿は全編8ページ」</div>
    <div class="mt-4 text-base text-slate-300">対象・時点・版を固定し、両立しない条件を明示した。</div>
  </div>
</div>

<div class="mt-8 text-lg text-slate-300">校閲器だけでなく、<span class="font-semibold text-white">「何を誤りとみなすか」</span> の定義も検証対象だった。</div>

<div class="mt-5 text-xs text-slate-400">出典：tools/novel_ci/eval_results/pr97_run3_summary.json、pr97_run4_ground_truth.json</div>

<!--
自作したテストで、当初は章間のページ数の食い違いを検出できませんでした。
ただし元のケースには「全体8ページのうち冒頭3ページ」という自然な読み方があり、単純に検出漏れとも断定できませんでした。
そこで、同じ最終稿の全体ページ数が食い違うという、曖昧さのないケースに直しています。これはアルゴリズムの改善結果というより、評価設計から得た教訓です。
-->

---
layout: default
---

# 小規模な検証では、期待どおりに動いた

<div class="grid grid-cols-2 gap-6 mt-9">
  <div class="rounded-xl border border-emerald-500/35 bg-slate-900/70 p-6 text-center">
    <div class="text-emerald-300 text-lg font-semibold">意図的に仕込んだ誤り</div>
    <div class="text-5xl font-bold my-5">3 / 3</div>
    <div class="text-slate-300 text-base leading-8">文章破綻、同じ場面の矛盾、章をまたぐページ数の矛盾を検出</div>
  </div>
  <div class="rounded-xl border border-sky-500/35 bg-slate-900/70 p-6 text-center">
    <div class="text-sky-300 text-lg font-semibold">矛盾ではない紛らわしい例</div>
    <div class="text-5xl font-bold my-5">4 / 4</div>
    <div class="text-slate-300 text-base leading-8">部分と全体、状態変化、認識差、知識の獲得順序を誤検出せず</div>
  </div>
</div>

<div class="mt-7 rounded-xl border border-amber-500/25 bg-slate-900/60 px-5 py-4 text-base text-slate-300 leading-7">
  <span class="text-amber-300 font-semibold">結果の範囲：</span> 同じ作品を加工した7ケース、各1回の実行。未知の作品に対する検出率や再実行時の安定性は、この数字では分からない。
</div>

<div class="mt-4 text-xs text-slate-400">出典：PR #97由来のRun 4 / Run 5評価ログ（tools/novel_ci/eval_results/）</div>

<!--
実モデルを呼ぶ小さな評価を作りました。誤りを仕込んだ3例と、誤りに見える正常な4例で、期待した結果が得られています。
ただし、これは同じ原稿に手を加えた7ケースをそれぞれ1回動かした結果です。実世界の精度が100%という意味ではありません。
ケースを増やすことや複数回試すことは、今後の課題です。
-->

---
layout: default
---

# 実際のPRでは、こういう報告になる

<div class="mt-9 grid grid-cols-5 gap-6 items-start">
  <div class="col-span-3 rounded-xl border border-slate-700 bg-slate-900/70 p-6">
    <div class="text-base text-slate-400 mb-2">PR #97｜AI校閲コメントの一例</div>
    <div class="text-xl font-semibold mb-4">発話者を特定しにくい箇所を指摘</div>
    <div class="rounded-lg bg-slate-800/90 px-5 py-4 text-lg leading-8">「ひより、ここでいい？」</div>
    <div class="mt-4 text-base text-slate-300 leading-7">前後の発話の話者が読み取りにくいとして、原稿中の行番号付きで報告。</div>
  </div>
  <div class="col-span-2 space-y-4">
    <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
      <div class="text-sm text-slate-400">2026-10-15の実行</div>
      <div class="text-xl font-semibold mt-1">指摘 1 件</div>
      <div class="text-sm text-slate-300 mt-2">9 API calls / 約 $0.0109</div>
    </div>
    <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
      <div class="text-sm text-slate-400">2026-10-16の別コミットでの実行</div>
      <div class="text-xl font-semibold mt-1">指摘 0 件</div>
      <div class="text-sm text-slate-300 mt-2">10 API calls / 約 $0.0124</div>
    </div>
  </div>
</div>

<div class="mt-7 text-base text-slate-300">レビューは <span class="font-semibold text-white">人間に確認を促すコメント</span>。指摘があっても、それだけでマージを止めるものではない。</div>
<div class="mt-4 text-xs text-slate-400">出典：PR #97 の校閲コメント。金額はトークン数からの概算。</div>

<!--
評価用のケースだけでなく、通常のPRでもLLMレビューが動いています。
これはPR #97で話者を特定しづらい箇所を指摘した例です。翌日の別コミットでは指摘ゼロのレポートが残っています。
ここでは、どの修正が指摘の消失につながったかまでは断定しません。こうしたコメントを参考に、最終的には人間が原稿を読んで判断します。
-->

---
layout: default
---

# LLMを呼ぶ回数は、意図的に絞る

<div class="grid grid-cols-2 gap-6 mt-8">
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
    <div class="text-lg text-emerald-300 font-semibold mb-4">いつ動かすか</div>
    <div class="space-y-3 text-base leading-7">
      <div><span class="font-semibold">Draft PR</span>：有料校閲は実行しない</div>
      <div><span class="font-semibold">Ready PRの作成</span>：原稿変更があれば実行</div>
      <div><span class="font-semibold">Ready PRへの追加push</span>：自動再校閲しない</div>
      <div><span class="font-semibold">Draft → Ready</span>：明示的な再校閲として実行</div>
    </div>
  </div>
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
    <div class="text-lg text-sky-300 font-semibold mb-4">どこで止めるか</div>
    <div class="space-y-3 text-base leading-7">
      <div><span class="font-semibold">1実行・PR全体：</span>35 calls、推定 $0.10まで</div>
      <div><span class="font-semibold">キャッシュ：</span>原稿と校閲設定の指紋を比較</div>
      <div><span class="font-semibold">権限：</span>AI解析ジョブとPRコメント投稿を分離</div>
    </div>
  </div>
</div>

<div class="mt-7 rounded-xl border border-amber-500/25 bg-slate-900/60 px-5 py-4 text-base text-slate-300 leading-7">
  $0.10はクライアント側の<strong>推定費用</strong>の制御で、実際の請求額の保証ではない。また、Draft → Readyでの明示的な再実行はキャッシュを迂回する。
</div>

<!--
有料のLLMをCIで使う場合、普通のLintのようにpushのたびに実行すると費用が増えます。
そのためReadyへの遷移を明示的な合図として扱い、通常の追加pushではAI校閲を回しません。原稿とエンジンの設定が同じなら、通常の対象イベントでは過去の成功結果を参照してスキップできます。
費用上限は推定値ベースで、請求額の絶対的な上限ではありません。APIキーを持つ解析ジョブにはPRへの書き込み権限を渡していません。
-->

---
layout: default
---

# 原稿をEPUBにし、Driveで読み直す

<div class="mt-9 grid grid-cols-2 gap-7">
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
    <div class="text-xl text-sky-300 font-semibold mb-5">① Markdown → EPUB</div>
    <div class="rounded-lg bg-slate-800 px-5 py-4 font-mono text-base leading-8"># 作品タイトル<br>## 章タイトル<br><br>本文……</div>
    <div class="text-center text-2xl text-slate-500 my-4">↓</div>
    <div class="rounded-lg border border-sky-500/30 bg-sky-950/30 px-5 py-4 text-center text-xl">縦書き・右開きのEPUB</div>
    <div class="mt-4 text-sm text-slate-400">通常は変更された原稿をビルド。組版用の入力が変わった場合は全件を対象にする。</div>
  </div>
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
    <div class="text-xl text-emerald-300 font-semibold mb-5">② EPUB → Google Drive</div>
    <div class="rounded-lg bg-slate-800 p-4">
      <div class="font-semibold">PRの原稿</div>
      <div class="text-sm text-slate-300 mt-1">ブランチごとのフォルダにプレビューを同期</div>
    </div>
    <div class="text-center text-slate-500 text-xl my-4">／</div>
    <div class="rounded-lg bg-slate-800 p-4">
      <div class="font-semibold">masterの原稿</div>
      <div class="text-sm text-slate-300 mt-1">master用フォルダのEPUBを更新</div>
    </div>
    <div class="mt-4 text-sm text-slate-400">未変更のファイルは同期を省略。PR終了やブランチ削除に応じてプレビューを片付ける。</div>
  </div>
</div>

<div class="mt-6 text-base text-slate-300">ここでいう「配信」は <span class="font-semibold text-white">制作中の原稿を自分の端末で読むための同期</span> です。</div>

<!--
文章をMarkdownのまま読むよりも、縦書きのEPUBにすると読み味を確かめやすくなります。
GitHub Actions上で変更された原稿をビルド・検証し、その生成物を別のジョブに渡してDriveに同期しています。
PR用とmaster用の保存先を分けていますが、これはWebサービスの公開環境ではありません。あくまで自分で読むための成果物の管理です。
-->

---
layout: default
---

# 自動化したこと、まだ人が判断すること

<div class="grid grid-cols-3 gap-5 mt-10">
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
    <div class="text-lg text-emerald-300 font-semibold mb-4">スクリプト</div>
    <div class="text-lg leading-8">書式を検査する<br>EPUBを生成する<br>Driveへ同期する</div>
  </div>
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
    <div class="text-lg text-sky-300 font-semibold mb-4">LLM</div>
    <div class="text-lg leading-8">文章の問題を探す<br>設定矛盾の候補を出す<br>原文と照合する</div>
  </div>
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
    <div class="text-lg text-amber-300 font-semibold mb-4">人間</div>
    <div class="text-lg leading-8">指摘の妥当性を読む<br>修正を選ぶ<br>物語として採用する</div>
  </div>
</div>

<div class="mt-10 rounded-xl border border-slate-700 bg-slate-900/60 p-5">
  <div class="text-lg leading-8">今の評価は小規模で、実運用でどれだけ見落としが減ったかも未測定。<br>その一方、<span class="text-white font-semibold">Lint・ビルド・閲覧用ファイルの同期</span> は、繰り返す手作業を減らす仕組みとして使っている。</div>
</div>

<!--
自動化したのは、定型的な形式検査とファイルの生成・同期、それから整合性確認の補助です。
LLMが正しいと判定したから採用する、という構成にはしていません。
小規模なテストでは期待した動作を確認できましたが、未知の作品での精度や、制作全体の品質改善を定量的に示せる段階ではありません。
-->

---
layout: center
class: text-center
title: まとめ
---

<div class="max-w-4xl mx-auto">
  <div class="text-slate-400 tracking-wide mb-8 text-lg">まとめ</div>
  <h1 class="text-4xl leading-tight font-bold">小説制作でも、<br>自動化できる作業はある</h1>
  <div class="mt-11 space-y-4 text-xl text-slate-300">
    <div>形式はPythonで確かめる</div>
    <div>整合性はLLMに候補を出してもらう</div>
    <div>読むためのEPUBはCIで作って同期する</div>
  </div>
  <div class="mt-12 text-lg text-slate-400">指摘をどう扱い、何を作品に残すかは、引き続き人間の仕事。</div>
  <div class="mt-12 text-sm text-slate-500">ありがとうございました</div>
</div>

<!--
小説制作にCI/CDの道具を持ち込むと、書式検査やEPUB生成・同期のような定型作業は扱いやすくなりました。
LLM校閲は可能性がありますが、何を矛盾とみなすかの定義も含めて、まだ検証が必要です。
仕組みが代わりに書いてくれるわけではありませんが、原稿を確認するための手間を一部減らせています。以上です。
-->
