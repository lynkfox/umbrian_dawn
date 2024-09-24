FROM mysql:8.0


# Copy MySQL configuration file.
COPY ./.docker/mysql/my.cnf /etc/my.cnf
COPY ../tmp /tmp/"$SDE_DATABASE"

COPY --chown=mysql:mysql ./.docker/mysql/docker-entrypoint.sh /docker-entrypoint.sh
COPY --chown=mysql:mysql ./.docker/mysql/init.sh /tmp/init.sh

# Create init directory and permissions
RUN mkdir -p /docker-entrypoint-initdb.d/ && \
    touch /docker-entrypoint-initdb.d/init.sql
    # chmod 777 /docker-entrypoint-initdb.d && \
    # chmod 777 /docker-entrypoint-initdb.d/init.sql && \
    # chmod +x /docker-entrypoint.sh && \
    # chmod +x /tmp/init.sh

# Switch to mysql user
USER mysql

# Set the entrypoint for the MySQL server
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["mysql"]
