package com.codecraft.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Sandbox sandbox = new Sandbox();

    @Getter
    @Setter
    public static class Jwt {
        private String secret = "9a7f3c2e1d8b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5";
        private long expirationMs = 86400000;
        private String issuer = "CodeCraftAuth";
    }

    @Getter
    @Setter
    public static class Cors {
        private List<String> allowedOrigins = new ArrayList<>(List.of("http://localhost:5173", "http://localhost:80", "http://localhost:3000"));
    }

    @Getter
    @Setter
    public static class Sandbox {
        private String provider = "LOCAL";
        private int defaultTimeoutMs = 2000;
        private int defaultMemoryLimitMb = 256;
    }
}
