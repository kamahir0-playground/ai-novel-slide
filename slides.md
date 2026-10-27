---
theme: default
colorSchema: dark
title: AIに小説を書かせるうえで構築したCI/CD
info: |
  AIを使った小説制作を、GitHub Actionsで継続的に検査・ビルド・配信する仕組みの紹介。
  技術LT向け。発表時間は未指定のため、スライドごとの秒数は設定しない。
class: text-center
layout: cover
transition: slide-left
mdc: true
drawings:
  persist: false
---

<div class="mx-auto max-w-4xl">
  <div class="mb-7 text-emerald-300 text-lg font-semibold tracking-widest">NOVEL × ENGINEERING</div>

  <h1 class="text-5xl leading-tight font-bold">AIに小説を書かせるうえで<br>構築したCI/CD</h1>

  <div class="mt-8 text-2xl opacity-85">原稿をPRに出し、検査して、電子書籍にする</div>
  <div class="mt-14 text-sm opacity-60">GitHub Actions / LLM Review / EPUB / Google Drive</div>
</div>

<!--
趣味でAIエージェントに小説を書かせています。今日の話は、小説の書き方やモデルの性能比較が主題ではありません。

AIが作る原稿を継続して管理するために、ソフトウェア開発でおなじみのCI/CDを持ち込んだ、という話です。

小説なのにPull RequestやGitHub Actionsが出てくる、少し変わった構成を紹介します。
-->

---
layout: default
---

# まず、何をしているのか

<div class="grid grid-cols-5 gap-7 items-center mt-11">
  <div class="col-span-3 space-y-6">
    <div class="card">
      <div class="text-xl font-semibold text-emerald-300 mb-3">AIエージェントと小説を執筆・改稿</div>
      <div class="opacity-85">本文も設定資料も、基本は <b>Markdown</b> で管理</div>
    </div>
    <div class="card">
      <div class="text-xl font-semibold text-sky-300 mb-3">GitHubを制作の作業場にする</div>
      <div class="opacity-85">履歴・差分・Pull Requestで変更を追える</div>
    </div>
  </div>
  <div class="col-span-2 card text-left font-mono text-base leading-9">
    <div class="text-sky-300">repo/</div>
    <div>├─ novel/</div>
    <div>│　└─ proto2/</div>
    <div>├─ CHARACTERS.md</div>
    <div>├─ docs/</div>
    <div>├─ AGENTS.md</div>
    <div>└─ .github/</div>
  </div>
</div>

<div class="mt-8 text-sm opacity-60">AIは執筆の協力者。作品の採否や制作上の判断は人間が行う。</div>

<!--
まず前提です。小説本文をMarkdownとしてGitで管理し、登場人物の確定設定や創作方針、エージェント向け作業指示も同じリポジトリに置いています。

たとえばAGENTS.mdは作業の入口で、本文や人物設定、原稿規約の参照先を案内します。

ここで重要なのは、AIがどこかで勝手に小説を公開するわけではないことです。人間の指示とレビューを挟みながら、原稿を変更していくワークフローです。
-->

---
layout: default
---

# 小説にも「バグ」がある

<div class="grid grid-cols-3 gap-5 mt-12">
  <div class="card min-h-55">
    <div class="text-4xl mb-4">🧩</div>
    <div class="text-xl font-bold text-amber-300 mb-3">物語の矛盾</div>
    <div class="text-base opacity-85 leading-8">前の章と人数が違う<br>知るはずのない事実を知っている</div>
  </div>
  <div class="card min-h-55">
    <div class="text-4xl mb-4">📝</div>
    <div class="text-xl font-bold text-amber-300 mb-3">文章・形式の破綻</div>
    <div class="text-base opacity-85 leading-8">不自然な文のつながり<br>見出しや場面転換の記法違反</div>
  </div>
  <div class="card min-h-55">
    <div class="text-4xl mb-4">📚</div>
    <div class="text-xl font-bold text-amber-300 mb-3">成果物の管理</div>
    <div class="text-base opacity-85 leading-8">原稿はあるが読みづらい<br>変更ごとに電子書籍化するのが手間</div>
  </div>
