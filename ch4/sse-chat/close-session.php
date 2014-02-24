<?php
session_start();
include_once "credentials.php";
//remove it from the database
try {
    $dbh = new PDO($db, $user, $pass);
    $preparedStatement = $dbh->prepare('DELETE FROM `sessions`WHERE `session_id` =:sid');
    $preparedStatement->execute(array(':sid' => session_id()));
    $rows = $preparedStatement->fetchAll();
    $dbh = null;
} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "<br/>";
    die();
}

session_destroy();

//redirect to index.php
header("Location: index.php");
?>