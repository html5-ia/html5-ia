<?php
session_start();
include_once "credentials.php";
include_once "functions.php";
try {
    $dbh = new PDO($db, $user, $pass);
} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "<br/>";
    die();
}
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache'); //to prevent caching of event data

$uid = $_REQUEST["uid"];
setlocale(LC_ALL, 'en_GB');
date_default_timezone_set('Europe/London');
$lastUpdate = time();
$startedAt = time();
//Note: IRL, should lock this down by IP address too
session_write_close();
while (is_logged_on($dbh, $uid)) {
    //IRL you'd use the same functions as being used to build the initial page here
    $getChat = $dbh->prepare('SELECT `timestamp`,`handle`, `message` FROM `log` WHERE `timestamp` >= :lastupdate ORDER BY `timestamp`');
    $getChat->execute(array(':lastupdate' => strftime("%Y-%m-%d %H:%M:%S", $lastUpdate) ));
    $rows = $getChat->fetchAll();
    foreach($rows as $row) {
        echo "event: message\n";
        echo "data: <time datetime=\"".$row['timestamp']."\">".strftime("%H:%M",strtotime($row['timestamp']))."</time> <b>".$row['handle']."</b> <span>".$row['message']."</span>\n\n";
        ob_flush();
        flush();
    }
    //The client should reconnect when terminated, most servers are configured to limit script execution time to between 30-90 seconds
    if ((time() - $startedAt) > 60) {
        session_start();
        die();
    }
    $lastUpdate = time();
    //MySQL timestamp fields do not store to millisecond accuracy, so we sleep for 2 seconds
    //IRL, don't use timestamps
    sleep(2);
}
?>