</div>

<div class="mt-10 text-xl text-center font-semibold">だったら、<span class="text-emerald-300">小説にもCI/CD</span> を導入できないか？</div>

<!--
小説はソフトウェアではありませんが、長く書いていると品質管理に似た問題が出てきます。

AIが前の展開を取り違えれば、設定や時系列に矛盾が生じます。また、電子書籍にするには見出しや場面転換の形式にも一定の規則が必要です。

そして、Markdown原稿を直接読むより、電子書籍リーダーで読める成果物があると便利です。

これらを手作業で毎回確認する代わりに、自動化できる部分をGitHub Actionsに寄せました。

スライド内の矛盾例は課題の一般例であり、特定の本番原稿で起きたと断定するものではありません。
-->

---
layout: default
---

# 全体像：小説のCI/CD

<div class="mt-5 rounded-xl border border-slate-600/60 bg-slate-900/60 p-4">
  <div class="rounded-lg bg-slate-700/50 py-3 text-center font-semibold text-xl">原稿を変更 → GitHub Pull Request</div>
  <div class="text-center text-2xl opacity-70 my-2">↓</div>
  <div class="grid grid-cols-2 gap-4">
    <div class="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4">
      <div class="text-emerald-300 font-bold text-xl text-center mb-3">CI / Check</div>
      <div class="rounded bg-slate-900/70 p-3 text-center">原稿Lint</div>
      <div class="text-center my-2 text-lg opacity-60">＋</div>
      <div class="rounded bg-slate-900/70 p-3 text-center">AIによる校閲</div>
      <div class="text-sm text-center mt-3 opacity-70">結果をPRに返す</div>
    </div>
    <div class="rounded-lg border border-sky-500/40 bg-sky-500/10 p-4">
      <div class="text-sky-300 font-bold text-xl text-center mb-3">CD / Deliver</div>
      <div class="rounded bg-slate-900/70 p-3 text-center">縦書きEPUBをビルド</div>
      <div class="text-center my-2 text-lg opacity-60">↓</div>
      <div class="rounded bg-slate-900/70 p-3 text-center">Google Driveへ同期</div>
      <div class="text-sm text-center mt-3 opacity-70">PRプレビュー / master正式版</div>
    </div>
  </div>
</div>

<div class="mt-4 text-sm opacity-60">※ 実装上は、変更内容やPRの状態に応じて起動する独立したワークフロー。</div>

<!--
これが今日の地図です。原稿をGitHubで変更すると、大きく二系統が動きます。

一方のCIでは、機械的な形式検査とAIによる内容の校閲を行います。もう一方のCDでは、読める形式にビルドしてGoogle Driveに置きます。

ただし、一本の直列パイプラインではありません。Lint、AI校閲、コードテスト、EPUBのビルドと同期、不要なプレビューの削除は責務ごとに分けています。

また、実際の起動はDraftかReadyか、どのファイルが変わったか、といった条件で制御します。
-->

---
layout: default
---

# CI① 形式は、普通のLintで見る

<div class="grid grid-cols-2 gap-7 mt-8 items-start">
  <div>
    <div class="mb-3 text-lg font-semibold text-emerald-300">原稿には出版用の規約がある</div>

<pre class="!bg-slate-900/75 !text-slate-100 rounded-lg px-4 py-4 text-base leading-8"><code># 作品タイトル
## 章タイトル
### 節タイトル

本文。本文。</code></pre>

    <div class="mt-6 card text-base leading-8">
      <div>・見出しの階層を守る</div>
      <div>・章番号はビルダーが自動付与</div>
      <div>・場面転換は決まった記法を使う</div>
    </div>
  </div>
  <div class="card text-left">
    <div class="text-xl font-bold text-sky-300 mb-4">GitHub Actions</div>

