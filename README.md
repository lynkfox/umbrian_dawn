# README

Some things have changed, read carefully - also Docker has some isssues yet, recommend not using it or helping solve the issues.

The landing page twitter feed won't work since the one I used requires a private token, I will have to find a new way to do it later.


### Tripwire - EVE Online wormhole mapping web tool

- MIT license
- [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### Setup guide for Linux

Requirements:

- PHP7+ (older requires polyfill for public/login.php as documented in that file)
- php-mbstring must be installed
- MySQL (or some flavor of MySQL - needed because database EVENTS)
- A my.cnf MySQL config file example is located in `.docker/mysql/my.cnf`
- The `sql_mode` and `event_scheduler` my.cnf lines are important, make sure you have them in your my.cnf file & reboot MySQL
- CRON or some other scheduler to execute PHP scripts

Setup:

- Create a `tripwire` database using the export located in `.docker/mysql/tripwire.sql`
- Create an EVE dump database, define it's name later in `config.php`. Download from: https://www.fuzzwork.co.uk/dump/ To download the latest use the following link: https://www.fuzzwork.co.uk/dump/mysql-latest.tar.bz2
- Clone the Tripwire repo to where you are going to serve to the public OR manually download repo and copy files yourself
- Copy `db.inc.example.php` to `db.inc.php` - modify file per your setup
- Copy `config.example.php` to `config.php` - modify file per your setup
- Create an EVE developer application via https://developers.eveonline.com/applications
- EVE SSO `Callback URL` should be: `https://your-domain.com/index.php?mode=sso`
- Use the following scopes:
  esi-location.read_location.v1
  esi-location.read_ship_type.v1
  esi-ui.open_window.v1
  esi-ui.write_waypoint.v1
  esi-characters.read_corporation_roles.v1
  esi-location.read_online.v1
  esi-characters.read_titles.v1
  esi-search.search_structures.v1
- Settings go in the `config.php` file
- Modify your web server to serve Tripwire from the `tripwire/public` folder so the files like `config.php` and `db.inc.php` are not accessible via URL
- Setup a CRON or schedule for `system_activity.cron.php` to run at the top of every hour. CRON: `0 * * * * php /dir/to/system_activity.cron.php`
- Setup a CRON or schedule for `account_update.cron.php` to run every 3 minutes or however often you want to check for corporation changes. CRON: `*/3 * * * * php /dir/to/account_update.cron.php`
- If you are using SELinux: Tripwire needs access to the 'cache' directory inside the deployment directory, usually /var/www/tripwire. You need to make this a write-access directory via SELinux labelling: `semanage fcontext -a -t httpd_sys_rw_content_t "/var/www/tripwire/cache(/.*)?"` - then relabel the directory `restorecon -R -v /var/www/tripwire`

### Setup guide for Docker

- Install Docker for your environment: https://www.docker.com/
- Copy db.inc.example.php to db.inc.php
- Copy config.example.php to config.php
- Modify the constants with your own settings in both files

**db.inc.php**

- `host=` should be `mysql`
- `dbname=` matches TRIPWIRE_DATABASE in docker-compose

**config.php**

- `EVE_DUMP` matches SDE_DATABASE in docker-compose

**SSO**

- Create an EVE developer application via https://developers.eveonline.com/applications
- EVE SSO `Callback URL` should be: `https://your-domain.com/index.php?mode=sso`
- Use the following scopes:
  - esi-location.read_location.v1
  - esi-location.read_ship_type.v1
  - esi-ui.open_window.v1
  - esi-ui.write_waypoint.v1
  - esi-characters.read_corporation_roles.v1
  - esi-location.read_online.v1
  - esi-characters.read_titles.v1
  - esi-search.search_structures.v1

**General**

To start the stack run `docker-compose up -d --build`
To view logs in real time run `docker-compose logs -f`

_TODO: Use either a docker cron or use docker exec commands in crontab_

- Setup a CRON or schedule for `system_activity.cron.php` to run at the top of every hour. CRON: `0 * * * * php /dir/to/system_activity.cron.php`
- Setup a CRON or schedule for `account_update.cron.php` to run every 3 minutes or however often you want to check for corporation changes. CRON: `*/3 * * * * php /dir/to/account_update.cron.php`

### Contribution guidelines

- Base off of production
- Look over issues, branches or get with me to ensure it isn't already being worked on

### Who do I talk to?

- Josh Glassmaker AKA Daimian Mercer (Project lead / Creator)
- Tripwire Public in-game channel
- Discord: https://discord.gg/xjFkJAx
