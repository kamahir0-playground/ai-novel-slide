---
theme: default
colorSchema: dark
themeConfig:
  primary: '#38bdf8'
title: 小説を読んでいたらCI/CDを構築していた
info: |
  AIで作った小説をKindle端末で読むことを出発点に、Markdownから縦書きEPUBを生成し、GitHub ActionsとGoogle Drive APIで管理・配信する個人用の「なんちゃってCI/CD」。
  内容校閲のAI自動化を試して見送った経緯にも触れる。
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
- 今日は「AIで小説を書いた」話ではなく、Kindle端末で読みたくなり、配布・更新の仕組みを作った話をする
- リポジトリは ai-novel-alpha。スライドよりそちらが一次情報
-->

---
layout: default
---

# 少し前、AIに小説を書かせていた

<div class="mt-10 grid grid-cols-2 gap-8">
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-8">
    <div class="text-2xl font-semibold">制作</div>
    <div class="mt-5 text-lg leading-9 text-slate-300">AIも使いながら原稿をMarkdownで書き溜めていく。</div>
  </div>
  <div class="rounded-2xl border border-sky-500/40 bg-sky-950/20 p-8">
    <div class="text-2xl font-semibold">最初の読み方</div>
    <div class="mt-5 text-lg leading-9 text-slate-300">生成結果を<span class="font-semibold text-white">チャット画面でそのまま</span>読んでいた。</div>
  </div>
</div>

<div class="mt-10 text-center text-xl text-slate-300">文学論やプロンプトの話ではなく、<span class="font-semibold text-white">「読む体験」から広がった</span>話です。</div>

<!--
- 少し前の時期、AIに小説を書かせていた。自分で全部書くというより、章を足したり捨てたりしながら続けていた
- 当時は完成に近い原稿を、生成AIのチャット上でそのまま読んでいた。手軽だが、章をまたいで読み返したり、寝る前に端末で続きを読んだりするには向かない
- このあと「端末で読みたい」が出発点になり、結果としてCI/CDに近い仕組みまで行き着く
-->

---
layout: default
---

# 筆が巧い原稿は、Kindle端末で読みたくなる

<div class="mt-10 grid grid-cols-5 gap-6 items-center">
  <div class="col-span-2 rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center">
    <div class="text-5xl mb-5">💬</div>
    <div class="text-2xl font-semibold">チャットで読む</div>
    <div class="mt-4 text-lg text-slate-300">試し読みには十分<br>長編の「本」としては弱い</div>
  </div>
  <div class="col-span-1 text-center text-5xl text-slate-500">→</div>
  <div class="col-span-2 rounded-2xl border border-sky-500/40 bg-sky-950/20 p-8 text-center">
    <div class="text-5xl mb-5">📱</div>
    <div class="text-2xl font-semibold">Kindleで読みたい</div>
    <div class="mt-4 text-lg text-slate-300">縦書きの小説として<br>目次・しおり付きで読む</div>
  </div>
</div>

<!--
- だんだん原稿の質も上がり、結構筆が巧いものができてきた。そうなると、チャットではなくKindle端末で読みたくなる
- 自分のPDFをKindleに入れて読める、という話は以前から聞いたことがある。今回はPDFではなくEPUBを使うが、「自分で作ったファイルを端末で読む」という発想は同じ
-->

---
layout: default
---

# 調べて分かったこと：自作ファイルもKindleで読める

<div class="mt-8 rounded-2xl border border-slate-700 bg-slate-900/60 p-8 text-lg leading-10">
  <div>・自分で作った電子書籍ファイルを、Kindleのライブラリに取り込める</div>
  <div class="mt-3">・取り込めば、<span class="font-semibold text-white">Kindle端末と同期</span>して同じ本として読める</div>
  <div class="mt-3">・「配信インフラを作る」より、<span class="font-semibold text-white">試してみるのが面白そう</span>だったのでやってみた</div>
</div>

<div class="mt-8 text-center text-xl text-slate-300">小説を<strong class="text-white">1冊ビルドする</strong>だけなら小さい。<br>改稿や別案が増えると、<strong class="text-white">更新の仕組み</strong>が欲しくなる。</div>

<!--
- 調べると、自作のEPUBをKindleアプリ経由でライブラリに追加すると端末側にも載る、という流れがある。実装の細部は後述するが、まずは「読めるか試す」が起点
- 1ファイルだけなら手作業でも足りる。しかしAI小説は改稿や別案の枝が増えやすく、毎回手でビルドして送るのはつらい。だからGitHubとCI/CD寄りの仕組みに寄せていく
-->

