# Major Update: MouseUI @v1.0

遊戯王DBデッキサポートのMajor Update: v1.0は以下の内容を含みます。

各種機能のON/OFFやデフォルト設定は拡張機能のオプションページから切り替えることができます。

## MouseUI in Deck Edit mode

遊戯王DBのデッキ編集が、マスターデュエルのようにマウスを主体としたUI(MouseUI)で操作できるようになります。
今回のアップデート最大の目玉です。~~一つ一つカード名を入力させる、これまでのキーボードベースのUIはあまりに使いづらい……。~~

KeyboardUIとMouseUIの画面はボタンエリアの「Text/Image」で切り替えできます。

カードの移動はマウスのクリックで行います。

|From|Left|Wheel|Right|
|-|-|-|-|
|Main/Extra| Sideへ移動|  Main/Extraに追加| 削除(Tempへ)|
|Side| Main/EXtraへ移動|  Sideに追加| 削除(Tempへ)|
|Temp|Main/Extraへ移動|Main/Extraに追加|Sideに移動|
|Search|Main/Extraへ追加|カードのページを開く|Sideへ追加|

クリックモードの切り替えは「Click|MOVE CARD/open url」で行います。
「OPEN URL」モードではLeft/Wheelクリックでカードのページを開きます。(カードの移動は行いません。)

「Reload & Sort」ボタンをクリックすれば、textの情報に合わせてデッキ画像をリセットします。

## Search Area in Deck Edit mode

MouseUI画面の導入に合わせて、カード検索エリアをデッキ編集画面に追加しました。
公式のカード検索画面と同様のUI・機能を備えています。

クリックでの移動に関する説明は、前節の表に含んでいます。
「Search SHOW/HIDE」ボタンで検索エリアの表示・非表示を切り替えます。

## Side Change in Deck View Mode

デッキ閲覧画面でサイドチェンジを模したカード移動が行えます。
検索エリアがないことを除き、デッキ編集画面のMouseUIモードの表と同様です。

「SideChange|L:Reset/R:OFF」をLeftクリックすれば、初期のカード順にResetされます。
「SideChange|L:Reset/R:OFF」をRightクリックすれば、SideChangeモードのON/OFFが切り替わります。
SideChangeモードがOFFのとき、Left/Wheelクリックでカードのページを開きます。(カードの移動は行いません。)

「Sort & Save」をクリックでソートした上で保存します。

## Left/Wheel/Right Click

各種機能のクリックで「Left/Wheel/Right」を区別できるようになりました。
「L:AAA/R:BBB」という表示のボタンは、LeftクリックでAAA、RightクリックでBBBを行います。

## Renewal DB

公式DBの情報をDB作成のベースにしました。
DBの不具合がさらに減ります。

## Improve Sort and Shuffle

SortとShuffleボタンを一体化し、Main/Extra/Sideごとに設置しました。
「L:Shuffle/R:Sort」をLeft/RightクリックでShuffle/Sortを行います。

## Guess Deck Category and Name

デッキカテゴリの推測機能が追加されました。これはカード名と枚数のみで判定されます。
デッキ編集画面Headerカテゴリ欄の「guess」ボタンのクリック、またはデッキコピー時に実行されます。
その際、デッキ名が空であれば推測されたカテゴリをつなげた文字列がデッキ名として入力されます。

