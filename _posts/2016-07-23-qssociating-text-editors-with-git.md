# 各種テキストエディタを Git で使うための設定 (Atom/Sublime Text/TextMate/CotEditor)
コミットやタグのメッセージを編集する時に使うエディタは、ユーザがデフォルトで設定したエディタが使われます。デフォルトのエディタを設定していない場合は、vi がつかわれます。

デフォルトのエディタを設定するには、`core.editor` を設定します。例えば、デフォルトエディタに emacs を設定したい場合。ターミナルで以下のコマンドを実行します。

```
git config --global core.editor emacs
```

これで、Git が使用するエディタが Emacs に変更されます。


それでは、各種テキストエディタの設定の仕方を見ていきましょう。

## Atom エディタを使う場合の設定
Atom Git で使用するには、まず[ここ](https://atom.io/) から Atom をダウンロードしてインストールしてください。

次に、以下のコマンドで Git の設定をして完了です。

```
git config --global core.editor "atom --wait"
```

## Sublime Text エディタを使う場合の設定
Sublime Text を Git で使用するには、まず[ここ](http://www.sublimetext.com/3) から Sublime Text をダウンロードしてください。(まだ Sublime Text 3 は beta 扱いですが、今から使うなら 3 で良いと思います)

次に[ここ](http://www.sublimetext.com/docs/3/osx_command_line.html) を参考にターミナルから Sublime Text (`subl`) を呼び出せるようにセットアップします。

準備ができたら以下のコマンドで Git の設定をして完了です。

```
git config --global core.editor "subl -n -w"
```

※ `-n` は new window で開くオプション

## TextMate エディタを使う場合
TextMate を Git で使用するには、まず[ここ](http://macromates.com/download)から TextMate をダウンロードしてください。(知らない間に Version 2.0 がリリースされてる)

次に[ここ](http://blog.macromates.com/2005/textmate-shell-utility-tmmate/) を参考にターミナルから TextMate (`mate`) を呼び出せるようにセットアップします。

準備ができたら以下のコマンドで、Git の設定をして完了です。

```
git config --global core.editor "mate -w"
```

## CotEditor を使う場合の設定
CotEditor を Git で使用するには、まず[ App Store ](https://itunes.apple.com/jp/app/coteditor/id1024640650?mt=12)からインストールしてください。

次に CotEditor を起動し、ヘルプの「 cot コマンド 」を参考にターミナルから CotEditor (`cot`) を呼び出せるようにセットアップします。

準備ができたら以下のコマンドで、Git の設定をして完了です。

```
git config --global core.editor "cot -n -w"
```

※ `-n` は new window で開くオプション

## まとめ
いかがでしたでしょうか？
皆さんは何のエディタを使ってますか？
私は Atom を使っています。新し物好きなので、TextMate → Sublime Text → Atom と流行りのエディタを乗り換えてきました。Atom は GitHub との相性も良く、TextMate や Sublime Text にない少しグラフィカルなプラグインも気に入っています。プラグインがなければ、JavaScript/CoffeeScript で比較的簡単に自作することも可能です。是非使ってみてください。
