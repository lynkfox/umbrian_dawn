FROM centos:7

# Update repository URL.
COPY ./.docker/mysql/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo

# Update package and install MySQL.
RUN yum update -y && \
    yum install -y epel-release

# Install Percona MySQL 5.7.
RUN yum install -y https://repo.percona.com/yum/percona-release-latest.noarch.rpm && \
    yum install -y Percona-Server-server-57 wget bzip2 && \
    yum -y update

# Create mysql user and group if they don't exist
RUN getent group mysql || groupadd mysql && \
    getent passwd mysql || useradd -g mysql mysql

# Ensure that mysqld is available
RUN which mysqld || echo "mysqld not found"

# Copy MySQL configuration file.
COPY ./.docker/mysql/my.cnf /etc/my.cnf

# Clean up and set permissions
RUN yum clean all && \
    chmod +x /docker-entrypoint.sh && \
    chmod +x /tmp/init.sh

# Copy entrypoint scripts
COPY --chown=mysql:mysql ./.docker/mysql/docker-entrypoint.sh /docker-entrypoint.sh
COPY --chown=mysql:mysql ./.docker/mysql/init.sh /tmp/init.sh

# Create initialization directory and permissions
RUN mkdir -p /docker-entrypoint-initdb.d/ && \
    touch /docker-entrypoint-initdb.d/init.sql && \
    chmod 777 /docker-entrypoint-initdb.d && \
    chmod 777 /docker-entrypoint-initdb.d/init.sql

# Set the user to mysql
USER mysql

# Set the entrypoint for the MySQL server
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["mysqld", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]
