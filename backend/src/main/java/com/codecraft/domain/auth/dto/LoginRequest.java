package com.codecraft.domain.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Username or email is required")
    @JsonAlias({"email", "username", "usernameOrEmail"})
    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    private String password;

    public void setEmail(String email) {
        if (this.usernameOrEmail == null || this.usernameOrEmail.trim().isEmpty()) {
            this.usernameOrEmail = email;
        }
    }

    public void setUsername(String username) {
        if (this.usernameOrEmail == null || this.usernameOrEmail.trim().isEmpty()) {
            this.usernameOrEmail = username;
        }
    }

    public String getUsernameOrEmail() {
        return usernameOrEmail != null ? usernameOrEmail.trim() : null;
    }
}