<pre class="!bg-slate-900/75 !text-slate-100 rounded-lg px-4 py-4 text-base"><code>python tools/kindle/lint.py --all</code></pre>

    <div class="mt-6 text-lg leading-9">
      書式の正誤が決まっているなら、<br>
      <span class="font-bold text-emerald-300">LLMを呼ぶ必要はない</span>。
    </div>
  </div>
</div>

<!--
最初のCIは地味ですが重要です。作品の本文は独自のMarkdownサブセットで書いています。

新しい形式の原稿ではH1が作品タイトル、H2が章、H3が節です。章番号は原稿に直接書かず、電子書籍ビルダー側で付けます。場面転換も独立した区切り行を使うルールがあります。

こうしたものは判定基準が明確なので、PythonのLintで検査します。AIを何にでも使わない、というのも設計方針です。

なお旧案の一部には互換形式があり、全ファイルに同一の新形式を強制しているわけではありません。
-->

---
layout: default
---

# CI② 物語の整合性はAIで見る

<div class="mt-7 space-y-3">
  <div class="card text-center py-3">
    <div class="text-lg font-bold">本文を章・場面・段落で分割</div>
    <div class="text-sm opacity-65">長い原稿をチャンク単位にする</div>
  </div>
  <div class="text-center text-xl opacity-55">↓</div>
  <div class="grid grid-cols-3 gap-4">
    <div class="card-highlight text-center py-4">チャンク①<br><span class="text-sm opacity-80">局所的な破綻＋事実抽出</span></div>
    <div class="card-highlight text-center py-4">チャンク②<br><span class="text-sm opacity-80">局所的な破綻＋事実抽出</span></div>
    <div class="card-highlight text-center py-4">チャンク③…<br><span class="text-sm opacity-80">並列で検査</span></div>
  </div>
  <div class="text-center text-xl opacity-55">↓</div>
  <div class="card text-center py-3">
    <div class="text-lg font-bold">抽出した事実を集約し、章をまたぐ矛盾を探す</div>
    <div class="text-sm opacity-65">候補があれば原文に戻って再検証</div>
  </div>
  <div class="text-center text-xl opacity-55">↓</div>
  <div class="rounded-lg border border-sky-500/40 bg-sky-500/10 text-center px-4 py-3 font-semibold">根拠となる本文箇所を添えてPRにレビュー結果を投稿</div>
</div>

<!--
こちらがAI校閲の中心です。現行の本番ワークフローではGPT-6 Lunaを使用しています。

長い原稿を単純に全文投入するのではなく、章・節・場面転換などを基準にチャンクに分けます。

まず各チャンクについて文章の破綻を検査し、そこで成立した事実を構造化して抽出します。この局所解析は並列実行できます。

次に事実を集約して、離れた章の間で矛盾していないかを見ます。矛盾候補は原文に戻って再検証し、PRのコメントに根拠を示します。

単に「AIにレビューして」と投げるより、検査範囲や根拠を絞ったパイプラインです。
-->

---
layout: default
---

# 難しいのは「矛盾っぽいが矛盾ではない」ケース

<div class="grid grid-cols-2 gap-6 mt-10">
  <div class="card-warning">
    <div class="text-xl font-bold text-amber-300 mb-5">単純に比較すると…</div>
    <div class="text-3xl font-bold text-center my-5">17件 → 13件 → 0件</div>
    <div class="text-center opacity-85">「数字が違う！ 矛盾？」</div>
  </div>
  <div class="card-highlight">
    <div class="text-xl font-bold text-emerald-300 mb-5">物語として読むと…</div>
    <div class="text-lg leading-9 text-center my-4">調査が進んで<br>未処理件数が減っただけ</div>
    <div class="text-center opacity-85">「正常な状態変化」</div>
  </div>
