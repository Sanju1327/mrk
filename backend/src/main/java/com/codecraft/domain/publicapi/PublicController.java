package com.codecraft.domain.publicapi;

import com.codecraft.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Public", description = "Public platform metadata and landing endpoints")
public class PublicController {

    @GetMapping("/landing")
    @Operation(summary = "Get public landing page overview and platform metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLandingOverview() {
        Map<String, Object> landingData = Map.of(
                "platformName", "CodeCraft",
                "tagline", "Master Computer Science & Code Execution in an Enterprise Sandbox",
                "version", "1.0.0-V1",
                "supportedLanguages", new String[]{"JAVA"},
                "status", "ONLINE"
        );
        return ResponseEntity.ok(ApiResponse.ok("CodeCraft Public API v1.0", landingData));
    }
}
