# Backbase 6 Foundation

The Backbase Foundation services are required to run Banking capabilities on your local machine and is composed of the following services:

- Eureka Service Registry
- Edge Service Router

## Docker Compose for MySQL, ActiveMQ and Reverse Proxy (NGINX)

Run `docker-compose up -d` to start MySQL, Active MQ and NGINX.


## Running Backbase 6 Foundation Services

```bash
mvn blade:run
```

## Running Edge Service

You may deploy the Edge Service by executing the following:
```bash
mvn -pl edge package -Prun-edge
```

Alternatively, depending on the operating system, you may run either
```bash
bash run_edge.sh
```
or
```bash
run_edge.cmd
```


### Native MySQL

* Install MySQL 5.7.x or higher
* Configure MySQL according to settings stored in `mysql/config/my.cnf`


### Native ActiveMQ

Install [Active MQ 5.17](https://activemq.apache.org/activemq-5017002-release)