package com.backbase.config;

import lombok.Getter;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("dynamic-tests")
@Getter
public class DynamicTestProperties {

    private final Map<String, ConfigExpectations> expectations = new LinkedHashMap<>();
}
