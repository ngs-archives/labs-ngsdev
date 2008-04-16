<?php
require_once 'Zend/Loader.php';
Zend_Loader::loadClass('Zend_Gdata_YouTube');

$yt = new Zend_Gdata_YouTube();
$query = $yt->newVideoQuery();
$query->videoQuery = mb_convert_encoding($_GET['query'], "UTF-8", "Shift_JIS");
$query->startIndex = 0;
$query->maxResults = 10;
$query->orderBy = 'viewCount';

//echo $query->queryUrl . "<br/>\n";
$videoFeed = $yt->getVideoFeed($query); 
echo "<?xml version=\"1.0\" encoding=\"Shift_JIS\"?><videos>";
$num = 1;
foreach ($videoFeed as $videoEntry) {
	$title = $videoEntry->mediaGroup->title->text;
	$title = mb_convert_encoding($title, "Shift_JIS", "UTF-8");
	$title = rawurlencode($title);
	$description = $videoEntry->mediaGroup->description->text;
	$description = mb_convert_encoding($description, "Shift_JIS", "UTF-8");
	$id = strrchr($videoEntry->getId()->text, "/");
	$id = substr($id, 1);
	$fp = fopen('http://youtube.com/watch?v=' . $id, 'r');
	for($line_num=1; !feof($fp);$line_num++) {
		$line = fgets($fp);
		if (ereg('.*(swfArgs).*', $line)) {
			$temp = split("{|,", $line);
			$base = $temp[1];
			$base = strrchr($base, " ");
			$base = substr($base, 2, (strlen($base)-3));
		
			$t = $temp[5];
			$t = strrchr($t, " ");
			$t = substr($t, 2, (strlen($t)-3));
		
			$url = $base . "get_video?video_id=" . $id. "&t=" . $t;
			echo "<video id='$num' video_path='$url' video_name='$title'/>";
			$num ++;
			break;
		}
	}
}
echo "</videos>";
?>