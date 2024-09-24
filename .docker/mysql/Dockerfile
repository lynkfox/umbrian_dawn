FROM centos:7

# Update repository URL. 
COPY ./.docker/mysql/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo

# Update package and install MySQL.
RUN yum update -y && \
    yum install -y epel-release

# Install Percona MySQL 5.7.
# RUN yum install -y https://repo.percona.com/yum/percona-release-latest.noarch.rpm && \
#     yum install -y Percona-Server-server-57 wget bzip2 && \
#     yum -y update

# Install MySQL repository
RUN yum localinstall -y https://dev.mysql.com/get/mysql57-community-release-el7-11.noarch.rpm

# Import the GPG key for MySQL
RUN rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-mysql

# Install MySQL server
RUN yum install -y mysql-community-server

# Create the mysql group and user if they don't exist
RUN getent group mysql || groupadd mysql && \
    getent passwd mysql || useradd -g mysql mysql

# Check that the user was created successfully
RUN id mysql  # This command is for debugging; you can check logs to see the output

# Copy MySQL configuration file.
COPY ./.docker/mysql/my.cnf /etc/my.cnf

# Clean and run.
RUN yum clean all
COPY --chown=mysql:mysql ./.docker/mysql/docker-entrypoint.sh /docker-entrypoint.sh
COPY --chown=mysql:mysql ./.docker/mysql/init.sh /tmp/init.sh

# Create init directory and permissions
RUN mkdir -p /docker-entrypoint-initdb.d/ && \
    touch /docker-entrypoint-initdb.d/init.sql && \
    chmod 777 /docker-entrypoint-initdb.d && \
    chmod 777 /docker-entrypoint-initdb.d/init.sql && \
    chmod +x /docker-entrypoint.sh && \
    chmod +x /tmp/init.sh

# Switch to mysql user
USER mysql

# Set the entrypoint for the MySQL server
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["mysqld"]
