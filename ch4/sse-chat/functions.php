<?php
function print_user_list($dbh) {
    //fetch users from sessions
    try {
        $getOnline = $dbh->prepare('SELECT * FROM sessions');
        $getOnline->execute();
        $rows = $getOnline->fetchAll();
        foreach($rows as $row) {
            print "<li>".$row['handle']."</li>";
        }
    } catch (PDOException $e) {
        print "Error!: " . $e->getMessage() . "<br/>";
        die();
    }
}
function is_logged_on($dbh, $uid) {
    $ret = false;
    try {
        $getOnline = $dbh->prepare('SELECT * FROM sessions WHERE `session_id` = :uid');
        $getOnline->execute(array(':uid' => $uid));
        $rows = $getOnline->fetchAll();
        foreach($rows as $row) {
            if ($row['session_id'] == $uid) {
                $ret = true;
            }
        }
        return $ret;
    } catch (PDOException $e) {
        print "Error!: " . $e->getMessage() . "<br/>";
        die();
    }
    
}
function print_chat_log($dbh) {
    //fetch last twenty chats
    try {
        $getChat = $dbh->prepare('SELECT `timestamp`,`handle`, `message` FROM `log` ORDER BY `timestamp` DESC LIMIT 20');
        $getChat->execute();
        $rows = $getChat->fetchAll();
        $out = "";
        setlocale(LC_ALL, 'en_GB');
        date_default_timezone_set('Europe/London');
        foreach($rows as $row) {
            $out = "<li><time datetime=\"".$row['timestamp']."\">".strftime("%H:%M",strtotime($row['timestamp']))."</time> <b>".$row['handle']."</b> <span>".$row['message']."</span></li>".$out;
        }
        print $out;
    } catch (PDOException $e) {
        print "Error!: " . $e->getMessage() . "<br/>";
        die();
    }
}
function print_chat_log_since($dbh,$lastupdate) {
    //fetch last twenty chats
    try {
        $getChat = $dbh->prepare('SELECT `timestamp`,`handle`, `message` FROM `log` WHERE `timestamp` > :date ORDER BY `timestamp` DESC LIMIT 20');
        $getChat->execute(array(':date' => $date));
        $rows = $getChat->fetchAll();
        $out = "";
        setlocale(LC_ALL, 'en_GB');
        date_default_timezone_set('Europe/London');
        foreach($rows as $row) {
            $out = "<li><time datetime=\"".$row['timestamp']."\">".strftime("%H:%M",strtotime($row['timestamp']))."</time> <b>".$row['handle']."</b> <span>".$row['message']."</span></li>".$out;
        }
        return $out;
    } catch (PDOException $e) {
        print "Error!: " . $e->getMessage() . "<br/>";
        die();
    }
}

?>