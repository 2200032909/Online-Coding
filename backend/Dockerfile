# Dockerfile
FROM openjdk:11

WORKDIR /app

# Create script to run the code
COPY runner.sh /runner.sh
RUN chmod +x /runner.sh

ENTRYPOINT ["/runner.sh"]
