# Git Rebase for Atom 覚書
新しく製品開発のプロジェクトがスタートし、開発体制や開発規約などチーム全体で標準化を進めています。
その中で、GitHub へプルリクエストする時は、Rebase するルールがあります。
今までの開発で Rebase は使ったことがなかったので、何が良いのか？また、その手順などまとめたいと思います。

Terminal は好きですが、今回は Atom エディタでその手順を紹介します。

## Rebase って？

![branch](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.001.png)

![rebase](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.002.png)

![non fast-forward marge](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.003.png)


![fast-forward marge](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.004.png)

![rebase log history](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.005.png)

![non rebase log history](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/git-rebase.006.png)