</div>

<div class="mt-10 text-lg text-center">時点・人物の認識・確定済みかどうかを区別する。<br><b class="text-emerald-300">疑わしいだけで断定しない。</b></div>

<!--
AIに文章を読ませると、違いを何でも矛盾と呼びたくなる問題があります。

たとえば17件が13件になり、最終的に0件になっても、処理が進んだだけなら正常です。水曜日には保留だったものが木曜日に決定するのも、普通の状態遷移です。

さらに、登場人物Aは許可を得たと思っているが、Bは許可していないと認識している、という食い違いは物語上の意図かもしれません。

そこで、時点・立場・確定度を考慮し、グローバル検査で挙がった候補も原文を再検証する設計にしています。
-->

---
layout: default
---

# 実験：仕込んだ矛盾を検出できる？

<div class="grid grid-cols-2 gap-6 mt-9">
  <div class="card-highlight text-center">
    <div class="text-sm uppercase tracking-widest text-emerald-300">INJECTED ERRORS</div>
    <div class="text-6xl font-bold mt-5">3 / 3</div>
    <div class="text-lg mt-4">仕込んだ破綻・矛盾を検出</div>
    <div class="text-sm mt-3 opacity-65">文章破綻 / 同一場面の矛盾 / 章間の数量矛盾</div>
  </div>
  <div class="card text-center">
    <div class="text-sm uppercase tracking-widest text-sky-300">NEGATIVE CASES</div>
    <div class="text-6xl font-bold mt-5">4 / 4</div>
    <div class="text-lg mt-4">見かけ上の矛盾を誤検出せず</div>
    <div class="text-sm mt-3 opacity-65">部分と全体 / 状態推移 / 認識差 / 知識獲得</div>
  </div>
</div>

<div class="mt-9 rounded-lg border border-amber-500/30 bg-amber-500/5 px-5 py-4">
  <div class="font-semibold text-amber-300">ここは重要：あくまで限定的な評価実験</div>
  <div class="text-base opacity-85 mt-2">本番の小説での検出率・誤検出率が保証されたわけではない。</div>
</div>

<div class="mt-3 text-xs opacity-50">出典：リポジトリ内の PR #97 系評価結果（run4 / run5）</div>

<!--
仕組みだけでなく、検証用の原稿で試した結果もあります。

まず人工的に3種類の問題を混ぜた評価データでは、文章破綻、局所的な矛盾、章をまたぐ数量矛盾の3件すべてを検出しました。

たとえば同一の最終稿が別の章で3ページと8ページになっているケースは、原文再検証を通して指摘されています。

反対に、あえて矛盾ではない4種類のケースを入れた評価では、4件とも誤検出しませんでした。

ただし、ここでの3/3や4/4は小さな検証セットでの結果です。一般的な精度や本番作品の品質を保証する数値として扱うべきではありません。

元データ：tools/novel_ci/eval_results/pr97_run4_summary.json、pr97_run5_summary.json。
-->

---
layout: default
---

# CD① 原稿を「読める電子書籍」にする

<div class="grid grid-cols-5 gap-7 items-center mt-8">
  <div class="col-span-2 space-y-4">
    <div class="text-xl font-semibold text-sky-300">Markdown原稿</div>

<pre class="!bg-slate-900/75 !text-slate-100 rounded-lg px-4 py-4 text-sm leading-7"><code># 作品タイトル
## はじまりの朝

