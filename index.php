<?php
echo header("Expires: Tue, 01 Jan 1971 00:00:00 GMT");
echo header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
echo header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
echo header("Cache-Control: post-check=0, pre-check=0", false);
echo header("Pragma: no-cache");
echo header("Connection: close");

$path = $_SERVER["REQUEST_URI"];
$index = file_get_contents('index.html');

if($path == "/rennovet/"){
    echo str_replace('{{title}}',"Home | Rennovet",file_get_contents('index.html'));
}else{
    echo str_replace('{{title}}',"Not Found | Rennovet",file_get_contents('index.html'));
}


?>