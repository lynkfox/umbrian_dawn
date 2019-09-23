FROM centos:7

RUN yum update -y && \
    yum install -y epel-release

RUN yum install -y https://repo.percona.com/yum/percona-release-latest.noarch.rpm && \
    yum install -y Percona-Server-server-57 wget bzip2 && \
    yum -y update

COPY ./.docker/mysql/my.cnf /etc/my.cnf
# COPY ./.docker/mysql/setup.sql /root/setup.sql

RUN yum clean all
COPY --chown=mysql:mysql ./.docker/mysql/docker-entrypoint.sh /docker-entrypoint.sh
RUN mkdir -p /docker-entrypoint-initdb.d/ && \
    touch /docker-entrypoint-initdb.d/init.sql && \
    chmod 777 /docker-entrypoint-initdb.d && \
    chmod 777 /docker-entrypoint-initdb.d/init.sql && \
    chmod +x /docker-entrypoint.sh

# CMD mysqld --user=root --initialize-insecure && \
#    mysqld --user=root && tail -F /var/log/mysql/error.log

# CMD mysqld --user=root && tail -F /var/log/mysql/error.log

#ONBUILD mysql -u root < /root/setup.sql
USER mysql
