package com.codecraft;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CodeCraftApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodeCraftApplication.class, args);
    }
}
