<?php

/*
 * Handles post request with two fields, and saves to a file.
 * Goes with emotion wheel stuff - used if not running via nodejs
 *
 * Andy Brown.
 * andy.brown01@bbc.co.uk
 * BBC R&D. May 2015
 *
 */

$data = $_POST['result'].": ";
$raw = $_POST['selection']."\n";
$taps = $_POST['all']."\n";
/*
$date = $_POST['date'];
$e1 = $_POST['emotion1'];
$e1 = $_POST['emotion2'];
$e1 = $_POST['emotion3'];
$store_string = $date.": ".$e1.";".$e2.";".$e3."\n"
*/
file_put_contents("./emotions.txt", $data.$raw."; ".$taps, FILE_APPEND);
?>