---
layout: default
---

# できあがった仕組みの流れ

<div class="mt-5 rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
  <div class="rounded-xl bg-slate-800 px-6 py-3 text-center text-xl font-semibold">原稿を変えて Pull Request / master に反映</div>
  <div class="my-2 text-center text-3xl text-slate-500">↓</div>
  <div class="grid grid-cols-2 gap-5">
    <div class="rounded-xl border border-emerald-500/40 bg-emerald-950/15 p-5">
      <div class="text-emerald-300 text-2xl font-bold">CI</div>
      <div class="mt-4 text-lg leading-9">原稿の形式チェック<br>EPUBの生成・検証</div>
    </div>
    <div class="rounded-xl border border-sky-500/40 bg-sky-950/15 p-5">
      <div class="text-sky-300 text-2xl font-bold">CD</div>
      <div class="mt-4 text-lg leading-9">EPUBをビルド<br>Google Driveの<span class="font-semibold">ブランチ別フォルダ</span>へ同期</div>
    </div>
  </div>
  <div class="my-2 text-center text-3xl text-slate-500">↓</div>
  <div class="rounded-xl border border-amber-500/30 bg-slate-900/70 px-6 py-4 text-center text-lg leading-9">
    スマホの Google Drive → Kindleアプリで開く → ライブラリに追加 → <span class="font-semibold text-white">Kindle端末でも読める</span>
    <div class="mt-2 text-base text-amber-200/90">（ライブラリへの追加は手動。理由は後述）</div>
  </div>
</div>

<!--
- PRを出すか master に載せると、GitHub Actionsが走る。CI側では原稿のLintやEPUBが組めるかの検証、CD側ではEPUBをビルドしてGoogle Drive上の決まった場所に置く。ブランチごとにフォルダを分けるので、別案のPRは別フォルダにプレビューが出る
- 読むときは、スマホのGoogle DriveアプリからEPUBをKindleアプリで開き、ライブラリに追加する。追加された本は端末と同期されるので、結局Kindle端末で読める。Driveまでは自動、Kindleへの「追加」だけ手動
-->

---
layout: default
---

# ビルドした小説を、Kindleで読むと

<div class="mt-6 grid grid-cols-2 gap-6">
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-lg leading-10">
    <div class="text-sky-300 font-bold text-xl mb-4">EPUB（PDFではない）</div>
    <div>・ページ数表示、目次ジャンプ、ハイライト（マーカー）</div>
    <div class="mt-2">・市販の電子書籍に近い操作感</div>
    <div class="mt-2">・本文は<span class="font-semibold text-white">縦書き・右開き</span></div>
  </div>
  <div class="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-lg leading-10">
    <div class="text-emerald-300 font-bold text-xl mb-4">1ページ目</div>
    <div>・ビルド番号・ブランチ・コミット</div>
    <div class="mt-2">・原稿パス・ビルド日時（JST）</div>
    <div class="mt-4 text-base text-slate-400">どの版を読んでいるか後から追えるようにしている</div>
  </div>
</div>

<div class="mt-6 text-center text-base text-slate-400">※ 発表時は端末スクショや実EPUBを見せると伝わりやすい（<span class="font-mono">public/images/</span> に置ける）</div>

<!--
- ここは実機デモ向き。PDFではなくEPUBなので、Reflowableな電子書籍としてページ数が出たり、目次から章に飛んだり、マーカーが引けたりする。縦書き小説として読める
- 1ページ目（厳密には本文前）にビルド情報ページを入れている。branch名やcommit、いつビルドしたかが分かるので、「この別案PRの版を読んでいる」が確認しやすい
-->

---
layout: default
---

# EPUBとは（ざっくり）

<div class="mt-8 space-y-5 text-lg leading-10">
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
    電子書籍の<span class="font-semibold text-white">共通フォーマット</span>のひとつ（International Digital Publishing Forum 系の標準）
  </div>
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
    中身は HTML + CSS + 画像などを ZIP にまとめたもの。<span class="font-semibold text-white">端末サイズに合わせて組み替わる</span>（固定版面のPDFとは役割が違う）
  </div>
  <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
    Kindleも EPUB を取り込める。今回は Markdown → 自前ビルド → EPUB → Kindle、という経路
  </div>
</div>

<!--
- EPUBは「電子書籍用のコンテナ格式」と思えば十分。中身はWeb技術ベースで、読者の端末に合わせてレイアウトが変わる
- PDFは版面固定、EPUBは読書アプリ側と組版の組み合わせ、というイメージ。Kindleストアの本も最終的には似た仕組みで、今回は自分用に同じ体験を再現している
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
      <div class="text-xl leading-9">縦書き・右開き<br>章番号・目次<br>Kindle向けファイル</div>
    </div>
  </div>
