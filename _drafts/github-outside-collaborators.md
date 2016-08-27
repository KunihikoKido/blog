# GitHub の Organazation に社外のユーザを招待する

最近社内のプロジェクトでも、社外の開発者と一緒に開発を進める機会が多くなっています。GitHub の Organization に組織外のユーザを招待するときはどうすれば良いでしょうか？

以下の２つの方法があります。

1. repository 毎にユーザを招待して管理する方法（Out side collaborator として招待）
2. Organization にユーザを招待して管理する方法

この２つの方法について紹介します。

## 1. repository 毎にユーザ招待して管理する方法

この方法でユーザを管理するには、各 repository の Settings > Collaborators & teams > Collaborators から社外のユーザを招待してください。

招待されたユーザは、 Organization には所属しません。招待された Repository のみ設定された権限でアクセスすることができます。

「 Organization 所属のメンバに repository の作成権限を与える」などの全体のポリシ変更を気にせずに、社外のユーザを招待して管理することができます。

チームで管理できないため、複数の repository への招待や、大勢のユーザを管理するのは難しい印象です。

この管理方法は、短期間で数名の社外ユーザとコラボレーションするときに適しています。


# 2. Organization にユーザを招待して管理する方法
一時的にではなく、プロジェクトの一員として社外のメンバーを管理するには、組織のメンバーと同様に Organization に招待して、チームのアクセス権限で管理すれば良いでしょう。

この選択肢を採用する場合は以下のことをチェックしてください。

* リポジトリ作成権限
* デフォルトのリポジトリ操作権限

## リポジトリの作成はできないように設定する
リポジトリを作成できる設定になっていると、メンバーであれば誰でも Private reository も作成できてしまいます。

## デフォルトのリポジトリ操作権限は None を設定する
メンバーのデフォルト権限には、以下の4つが用意されています。

* Admin
* Write
* Read
* None

この権限設定は、Organization 全体の設定のため、Read 権限が設定されていれば全てのリポジトリに対して参照（clone や pull）ができることになります。

必要なリポジトリ以外、その他は存在すら知らせたくない場合が多いと思いますので、None を設定しましょう。

> Choose the default permission level for organization members.

> Admin
Members will be able to clone, pull, push, and add new collaborators to all repositories.
> Write
Members will be able to clone, pull, and push all repositories.
 Read
Members will be able to clone and pull all repositories.
 None
Members will only be able to clone and pull public repositories. To give a member additional access, you’ll need to add them to teams or make them collaborators on individual repositories.

