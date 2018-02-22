# README #

This is just some basic info on the source atm - more details on how to setup and the database still to come.

### Tripwire - EVE Online wormhole mapping web tool ###

* [Tripwire database](https://bitbucket.org/daimian/tripwire/downloads/tripwire.sql)
* [EVE_API database](https://bitbucket.org/daimian/tripwire/downloads/eve_api.sql)
* MIT license
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Setup PHP PDO compatible database (MySQL) -- make sure event scheduler is on
* Import blank Tripwire database and EVE_API database (links above)
* EVE_API database needs 1 row inserted before use:
* `INSERT INTO eve_api.cacheTime (type, time) VALUES ('activity', now())`
* Create a `db.inc.php` file in root from `db.inc.example`
* Setup `tools/api_pull.php` under a 3 minute cron
* More to come...

### Setup guide for Docker ###

Note: MySQL is setup without a root password - make sure you have a secure host machine.

* Install Docker for your environment: https://www.docker.com/
* Run `docker-compose up --build`
* Copy db.inc.example.php to db.inc.php
* Modify the constants with your own settings
* MySQL connection settings will be the server `mysql` with the user `root` with an empty password
* Create a new table for the EVE dump, specify the name in `db.inc.php` for `EVE_DUMP`
* Import using the dump downloaded from: https://www.fuzzwork.co.uk/dump/ To download the latest use the following link: https://www.fuzzwork.co.uk/dump/mysql-latest.tar.bz2
* Create a new table for the EVE API data, use the name `eve_api`
* Import using the dump located in this repo under /.docker/mysql/eve_api_dump.sql
* Create a new table for the actual Tripwire data, use the name `tripwire`
* Import using the dump located in this repo under /.docker/mysql/tripwire_dump.sql

### Contribution guidelines ###

* Base off of master
* Look over issues, branches or get with me to ensure it isn't already being worked on

### Who do I talk to? ###

* Josh Glassmaker AKA Daimian Mercer (Project lead / Creator)
* Tripwire Public in-game channel