</div>

<div class="mt-7 rounded-xl bg-slate-800/70 p-5 font-mono text-lg text-center">task kindle -- novel/proto2/proto2-ep01.md</div>
<div class="mt-4 text-base text-slate-400">Vivliostyle CLI 等で組版。生成後に nav 目次・縦書き設定などを機械検証する。</div>

<!--
- 原稿はGit上のMarkdown。ローカルやCIでは task kindle / Python ビルダーが HTML/CSS を経て EPUB を出す
- 章番号はMarkdownに書かず、ビルダーが付与する。短い英数字は縦中横にするなど、日本語縦書き向けの処理もビルダー側
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
    <div>├─ tools/kindle/</div>
    <div>├─ tools/drive/</div>
    <div>└─ .github/workflows/</div>
  </div>
  <div class="col-span-3 space-y-5">
    <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
      <div class="text-xl font-semibold">改稿・別案は Pull Request</div>
      <div class="mt-4 text-lg leading-8 text-slate-300">差分を見て採用する版を選ぶ。CI/CDはそのPRに紐づく。</div>
    </div>
    <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
      <div class="text-xl font-semibold">「読むためのコード」も同居</div>
      <div class="mt-4 text-lg leading-8 text-slate-300">ビルド・Drive同期・workflow まで同一リポジトリ。</div>
    </div>
  </div>
</div>

<!--
- 小説テキストも、EPUBにするツールも、GitHub Actionsも同じリポジトリにある。別案を試すときはブランチとPRを切り、マージすれば master が採用版
- AIにコードを書かせた部分も多いが、構成としては「個人用の mono-repo」に近い
-->

---
layout: default
---

# CI：原稿チェックとEPUB検証（いわゆる校正の自動化）

<div class="mt-9 grid grid-cols-2 gap-7">
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-7">
    <div class="text-emerald-300 text-xl font-semibold">Markdown Lint</div>
    <div class="mt-6 font-mono text-base rounded-lg bg-slate-800 px-4 py-4">python3 tools/kindle/lint.py --all</div>
    <div class="mt-6 text-lg leading-9 text-slate-300">見出し構造・場面転換記法など、<span class="font-semibold text-white">ビルダーが解釈できる原稿か</span>を見る。</div>
  </div>
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-7">
    <div class="text-sky-300 text-xl font-semibold">ビルド・検証</div>
    <div class="mt-6 text-lg leading-10">Pythonテスト<br>EPUB生成<br>目次リンク・縦書き・RTL の検証</div>
  </div>
</div>

<div class="mt-10 border-l-4 border-emerald-400 pl-6 text-lg text-slate-200">
  出版現場の「校正」そのものではなく、<span class="font-semibold text-white">壊れない原稿・壊れないEPUB</span>を保証するCI。
  <span class="block mt-2 text-base text-slate-400">面白さ・矛盾の内容評価は別問題（次のスライド）。</span>
</div>

<!--
- ここで言う校正に近いのは、原稿が規約どおりか、EPUBとして成立するか、という機械的なチェック。Lintは箇条書きや生HTMLなど、小説ビルダーが想定しないMarkdownを弾く
- ビルド後は zip 内を検査し、縦書きCSSや目次のリンク先IDが揃っているかまで見る。文芸的な良し悪しは判定しない
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
    <div class="mt-7 text-center font-mono text-lg">---</div>
    <div class="my-5 text-center text-3xl text-slate-500">↓</div>
    <div class="text-lg text-center leading-8">装飾は CSS<br>原稿は記号だけ</div>
  </div>
</div>

<!--
- 組版の話は深掘り用。作者は内容と見出しだけ書き、表示の都合はビルダーが引き受ける設計にしている
-->

---
layout: default
---

# ちなみに：AIによる「内容校閲」CIも試したが、やめた

<div class="mt-8 grid grid-cols-2 gap-6">
  <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-7">
    <div class="text-sky-300 text-xl font-bold">やったこと</div>
    <div class="mt-6 text-lg leading-9">OpenAI 等の API で<br>人物・時間・条件の矛盾疑義を<br>PRコメントに出す</div>
  </div>
  <div class="rounded-2xl border border-amber-500/40 bg-slate-900/70 p-7">
    <div class="text-amber-300 text-xl font-bold">やめた理由</div>
    <div class="mt-6 text-lg leading-9">見逃しが残る<br>話者の取り違えなど誤指摘<br>長文で応答が途切れることも</div>
  </div>