校庭に風が吹いた。
廊下の先で鐘が鳴る。</code></pre>

    <div class="text-center text-3xl opacity-60">↓ ビルド</div>
    <div class="card-highlight text-center font-bold text-xl">EPUB</div>
  </div>
  <div class="col-span-3 flex items-center gap-6">
    <div class="card py-5 px-6 bg-slate-100 text-slate-900 rounded-xl shadow-xl h-75 w-48 shrink-0">
      <div class="text-[12px] opacity-50 mb-3">電子書籍の表示イメージ</div>
      <div style="writing-mode: vertical-rl; height: 230px; width: 145px; line-height: 2.35; font-family: serif; font-size: 17px;">
        はじまりの朝　校庭に風が吹いた。廊下の先で鐘が鳴る。
      </div>
    </div>
    <div class="space-y-5">
      <div class="text-xl font-bold">EPUBとは？</div>
      <div class="text-base leading-8">電子書籍のファイル形式。<br>文字を画面サイズに合わせて組み直せる。</div>
      <div class="text-base leading-8 text-emerald-300">縦書き・右開き・目次も生成</div>
    </div>
  </div>
</div>

<div class="mt-5 text-xs opacity-55">※ 表示は説明用の模式図。実際の端末上の見え方はリーダーによって異なる。</div>

<!--
ここからCDです。EPUBという形式に馴染みがない人もいると思うので、簡単に紹介します。

EPUBは電子書籍で使うファイル形式で、PDFの固定レイアウトとは違い、端末の画面や文字サイズに合わせて本文を流し込めます。

このリポジトリではMarkdownから日本語の縦書き・右から左へのページ送りを持つEPUBを生成し、目次リンクや縦書きCSSも検証します。

つまりGitHub上の原稿を、電子書籍リーダーで読める成果物に変えるビルド工程です。ここで示した本文は説明用のダミーです。

Kindleストアへの自動出版ではなく、EPUBファイルの生成とGoogle Driveへの同期を行います。
-->

---
layout: default
---

# CD② PRはプレビュー、masterは正式版

<div class="grid grid-cols-2 gap-6 mt-10">
  <div class="card border border-sky-500/35">
    <div class="text-sky-300 font-bold text-xl mb-5">Pull Request</div>
    <div class="text-lg">変更した原稿をビルド</div>
    <div class="text-center text-2xl opacity-60 my-4">↓</div>
    <div class="rounded-lg bg-sky-500/10 py-5 text-center font-semibold">ブランチ別プレビュー</div>
    <div class="text-sm opacity-70 mt-5">PRクローズ／ブランチ削除時は後片付け</div>
  </div>
  <div class="card border border-emerald-500/35">
    <div class="text-emerald-300 font-bold text-xl mb-5">master にマージ</div>
    <div class="text-lg">変更を反映したEPUBをビルド</div>
    <div class="text-center text-2xl opacity-60 my-4">↓</div>
    <div class="rounded-lg bg-emerald-500/10 py-5 text-center font-semibold">正式版のフォルダに同期</div>
    <div class="text-sm opacity-70 mt-5">変更がないファイルのアップロードは省略</div>
  </div>
</div>

<div class="mt-10 text-center text-lg">配信先は <b class="text-sky-300">Google Drive</b>。検証済みEPUBだけを同期する。</div>

<!--
ビルドしたEPUBはGoogle Driveに同期します。

PRではブランチ専用のフォルダにプレビューを置き、まだマージ前の原稿を読めるようにします。masterにマージすると、正式版のフォルダを更新します。

差分を使って変更された原稿だけをビルドし、ソースとビルダー資産のフィンガープリントが一致する成果物は再アップロードしません。

一方、ビルダー本体や組版CSSなどに変更があれば、影響範囲が広いため必要な全原稿を再検証します。

PRプレビューは、不要になったら別のCleanupワークフローで削除します。ビルドとDrive認証を分けている点も一般的なCDに近い構成です。
-->

---
layout: default
---

# 運用で一番気を遣ったのは「有料CI」

