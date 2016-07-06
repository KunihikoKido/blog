# Git rebase for Atom 覚書
新しく製品開発のプロジェクトがスタートし、開発体制や開発規約などチーム全体で標準化を進めています。
その中で、GitHub へプルリクエストする時は、rebase するルールがあります。
今までの開発で rebase は使ったことがなかったので、何が良いのか？また、その手順などまとめたいと思います。

Terminal は好きですが、今回は Atom エディタでその手順を紹介します。

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
