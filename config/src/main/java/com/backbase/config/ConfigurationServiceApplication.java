package com.backbase.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;
import org.springframework.context.ConfigurableApplicationContext;

@EnableConfigServer
@SpringBootApplication
public class ConfigurationServiceApplication {

    public static void main(String[] args) {
        run(args);
    }

    protected static ConfigurableApplicationContext run(String... args) {
        return SpringApplication.run(ConfigurationServiceApplication.class, args);
    }
}