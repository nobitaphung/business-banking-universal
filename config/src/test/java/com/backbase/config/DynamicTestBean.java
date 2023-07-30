package com.backbase.config;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import javax.annotation.PostConstruct;
import java.time.Duration;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.context.ServletWebServerInitializedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.zalando.logbook.Logbook;
import org.zalando.logbook.spring.webflux.LogbookExchangeFilterFunction;

/** Dynamic test support class */
@Component
@EnableConfigurationProperties(DynamicTestProperties.class)
@Slf4j
public class DynamicTestBean {

    @Getter
    private WebTestClient client;

    @Autowired
    private Logbook logbook;

    @Autowired
    private org.springframework.core.env.Environment env;

    @Autowired
    @Getter
    private DynamicTestProperties properties;

    @Getter
    private List<String> profiles;

    @EventListener
    public void onApplicationEvent(ServletWebServerInitializedEvent event) {
        final var port = event.getWebServer().getPort();

        this.client = WebTestClient.bindToServer()
            .baseUrl("http://localhost:" + port)
            .filter(new LogbookExchangeFilterFunction(this.logbook))
            .responseTimeout(Duration.ofHours(1))
            .build();

        LOG.info("port = {}", port);
    }

    @PostConstruct
    private void postConstruct() {
        this.profiles = List.of(this.env.getActiveProfiles());
    }
}
