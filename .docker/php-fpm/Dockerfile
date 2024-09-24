FROM php:7.4.27-fpm-alpine

ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions pdo_mysql gd intl

RUN mkdir -m 700 -p /var/lib/php/session && chown www-data /var/lib/php/session

COPY php.ini /usr/local/etc/php/php.ini
COPY www.conf /usr/local/etc/php-fpm.d/www.conf

RUN apk add --no-cache bash curl crond

COPY system_activity.cron.php /dir/to/
COPY account_update.cron.php /dir/to/

COPY crontab /etc/cron.d/my-cron
RUN chmod 0644 /etc/cron.d/my-cron && crontab /etc/cron.d/my-cron

RUN touch /var/log/cron.log

CMD crond && tail -f /var/log/cron.log
