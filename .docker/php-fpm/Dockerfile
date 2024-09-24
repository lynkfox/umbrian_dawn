FROM php:7.4.27-fpm-alpine

# Install the PHP extension installer
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions pdo_mysql gd intl

# Create session path for PHP
RUN mkdir -m 700 -p /var/lib/php/session && chown www-data /var/lib/php/session

# Copy PHP and PHP-FPM configuration files
COPY php.ini /usr/local/etc/php/php.ini
COPY www.conf /usr/local/etc/php-fpm.d/www.conf

# Install bash, curl, and cron
RUN apk update && apk add --no-cache bash curl openrc

# Copy PHP scripts into the container
COPY system_activity.cron.php /dir/to/
COPY account_update.cron.php /dir/to/

# Add crontab file and set up cron jobs
COPY crontab /etc/cron.d/my-cron
RUN chmod 0644 /etc/cron.d/my-cron && crontab /etc/cron.d/my-cron

# Ensure cron log file exists
RUN touch /var/log/cron.log

# Start cron and PHP-FPM with JSON CMD
CMD ["crond", "-f", "-l", "8"]
