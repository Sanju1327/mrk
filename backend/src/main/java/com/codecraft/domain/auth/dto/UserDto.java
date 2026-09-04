package com.codecraft.domain.auth.dto;

import com.codecraft.domain.user.entity.Role;
import com.codecraft.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String githubUsername;
    private String bio;
    private List<String> roles;
    private LocalDateTime createdAt;

    public static UserDto fromEntity(User user) {
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .toList();

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .githubUsername(user.getGithubUsername())
                .bio(user.getBio())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