</div>

<div class="mt-7 text-xl text-center font-semibold">この精度では<span class="text-amber-300">自動で通す基準</span>にできず、<span class="text-amber-300">内容校閲のCIはやめた</span>。</div>
<div class="mt-4 text-sm text-slate-400 text-center">評価実験: <a href="https://github.com/kamahir0/ai-novel-alpha/pull/123" class="underline">PR #123</a> / <a href="https://github.com/kamahir0/ai-novel-alpha/pull/124" class="underline">PR #124</a></div>

<!--
- 前のスライドの「形式のCI」とは別に、OpenAI API で内容の矛盾を探させる workflow も試した。安価なモデルで分割解析し、PRにコメントする形
- 実原稿で回すと、取りこぼしや誤った話者帰属、トークン上限での不完全出力があり、人間がそのまま信頼するには足りなかった。コードは残っているが、方針としてはやめている。本編の話は「読むためのCI/CD」
-->

---
layout: default
---

# Kindleを、配信の終点にはしなかった

<div class="mt-10 grid grid-cols-2 gap-7">
  <div class="rounded-2xl border border-emerald-500/40 bg-slate-900/70 p-8">
    <div class="text-emerald-300 text-xl font-semibold">ライブラリへ送る</div>
    <div class="mt-7 text-3xl font-bold">自動化の手段はある</div>
    <div class="mt-5 text-lg text-slate-300">EPUBをKindle側へ渡す経路は用意できる。</div>
  </div>
  <div class="rounded-2xl border border-amber-500/40 bg-slate-900/70 p-8">
    <div class="text-amber-300 text-xl font-semibold">不要になった版を消す</div>
    <div class="mt-7 text-3xl font-bold">自動では整理しづらい</div>
    <div class="mt-5 text-lg text-slate-300">調べた範囲では、投入済み版を同様に自動削除できなかった。</div>
  </div>
</div>

<div class="mt-10 border-l-4 border-sky-400 pl-6 text-xl leading-9">
  別案PRが増えるとファイルも増える。<br>
  <span class="font-semibold text-white">追加だけでなく削除・整理できる Google Drive を終点</span>にした。
</div>

<!--
- 本当はKindleライブラリへの追加まで全部自動にしたかった、というのが本音。Send to Kindle 系で「入れる」はできるが、古いプレビュー版をライブラリから自動で掃除する、というのが弱い
- 別案PRごとにEPUBが増える運用では、Kindle側がゴミ箱化しやすい。Drive上なら API でフォルダごと削除できるので、自動化の終点をDriveに置き、Kindleへの追加だけスマホで手動にしている
-->

---
layout: default
---

# CD：Google Drive までを自動化する

<div class="mt-6 grid grid-cols-5 gap-4 items-stretch text-center">
  <div class="col-span-2 rounded-2xl border border-sky-500/40 bg-sky-950/20 p-6">
    <div class="text-sky-300 text-lg font-bold">自動</div>
    <div class="mt-5 text-xl leading-9">変更検知<br>↓<br>EPUBビルド<br>↓<br>Drive API で同期</div>
  </div>
  <div class="col-span-1 flex flex-col justify-center items-center">
    <div class="text-4xl text-slate-500">→</div>
    <div class="mt-3 text-base text-amber-300 font-semibold">手動</div>
  </div>
  <div class="col-span-2 rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
    <div class="text-slate-300 text-lg font-bold">読者操作</div>
    <div class="mt-5 text-xl leading-9">Driveアプリ<br>↓<br>Kindleで開く<br>↓<br>端末で読む</div>
  </div>
</div>

<div class="mt-5 text-center text-lg text-slate-300">Drive は<span class="font-semibold text-white">ブランチ別の EPUB 置き場</span>。Kindle への自動配信ではない。</div>

<!--
- CDの話。Build ジョブで EPUB を作り Artifact で渡し、Deploy ジョブだけが Google の OAuth 情報を使って Drive に upload / update / delete する
- PR ではブランチ名のフォルダにプレビュー、master では採用版フォルダに置く。PRが閉じたら Cleanup workflow でプレビューフォルダを消せる
-->

---
layout: default
---

# Google Drive API：OAuth とフォルダ設計

