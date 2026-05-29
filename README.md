# KS Chem Lab

電子状態と DFT を学ぶための、ブラウザで動く小さなインタラクティブ教材です。

## 起動

```bash
node server.mjs
```

ブラウザで `http://127.0.0.1:4173` を開きます。

## GitHub Pages で公開

この教材は静的サイトなので、GitHub Pages の `Deploy from a branch` で公開できます。

1. GitHub で `ks-chem` などのリポジトリを作成します。
2. このディレクトリを Git リポジトリとして push します。
3. GitHub の `Settings` -> `Pages` を開きます。
4. `Build and deployment` を `Deploy from a branch` にします。
5. Branch は `main`、folder は `/ (root)` を選びます。

公開 URL は通常 `https://<username>.github.io/<repository>/` になります。

`index.html` は GitHub Pages のプロジェクトサイト配信に対応するため、`./src/app.js` と `./src/styles.css` の相対パスを使っています。

## 内容

- H2/STO-3G の最小基底モデル
- s 型 Gaussian primitive の重なり、運動エネルギー、核引力、電子反発積分
- Restricted Hartree-Fock の SCF 反復
- Unrestricted Hartree-Fock とスピン汚染 `<S^2>` の観察
- Kohn-Sham DFT の簡易 LDA 交換汎関数
- H2 の実験値ベンチマークとの比較
- SCF 履歴、行列、軸上の軌道と密度の可視化
- 別画面での水素原子 s/p/d/f 軌道ビジュアライザー
- 実装断片とドキュメントを画面内で確認できる学習パネル

この実装は教育用です。数値グリッドや汎関数は読みやすさを優先しており、実用品質の量子化学計算には PySCF、Psi4、ORCA、Q-Chem などの検証済みコードを使ってください。