<div class="grid grid-cols-2 gap-6 mt-7">
  <div>
    <div class="text-lg font-semibold text-emerald-300 mb-4">AI校閲の起動ルール</div>
    <div class="space-y-3 text-base">
      <div class="card py-3"><b>Draft PR</b> → 実行しない</div>
      <div class="card py-3"><b>Ready PR作成</b> → AI校閲</div>
      <div class="card py-3"><b>追加push</b> → 原則AI校閲しない</div>
      <div class="card py-3"><b>Draft → Ready</b> → 明示的に再校閲</div>
    </div>
  </div>
  <div>
    <div class="text-lg font-semibold text-sky-300 mb-4">暴走を防ぐガード</div>
    <div class="card space-y-4 text-base leading-7">
      <div><b class="text-xl">$0.10</b> <span class="opacity-75">/ PR・実行</span><br><span class="text-sm opacity-65">事前推定コストの上限</span></div>
      <div><b class="text-xl">35回</b> <span class="opacity-75">/ PR・実行</span><br><span class="text-sm opacity-65">API呼び出し回数の上限</span></div>
      <div class="pt-2 border-t border-slate-500/40">原稿と設定のハッシュでキャッシュ確認</div>
      <div>APIキーを持つ解析ジョブと、PR投稿ジョブを分離</div>
    </div>
  </div>
</div>

<div class="text-xs mt-5 opacity-55">※ 料金はクライアント側の推定。請求額の厳密な上限保証ではない。</div>

<!--
一般のLintと違って、AIを使うCIは実行するたびに料金が発生します。

そのためDraft PRでは走らせず、Ready PRの作成時やDraftからReadyへの切り替えを校閲のタイミングにしています。ReadyなPRへの通常の追加pushでは有料AI校閲を自動再実行しません。LintやEPUBプレビューは、対象変更に応じて通常どおり動きます。

さらに1 PR・1実行で35 API呼び出し、推定0.10ドルの枠を設定し、送信前に予約して超過を防ぎます。これはあくまで推定値で、請求額を厳密に保証するものではありません。

同じ原稿とエンジン設定に対してはキャッシュを確認し、失敗時は成功扱いせず止めます。またAPIキーを扱う解析ジョブにはPR書き込み権限を与えず、コメント投稿は別のジョブで行います。
-->

---
layout: center
class: text-center
title: 小説制作にも、CI/CDは使える
---

<div class="max-w-4xl mx-auto">
  <div class="text-emerald-300 text-lg font-semibold tracking-widest mb-8">TAKEAWAYS</div>

  <h1 class="text-5xl leading-tight font-bold">小説制作にも、CI/CDは使える</h1>

  <div class="grid grid-cols-3 gap-4 mt-12 text-left">
    <div class="card"><div class="text-emerald-300 font-bold mb-3">機械に任せる</div><div class="text-base opacity-85">形式チェックと電子書籍ビルド</div></div>
    <div class="card"><div class="text-sky-300 font-bold mb-3">AIに手伝わせる</div><div class="text-base opacity-85">根拠付きの矛盾候補の発見</div></div>
    <div class="card"><div class="text-amber-300 font-bold mb-3">人間が決める</div><div class="text-base opacity-85">面白さと、修正すべきかの判断</div></div>
  </div>

  <div class="mt-12 text-2xl font-semibold">「AIに書かせる」だけでは終わらず、<br>気づけば小説の開発・運用基盤を作っていた。</div>

  <div class="mt-10 text-sm opacity-60">ありがとうございました</div>
</div>

<!--
まとめです。小説の内容はプログラムのように正解が一意には決まりません。それでも、形式の検査や成果物の生成・配信は通常のソフトウェア開発にかなり近い手法で自動化できました。

一方、AI校閲は内容に踏み込める反面、誤検出や課金の問題があるため、対象を絞って根拠を添え、起動条件を制御しています。

作品の面白さまでCIで決めるつもりはなく、最後に修正するかどうかは人間が判断します。

AIに小説を書かせる趣味だったはずが、気づけばLint、レビューCI、ビルド、デプロイ、キャッシュと、かなり普通の開発基盤を作っていました。以上です。
-->