<div class="mt-5 grid grid-cols-2 gap-5">
  <div class="rounded-2xl border border-sky-500/40 bg-slate-900/70 p-6">
    <div class="text-sky-300 text-xl font-bold">認証（Deploy のみ）</div>
    <div class="mt-4 text-lg leading-9 text-slate-300">
      OAuth 2.0 + refresh token<br>
      スコープは <span class="font-mono text-base">drive.file</span><br>
      Secrets: Client ID / Secret / Token / ルート ID
    </div>
  </div>
  <div class="rounded-2xl border border-emerald-500/40 bg-slate-900/70 p-6">
    <div class="text-emerald-300 text-xl font-bold">Drive 上の置き方</div>
    <div class="mt-4 font-mono text-sm leading-8 text-slate-200">
      Deployments/<br>
      └ kamahir0__ai-novel-alpha/<br>
      &nbsp;&nbsp;├ master/ …採用版<br>
      &nbsp;&nbsp;└ &lt;branch&gt;/ …PRプレビュー
    </div>
  </div>
</div>

<div class="mt-5 rounded-xl border border-slate-700 bg-slate-900/60 p-5 font-mono text-sm leading-8 text-slate-200">
  <span class="text-violet-300">tools/drive/sync.py</span>
  pr / incremental / full / delete-branch
  <span class="text-slate-400">｜</span>
  原稿SHA・ビルダーSHA が同じならアップロード省略
</div>

<!--
- Drive API の説明。サービスアカウントではなく、Desktop OAuth で refresh token を GitHub Secrets に置いている。スコープは drive.file で、このアプリが触ったファイルに限定される
- sync.py が PR では差分の novel だけ EPUB 化して reconcile、master では incremental 更新、ブランチ削除時は delete-branch。同じ内容なら SHA が一致して SKIP され、無駄な再アップロードを避ける
-->

---
layout: default
---

# 変更内容に応じて、ビルド範囲を変える

<div class="mt-10 grid grid-cols-3 gap-5">
  <div class="rounded-2xl border border-sky-500/35 bg-slate-900/70 p-6">
    <div class="text-sky-300 text-xl font-bold">原稿だけ</div>
    <div class="mt-7 text-lg leading-9">そのファイルだけ Lint・EPUB・Drive同期</div>
  </div>
  <div class="rounded-2xl border border-emerald-500/35 bg-slate-900/70 p-6">
    <div class="text-emerald-300 text-xl font-bold">ビルダー変更</div>
    <div class="mt-7 text-lg leading-9">テスト実行<br>全原稿を再ビルド</div>
  </div>
  <div class="rounded-2xl border border-violet-500/35 bg-slate-900/70 p-6">
    <div class="text-violet-300 text-xl font-bold">PR終了</div>
    <div class="mt-7 text-lg leading-9">Cleanup で<br>プレビューフォルダ削除</div>
  </div>
</div>

<div class="mt-10 rounded-xl bg-slate-800/70 p-5 text-center text-xl">原稿1章直すたびに<span class="font-semibold text-white">全作品フルビルド</span>はしない。</div>

<!--
- 深掘り用。workflow の paths filter と build_inputs.py で、何が変わったかに応じて job の重さを変える。Drive 運用とセットで、コストと待ち時間を抑えている
-->

---
layout: center
class: text-center
title: まとめ
---

<div class="max-w-5xl mx-auto">
  <div class="text-sky-300 tracking-widest text-lg mb-8">まとめ</div>
  <h1 class="text-4xl leading-tight font-bold">AI小説をKindle端末で読みたくて、<br>Driveまでの「なんちゃってCI/CD」ができた</h1>
  <div class="mt-12 grid grid-cols-3 gap-5 text-left">
    <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div class="text-sky-300 font-bold text-xl">きっかけ</div>
      <div class="mt-4 text-lg leading-8">チャット読みから<br>端末で読む体験へ</div>
    </div>
    <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div class="text-emerald-300 font-bold text-xl">自動化</div>
      <div class="mt-4 text-lg leading-8">MD→EPUB<br>Lint・検証・Drive同期</div>
    </div>
    <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div class="text-violet-300 font-bold text-xl">線引き</div>
      <div class="mt-4 text-lg leading-8">Kindle追加は手動<br>整理は Drive で</div>
    </div>
  </div>
  <div class="mt-10 text-xl text-slate-200">形式は機械、内容は人間。<span class="font-semibold text-white">読むための仕組み</span>に割り切った個人プロジェクト。</div>
  <div class="mt-9 text-base text-slate-400">ありがとうございました</div>
</div>

<!--
- 振り返ると、AI小説をチャットで読んでいた → うまくできたのでKindle端末で読みたい → 自作EPUBを試す → 改稿が増えてGitHub ActionsとDrive APIまで、という流れ
- Kindleライブラリの自動追加は見送り、Driveを真の配信先にした。内容のAI校閲も試したが、今は形式のCI/CDが本体
-->
