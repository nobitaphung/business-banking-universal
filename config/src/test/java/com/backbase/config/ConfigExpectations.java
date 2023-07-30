package com.backbase.config;

import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.joining;
import lombok.Getter;
import lombok.Setter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Stream;

@Getter
@Setter
public class ConfigExpectations {
    private String application;
    private String[] profiles;

    private int sourceCount;
    private Map<String, String> expectedValues = new LinkedHashMap<>();
    private Map<String, String> unexpectedKeys = new LinkedHashMap<>();

    public String nameOf(String suffix) {
        return Stream.concat(
            Stream.of(this.application),
            ofNullable(this.profiles)
                .map(Stream::of).orElseGet(Stream::empty))
            .collect(joining("-", "", suffix));
    }
}
