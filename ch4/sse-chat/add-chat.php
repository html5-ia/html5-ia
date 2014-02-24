<?php
session_start();
include_once "credentials.php";
try {
    $dbh = new PDO($db, $user, $pass);
    $preparedStatement = $dbh->prepare('INSERT INTO `log`(`session_id`,`handle`, `message`, `timestamp`) VALUES (:sid,(SELECT `handle` FROM `sessions` WHERE `session_id` = :sid),:message,NOW())');
    $preparedStatement->execute(array(':sid' => session_id(), ':message' => $_POST["message"] ));
    $rows = $preparedStatement->fetchAll();
    $dbh = null;
    header("HTTP/1.1 200 OK");
    echo "OK";
    ob_flush();
    flush();
    die();
} catch (PDOException $e) {
    header("HTTP/1.1 500 Internal Server Error");
    print "Error!: " . $e->getMessage() . "<br/>";
    die();
}
?>