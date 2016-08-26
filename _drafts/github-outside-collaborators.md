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
