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
?><!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SSE Chat</title>
    <link href="style.css" rel="stylesheet">
    <script src="jquery-1.8.2.min.js"></script>
    <script src="raf-polyfill.js"></script>
    <script>var uid='<?php print session_id(); ?>';</script>
    <script src="chat.js"></script>
</head>
<body>
<?php
//if session exists, do chat
try {
    $checkOnline = $dbh->prepare('SELECT * FROM sessions WHERE session_id = :sid');
    $checkOnline->execute(array(':sid' => session_id()));
    $rows = $checkOnline->fetchAll();
} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "<br/>";
    die();
}
if (count($rows) > 0) {
?>
<strong>Online now:</strong><ul class="chatusers">
<?php
print_user_list($dbh);
?>
</ul>
<div class="chatwindow">
<ul class="chatlog">
<?php
print_chat_log($dbh);
?>
</ul>
</div>
<form id="chat" class="chatform" method="post" action="add-chat.php">
    <label for="message">Share your thoughts:</label>
    <input name="message" id="message" maxlength="512" autofocus>
    <input type="submit" value="Chat">
</form>
<?php
//else, ask for username
} else {
?>
<form id="login" class="chatlogin" method="post" action="add-session.php">
    <label for="handle">Enter your handle:</label>
    <input name="handle" id="handle" maxlength="127" autofocus>
    <input type="submit" value="Join">
</form>
<?php
}
?>
</body>
</html><?php
$dbh = null;
?>