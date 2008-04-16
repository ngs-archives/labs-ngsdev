<?
$cname = "";
$rootdir = "http://ngsdev.org/";
$subtitle = array("MTCategoryNameSpliter");
$header =<<<EOM
<style type="text/css">
<!--
	div.exsample blockquote {
		margin:10px;
		padding:5px 10px;
		background:#ddd;
		color:#666;
		border:1px solid #999;
	}
	
	div.exsample blockquote strong { color:#f33; }
	
	div.exsample h5 { margin:10px 0 0 10px; }
	
	code,code a,code strong {
		font-size:9pt;
		font-family:Courier New, Courier, mono;
	}
	code { margin:0 2px; }
	
	h4 { margin:20px 0 0 0; }
	
-->
</style>

EOM;


include "http://ngsdev.org/inc/common.h";
?>


<div class="content">
<h3>MTCategoryNameSpliter</h3>

<p>
	<a href="http://www.sixapart.jp/">sixapart社</a>のウェブログ・システム、<a href="http://www.sixapart.jp/movabletype/">MovableType</a>のプラグイン。
</p>

<p>
	Version 1.0 <strong><a href="CtgnameSpliter.zip" title="download">DOWNLOAD</a></strong>(0.8KB)
</p>
<p>
	本来、日本語のカテゴリー名を作成すると、カテゴリーアーカイブのディレクトリ名が、<br />
	cat1、cat2、cat3・・・cat[n] となります。<br />
	そんなのだしてたら、mtで作ってるの丸出しで格好悪いから、任意のディレクトリ名が付けられたらな、<br />
	ということで、一夜漬けで勉強し、作りました。
</p>
<p>
	徐々にバージョンアップするかもですが、しないかもです。<br />
	僕個人での目的は事足りているので。<br />
	アイディアや要望などございましたら、<a href="http://blog.ngsdev.org/archives/2006/05/ctgname-spliter.php">ブログ</a>とかに適当にコメント下さい。
</p>

<h4>使用方法</h4>

<p>
	日本語カテゴリー名の前に、<br />
	半角文字の欧文表記をコロン(:)、もしくは任意の半角記号などで区切ることにより、 <br />
	数文字から先頭の半角文字のカテゴリーアーカイブをMovableTypeに生成させます。<br />
	（デフォルトで半角コロンです。）
</p>

<div class="exsample">
	<h5>例</h5>
	<blockquote>
		技術 → http://blog.domain.com/cat1/
	</blockquote>
	<blockquote>
		tech:技術 → http://blog.domain.com/tech/
	</blockquote>
</div>

<p>
	本来使用している<code><a href="http://www.sixapart.jp/movabletype/manual/mtmanual_tags.html#item_MTCategoryLabel">MTCategoryLabel</a></code>
	の変わりに、<code>MTSplitCategoryName</code>とかきます。
</p>

<div class="exsample">
	<h5>例</h5>
	<blockquote><code>
&lt;MTEntryCategories glue=&quot;, &quot;&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&lt;a href=&quot;&lt;$MTCategoryArchiveLink$&gt;&quot;&gt;<strong>&lt;$MTSplitCategoryName$&gt;</strong>&lt;/a&gt;<br />
&lt;/MTEntryCategories&gt;
	</code></blockquote>
</div>

<p>
	<code>MTArchiveTitle</code>タグに対応しました。<br />
	（テンプレート - アーカイブテンプレート - カテゴリーテンプレートにおいて。）
</p>
<div class="exsample">
	<h5>例（2006.05.29追記）</h5>
	<blockquote><code>
		&lt;title&gt;&lt;$MTBlogName encode_html=&quot;1&quot;$&gt;: <strong>&lt;$MTSplitCategoryName$&gt;</strong> アーカイブ&lt;/title&gt;
	</code></blockquote>
</div>
<p>
	<code>&lt;$MTSplitBeforeGlue$&gt;</code>で、半角コロン以前の文字を出力できます。

</p>
<p>
	もし、コロン以外の文字を使いたいときは、<code>MTSplitCategoryName</code>に<code>glue</code>属性を追加してください。<br />
	//アンダースコアや半角スペースなどを使用すると、<br />
	//ディレクトリ名の最後にアンダースコアが付いてしまうので、お勧めできません。
</p>

<h4>インストール方法</h4>
<p>
	mtを置いてるディレクトリのpluginsに入れるだけ。<br />
	詳しくは : <a href="http://www.sixapart.jp/movabletype/manual/mtmanual_programmatic.html#plugins">http://www.sixapart.jp/movabletype/manual/mtmanual_programmatic.html#plugins</a>
</p>



<br />
</div>

<? include "http://ngsdev.org/inc/common.f" ?>