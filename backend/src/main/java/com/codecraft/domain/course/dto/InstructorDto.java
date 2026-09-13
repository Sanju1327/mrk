package com.codecraft.domain.course.dto;

import com.codecraft.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorDto {
    private Long id;
    private String fullName;
    private String avatarUrl;
    private String bio;

    public static InstructorDto fromUser(User user) {
        if (user == null) {
            return null;
        }
        return InstructorDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .build();
    }
}
