# 各種テキストエディタを Git で使うための設定
コミットやタグのメッセージを編集する時に使うエディタは、ユーザがデフォルトで設定したエディタが使われます。デフォルトのエディタを設定していない場合は、vi がつかわれます。

デフォルトのエディタを設定するには、'core.editor' を設定します。

'''
git config --global core.editor emacs
'''

これで、Git が使用するエディタが Emacs に変更されます。

エディタによっては、固有のオプションをしてする


それでは、各種テキストエディタの設定の仕方を見ていきましょう。

## Atom エディタを使う場合

git config --global core.editor "atom --wait"


## Sublime Text エディタを使う場合


git config --global core.editor "subl -n -w"


## TextMate エディタを使う場合

git config --global core.editor "mate -w"


## CotEditor を使う場合

git config --global core.editor "cot -w"



