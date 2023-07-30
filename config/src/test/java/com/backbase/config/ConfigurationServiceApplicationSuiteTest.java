package com.backbase.config;

import static java.util.Optional.ofNullable;
import static java.util.function.UnaryOperator.identity;
import static java.util.stream.Collectors.joining;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.junit.jupiter.api.DynamicContainer.dynamicContainer;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.core.exc.StreamWriteException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DatabindException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.function.UnaryOperator;
import java.util.stream.Stream;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.DynamicContainer;
import org.junit.jupiter.api.DynamicNode;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.function.Executable;
import org.opentest4j.TestAbortedException;

/**
 * Dynamic test suite for config server.
 *
 * This suite is not designated to verify the actual configurations, but the correct behaviour of the configuration
 * server with different profiles.
 *
 * It uses profile specific data from {@code application-test.yml} that contains several relevant expectations. The
 * suite uses the real configuration repositories and it's activated only when the repository credentials are provided
 * through environment variables.
 *
 * @author pappy
 *
 */
@EnabledIfEnvironmentVariable(named = "CONFIG_CREDENTIALS_PASSWORD", matches = ".+")
@EnabledIfEnvironmentVariable(named = "CONFIG_CREDENTIALS_USERNAME", matches = ".+")
@Slf4j
class ConfigurationServiceApplicationSuiteTest {

    /** Begin dynamic suite creation **/
    @TestFactory
    Stream<DynamicContainer> forEachProfile() throws IOException {
        final var root = Path.of("src/main/resources".replace('/', File.separatorChar));

        // for each application profile create a test container
        return Files.list(root)
            .map(file -> file.getFileName().toString())
            .map(name -> name.replace("application-", "").replace(".yaml", ""))
            .filter(name -> !Set.of("application", "template").contains(name))
            .filter(name -> name.length() > 0)
            .sorted()
            .map(this::buildContainers)
            .flatMap(identity());
    }

    private Stream<DynamicContainer> buildContainers(String profile) {
        return Stream.of(
            buildContainer(profile),
            buildContainer("beck", profile));
    }

    private DynamicContainer buildContainer(String... profiles) {
        final var dtbv = new DynamicTestBean[1];
        final Collection<Stream<? extends DynamicNode>> streams = new ArrayList<>();

        streams.add(singleTest("bootstrap", () -> {
            dtbv[0] = bootstrap(profiles);
        }));
        streams.add(singleTest("defaultRequest", () -> {
            verifyDefault(dtbv[0]);
        }));
        streams.add(singleTest("checkExpectations", () -> {
            assertThat(dtbv[0])
                .extracting(DynamicTestBean::getProperties)
                .extracting(DynamicTestProperties::getExpectations)
                .asInstanceOf(MAP)
                .as("expectations")
                .isNotEmpty(); // for each profile, one must provide a relevant expectation
        }));

        final Stream<DynamicTest> verifyExpectations = Stream.of(dtbv)
            .map(bean -> bean.getProperties())
            .map(dtp -> dtp.getExpectations().entrySet())
            .flatMap(Collection::stream)
            .map(exp -> singleTest(exp.getValue().nameOf(""), () -> verifyExpectations(dtbv[0], exp.getValue())))
            .flatMap(identity());

        streams.add(Stream.of(dynamicContainer("expectations", verifyExpectations)));

        final var contName = Stream.of(profiles).collect(joining(","));

        return dynamicContainer(contName, streams.stream().flatMap(UnaryOperator.identity()));
    }

    /**
     * Helper method to invoke an executable (a test).
     */
    private Stream<DynamicTest> singleTest(String name, Executable exe) {
        return Stream.of(dynamicTest(name, () -> {
            LOG.info(">>> {}", name);

            try {
                exe.execute();
            } catch (final InvocationTargetException e) {
                final var c = e.getCause();

                if (c instanceof TestAbortedException) {
                    LOG.info("{}", c.getMessage());

                    return;
                }

                throw e;
            } finally {
                LOG.info("<<< {}", name);
            }
        }));
    }


    private final ObjectMapper om = new ObjectMapper(new YAMLFactory());

    /**
     * Bootstrap the config server.
     */
    private DynamicTestBean bootstrap(String[] profiles) {
        final var profilesArg = Stream.of(profiles).collect(joining(","));

        return ConfigurationServiceApplication.run(
            "--spring.profiles.include=test," + profilesArg,
            "--spring.profiles.group.beck=composite,git",
            "--server.port=0")
            .getBean(DynamicTestBean.class);
    }

    /**
     * Request to root should fail with 404 - this is to verify that the config server is up.
     */
    private void verifyDefault(DynamicTestBean dtb) {
        dtb.getClient().get().exchange().expectStatus().isNotFound();
    }

    /**
     * Asserts expected / unexpected values for specific application, profile pair.
     */
    private void verifyExpectations(DynamicTestBean dtb, ConfigExpectations exp)
        throws StreamWriteException, DatabindException, IOException {
        final var env = getEnvironment(dtb, exp.getApplication(), exp.getProfiles());
        final var sa = new SoftAssertions();

        sa.assertThat(env.getPropertySources())
            .as("property source count")
            .hasSize(exp.getSourceCount());

        if (exp.getSourceCount() > 0) {
            final var pairs = exp.getExpectedValues().size() + exp.getUnexpectedKeys().size();

            sa.assertThat(pairs).as("expected or unexpected values size").isGreaterThan(0);

            final var cfg = getConfigurations(env);

            sa.assertThat(cfg).containsAllEntriesOf(exp.getExpectedValues());
            sa.assertThat(cfg).doesNotContainKeys(exp.getUnexpectedKeys().keySet().toArray(String[]::new));

            final var file = new File("target", exp.nameOf(".yaml"));

            file.getParentFile().mkdirs();

            this.om.writerFor(new TypeReference<Map<String, String>>() {}).writeValue(file, cfg);
        }

        sa.assertAll();
    }

    /**
     * Helper method to retrieve the configuration environment.
     */
    private org.springframework.cloud.config.environment.Environment getEnvironment(DynamicTestBean dtb,
        String application, String... profiles) {

        final var profilesParam = profiles != null && profiles.length > 0
            ? Stream.of(profiles).collect(joining(","))
            : "default";
        final var params = Map.of("application", application, "profiles", profilesParam);

        final var env = dtb.getClient().get()
            .uri("/{application}/{profiles}", params)
            .exchange()
            .expectStatus()
            .is2xxSuccessful()
            .expectBody(org.springframework.cloud.config.environment.Environment.class)
            .returnResult()
            .getResponseBody();

        return env;
    }

    /**
     * Get all configurations as a map - indexes are converted to properties.
     */
    private Map<String, String> getConfigurations(org.springframework.cloud.config.environment.Environment env) {
        final Map<String, String> cps = new TreeMap<>();

        final var sources = env.getPropertySources();

        for (var ix = sources.size(); ix > 0;) {
            final var gps = sources.get(--ix);

            gps.getSource().forEach((k, v) -> {
                cps.put(deIndex(k), ofNullable(v).map(Object::toString).orElse(null));
            });
        }

        return cps;
    }

    private static String deIndex(Object key) {
        return key.toString().replace("[", ".").replace("]", "");
    }
}
