# Git rebase 覚書
新しく製品開発のプロジェクトがスタートし、開発体制や開発規約などチーム全体で標準化を進めています。
その中で、GitHub へプルリクエストする時は、rebase するルールがあります。
今までの開発で rebase は使ったことがなかったので、何が良いのか？また、その手順などまとめたいと思います。

**チームの運用方針**

* トピックブランチに統合ブランチの最新のコードを取り込むには rebase を使う
* 統合ブランチにトピックブランチを取り込むには、rebase してから non fast-forward で marge

## rebase せずにマージすると履歴が複雑になる
GitHub を使って開発を進めると、本流（以下 master）のブランチからバグフィックスや機能追加などのブランチを作成します。そのブランチを使って開発を進めていると、他のブランチのマージによって master の履歴が更新されていきます。そうすると、以下の図のように現在開発中のブランチは master の最新の更新内容が適用されていない状況になります。
![branch](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.001.png)

通常これを master にマージすると、最新の履歴も反映しつつ新しくマージされます。
![marge](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.002.png)

履歴をグラフィカルに表すと以下の図のように複雑になってしまいます。
![non rebase marge log history](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.003.png)

## rebase してマージすると履歴が単純になる
topic ブランチを 最新の master ブランチに rebase すると、以下の図のようになります。
（最新の master をベースに topic ブランチを作成してコードを更新した状態）
![rebase](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.004.png)

rebase した topic ブランチを master ブランチに marge (non fast-forward) すると、以下の図のようになります。
![non fast-forward marge ](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.005.png)

rebase & 統合ブランチへの marge を運用していくことで、履歴は以下の図のように単純化されます。
![rebase & non fast-forward log history](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.006.png)

ちなみに、fast-forward marge すると履歴は一本化されます。チームの運用方針は non fast-forward なので、上の図の履歴になります。（GitHub の Web 画面からプルリクエストを marge すると、non fast-forward marge になるそうです。）
![fast-forward marge](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.007.png)


## Atom エディタで rebase してみる
git コマンドを使って、rebase する手順は色々なサイトで解説されているので、Atom エディタの ``Git Plus`` プラグインを使って Rebase する手順を紹介します。（あまり、terminal の説明と変わらないかも）

### Git の操作に便利な Git Plus の紹介
``Git Plus`` は、cmd+shift+H でコマンドパレットを表示して、git の操作を選択して実行する機能を提供してくれるシンプルなプラグインです。
Git Plus のコマンドパレットに用意されていない、Git のコマンドは、コマンドパレットにある `Run` コマンドを実行すると、任意の Git コマンドを実行できます。
terminal に移動しないで操作できるので助かります。

![Git Plus](https://i.github-camo.com/78e2bafa5f9b3afdf47d7e02e3f949fea4801fc0/68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f616b6f6e77692f6769742d706c75732f6d61737465722f636f6d6d69742e676966)

### Git log の可視化に便利な、Git Log の紹介
``Git Log`` は、git の履歴をグラフィカルに表示してくれる便利なプラグインです。
コマンドパレットを表示して、`Git Log: Show` を実行すると、更新履歴ををグラフィカルに表示してくれます。

![Git Log](https://i.github-camo.com/fe46952e7b204bcc30575e592b23bd791e40b25d/68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f4e696b68696c4b616c6967652f6769742d6c6f672f6d61737465722f7265736f75726365732f6769742d6c6f672e676966)

### Git Plus で rebase 操作
以下の手順は、ローカルにチェックアウトしてあるトピックブランチで実行します。

1. Git Plus: Pull Using Rebase 実行
2. コンフリクトがある場合
  1. エディタでコンフリクトを修正
  2. Git Plus: Add 実行
  3. Git Plus: Run (rebase --continue) 実行
  4. (コンフリクトがなくなるまで繰り返す)
  5. (もし、途中で中止したい場合は Git Plus: Run (rebase --abort))
3. Git Plus: Run (push --force) 実行

rebase 後、リモートのトピックブランチに反映させるには、強制的に push する (push --force) 必要があります。
そのため、トピックブランチの修正は自分のみ変更しているという前提条件のもと行ってください。

もし、他人の変更を上書きしてしまわないようにしたい時は --force の代わりに --force-with-lease を使うと良いそうです。



## まとめ
今回チームの運用方針で、rebase を初めて使いました。
少し手順は増えますが、master にマージされる履歴は重なりがなく、単純になり気持ちが良いです。
