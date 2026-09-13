package com.codecraft.domain.admin.service;

import com.codecraft.common.exception.ConflictException;
import com.codecraft.common.exception.ResourceNotFoundException;
import com.codecraft.domain.admin.dto.AdminStatsDto;
import com.codecraft.domain.admin.dto.CreateTeacherRequest;
import com.codecraft.domain.admin.dto.TeacherDto;
import com.codecraft.domain.course.entity.CourseStatus;
import com.codecraft.domain.course.repository.CourseRepository;
import com.codecraft.domain.enrollment.repository.EnrollmentRepository;
import com.codecraft.domain.problem.repository.ProblemRepository;
import com.codecraft.domain.quiz.repository.QuizRepository;
import com.codecraft.domain.user.entity.Role;
import com.codecraft.domain.user.entity.User;
import com.codecraft.domain.user.repository.RoleRepository;
import com.codecraft.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminTeacherService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuizRepository quizRepository;
    private final ProblemRepository problemRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<TeacherDto> getAllTeachers() {
        List<User> teachers = userRepository.findByRolesName("ROLE_TEACHER");
        return teachers.stream().map(this::mapToTeacherDto).toList();
    }

    @Transactional
    public TeacherDto createTeacher(CreateTeacherRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username '" + request.getUsername() + "' is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email '" + request.getEmail() + "' is already registered");
        }

        Role teacherRole = roleRepository.findByName("ROLE_TEACHER")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name("ROLE_TEACHER")
                        .description("Course creator and curriculum instructor")
                        .build()));

        Set<Role> roles = new HashSet<>();
        roles.add(teacherRole);

        User teacher = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .active(true)
                .bio(request.getBio())
                .build();

        User savedTeacher = userRepository.save(teacher);
        log.info("New teacher account created by Super Admin: {} (id={})", savedTeacher.getUsername(), savedTeacher.getId());

        return mapToTeacherDto(savedTeacher);
    }

    @Transactional
    public TeacherDto toggleTeacherStatus(Long teacherId, boolean active) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + teacherId));

        boolean isTeacher = teacher.getRoles().stream().anyMatch(r -> "ROLE_TEACHER".equals(r.getName()));
        if (!isTeacher) {
            throw new ResourceNotFoundException("User with id: " + teacherId + " is not a teacher");
        }

        teacher.setActive(active);
        User updated = userRepository.save(teacher);
        log.info("Teacher {} (id={}) active status updated to: {}", updated.getUsername(), updated.getId(), active);

        return mapToTeacherDto(updated);
    }

    @Transactional
    public void resetTeacherPassword(Long teacherId, String newPassword) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + teacherId));

        teacher.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(teacher);
        log.info("Password reset for teacher: {} (id={})", teacher.getUsername(), teacher.getId());
    }

    @Transactional(readOnly = true)
    public AdminStatsDto getPlatformStats() {
        long totalStudents = userRepository.countByRolesName("ROLE_STUDENT");
        long totalTeachers = userRepository.countByRolesName("ROLE_TEACHER");
        long totalCourses = courseRepository.count();
        long publishedCourses = courseRepository.countByStatus(CourseStatus.PUBLISHED);
        long draftCourses = courseRepository.countByStatus(CourseStatus.DRAFT);
        long totalQuizzes = quizRepository.count();
        long totalProblems = problemRepository.count();

        return AdminStatsDto.builder()
                .totalStudents(totalStudents)
                .totalTeachers(totalTeachers)
                .totalCourses(totalCourses)
                .publishedCourses(publishedCourses)
                .draftCourses(draftCourses)
                .totalQuizzes(totalQuizzes)
                .totalProblems(totalProblems)
                .build();
    }

    private TeacherDto mapToTeacherDto(User user) {
        long courseCount = courseRepository.findByTeacherIdOrderByDisplayOrderAsc(user.getId()).size();
        return TeacherDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .active(user.isActive())
                .courseCount(courseCount)
                .studentCount(0) // computed from enrollments when active
                .createdAt(user.getCreatedAt())
                .build();
    }
}
