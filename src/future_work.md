# Future Work

## Deck Header
### カテゴリ推測: 2

spanにボタン追加
optionで推測の強さ
(該当カードの枚数)

タグも同様に?
(融合シンクロ、属性、種族はあり?)
トーナメント・大会用は手札誘発の枚数など?

## copyでデッキ名自動入力: 3
わざわざいれるのは面倒
neuronだと自動で入力済みなのに

## default lang: 2

```html
<ul>
    <li><a href="javascript:ChangeLanguage('ja')" class="current">日本語</a></li>
    <li><a href="javascript:ChangeLanguage('en')" >English</a></li>
    <li><a href="javascript:ChangeLanguage('de')" >Deutsch</a></li>
    <li><a href="javascript:ChangeLanguage('fr')" >Fran&ccedil;ais</a></li>
    <li><a href="javascript:ChangeLanguage('it')" >Italiano</a></li>
    <li><a href="javascript:ChangeLanguage('es')" >Espa&ntilde;ol</a></li>
    <li><a href="javascript:ChangeLanguage('pt')" >Portugues</a></li>
    <li><a href="javascript:ChangeLanguage('ko')" >한글</a></li>
</ul>
```

```js
["ja", "en", "de", "fr", "it", "es", "pt", "ko"]
```

## カードDB取得: 0

cgid, id把握済みなら遊戯王DBから取得するように (自動で全言語に対応)
-> https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=2&sort=21&rp=200&page=1&stype=1&othercon=2&page=1
-> カード検索のちにリンク変更で上限を自由にできる


ocg-card.comは誤入力の可能性があるので注意
(cgid, idはrest api優先)

## デッキ全体の整理
タグ付け、フォルダ分け
絞り込んで表示、表示順変更

タグ付けの場合、保存先は要検討
-> localにbackupもあり

## termTables: 3
term tablesをobtainDFDeckの属性、種族などに反映(自動で全言語に対応)

## デッキ編集画面 GUI: 100
マスターデュエルのように画像で編集できるように

検索で結果が画像+テキストで表示(検索dialogを利用)
検索条件も利用(裏で検索結果を取得すればいいか)

### デッキ切り替え: 5
デッキ名で切り替え
サムネも表示