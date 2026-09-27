package com.codecraft.domain.course.service;

import com.codecraft.domain.course.entity.Course;
import com.codecraft.domain.user.entity.User;

/**
 * Shared ownership/role checks for course content. Always evaluated server-side.
 */
public final class CourseAccess {

    public static final String ROLE_SUPER_ADMIN = "ROLE_SUPER_ADMIN";
    public static final String ROLE_TEACHER = "ROLE_TEACHER";

    private CourseAccess() {
    }

    public static boolean hasRole(User user, String role) {
        return user != null && user.getRoles() != null
                && user.getRoles().stream().anyMatch(r -> role.equals(r.getName()));
    }

    public static boolean isSuperAdmin(User user) {
        return hasRole(user, ROLE_SUPER_ADMIN);
    }

    public static boolean isTeacher(User user) {
        return hasRole(user, ROLE_TEACHER);
    }

    /** Super admins may manage any course; teachers only the courses assigned to them. */
    public static boolean isOwnerOrAdmin(Course course, User user) {
        if (user == null || course == null) return false;
        if (isSuperAdmin(user)) return true;
        return course.getTeacher() != null && course.getTeacher().getId().equals(user.getId());
    }
}
