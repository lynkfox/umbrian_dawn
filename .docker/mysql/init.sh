#!/bin/bash

# Create a single init.sql containing all the sql needed for setup of the two
# databases tripwire requires. Let the mysql container entrypoint execute the
# sql to keep things simple.
set -e
init_file="/docker-entrypoint-initdb.d/init.sql"

# Initial tripwire database creation

{
	echo "CREATE DATABASE IF NOT EXISTS $TRIPWIRE_DATABASE;"
	echo "USE $TRIPWIRE_DATABASE;"
	cat /tmp/tripwire.sql
} >> $init_file

# Checks last-modified date of fuzzworks eve dump

mkdir -p /tmp/"$SDE_DATABASE"/

remote_evedump_TS=$(curl -s -v -X HEAD https://www.fuzzwork.co.uk/dump/mysql-latest.tar.bz2 2>&1 | grep '^< last-modified:' | sed -e 's/< last-modified: //g')
remote_evedump_DO=$(date -d "$remote_evedump_TS")
current_date=$(date)

# Simple dateDiff functioin

datediff() {
    d1=$(date -d "$1" +%s)
    d2=$(date -d "$2" +%s)
    echo $(( (d1 - d2) / 86400 ))
}

# Downloads fuzzworks SDE and cat it to the init.sql

download_import_sde () {
	cd /tmp
	wget --no-verbose https://www.fuzzwork.co.uk/dump/mysql-latest.tar.bz2
	tar jxf mysql-latest.tar.bz2 -C /tmp/"$SDE_DATABASE" --strip-components 1
	{
		echo "CREATE DATABASE IF NOT EXISTS $SDE_DATABASE;"
		echo "USE $SDE_DATABASE;"
		cat /tmp/"$SDE_DATABASE"/*.sql
	} >> $init_file
	echo "Download and import succeeded"
} || {
	echo "SDE Download and Import failed"
}

# Stores the amount of time in days between now (UTC) and fuzzworks SDE

date_diff_evedump=$(datediff "$current_date" "$remote_evedump_DO")

if [ ! -d /var/lib/mysql/eve_dump ]; then
	echo "Eve SDE doesn't exist...Redownloading"
	download_import_sde
elif [ "$date_diff_evedump" -gt 90 ]; then
	echo "Eve SDE is older than 90 days...Redownloading"
	download_import_sde
elif [ -d /var/lib/mysql/eve_dump ]; then
	echo "Eve SDE exists and is not 90 days old..Skipping"
fi

if test -f mysql-latest.tar.bz2; then
	rm mysql-latest.tar.bz2
fi
