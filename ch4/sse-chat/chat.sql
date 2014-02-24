
--
-- Table structure for table `log`
--

CREATE TABLE IF NOT EXISTS `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(32) COLLATE latin1_general_ci NOT NULL,
  `handle` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `message` varchar(1024) COLLATE latin1_general_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=79 ;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(32) COLLATE latin1_general_ci NOT NULL,
  `handle` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  `connected` datetime DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `connected` (`connected`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
