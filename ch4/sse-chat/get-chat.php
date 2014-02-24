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
print_chat_log($dbh);
?>