# 各種テキストエディタを Git で使うための設定
コミットやタグのメッセージを編集する時に使うエディタは、ユーザがデフォルトで設定したエディタが使われます。デフォルトのエディタを設定していない場合は、vi がつかわれます。

デフォルトのエディタを設定するには、`core.editor` を設定します。例えば、デフォルトエディタに emacs を設定したい場合。ターミナルで以下のコマンドを実行します。

```
git config --global core.editor emacs
```

これで、Git が使用するエディタが Emacs に変更されます。


それでは、各種テキストエディタの設定の仕方を見ていきましょう。

## Atom エディタを使う場合

```
git config --global core.editor "atom --wait"
```

## Sublime Text エディタを使う場合

```
git config --global core.editor "subl -n -w"
```

## TextMate エディタを使う場合

```
git config --global core.editor "mate -w"
```

## CotEditor を使う場合

```
git config --global core.editor "cot -W"
```

## まとめ
いかがでしたでしょうか？
皆さんは何のエディタを使ってますか？
私は Atom を使っています。新し物好きなので、TextMate > Sublime Text > Atom とエディタを乗り換えてきました。Atom は GitHub との相性も良く、TextMate や Sublime Text にない少しグラフィカルなプラグインもあり気に入っています。プラグインがなければ、javascript / coffee で比較的簡単に自作することも可能です。是非使ってみてください。
