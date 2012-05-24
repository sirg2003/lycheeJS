<?php

$data = substr($_POST['data'], 22);
$data = str_replace(' ','+',$data);
$data = base64_decode($data);

$img = imagecreatefromstring($data);


if ($img) {

	imagealphablending($img, false);
	imagesavealpha($img, true);

	imagepng(
		$img,
		'./export/'.$_POST['id'].'.png',
		0
	);

}

?>
