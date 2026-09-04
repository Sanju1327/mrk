package com.codecraft.domain.course;

import com.codecraft.domain.course.entity.*;
import com.codecraft.domain.course.repository.*;
import com.codecraft.domain.enrollment.repository.EnrollmentRepository;
import com.codecraft.domain.user.entity.Role;
import com.codecraft.domain.user.entity.User;
import com.codecraft.domain.user.repository.RoleRepository;
import com.codecraft.domain.user.repository.UserRepository;
import com.codecraft.security.JwtTokenProvider;
import com.codecraft.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CourseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testStudent;
    private String studentToken;
    private Course testCourse;
    private Topic testTopic;
    private Lesson testLesson;

    @BeforeEach
    void setUp() {
        enrollmentRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        lessonRepository.deleteAll();
        topicRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        Role studentRole = roleRepository.save(Role.builder().name("ROLE_STUDENT").build());

        testStudent = userRepository.save(User.builder()
                .username("courseuser")
                .email("courseuser@example.com")
                .fullName("Course Tester")
                .passwordHash(passwordEncoder.encode("password123"))
                .roles(Set.of(studentRole))
                .active(true)
                .build());

        UserPrincipal principal = UserPrincipal.create(
                testStudent.getId(),
                testStudent.getUsername(),
                testStudent.getEmail(),
                testStudent.getFullName(),
                testStudent.getPasswordHash(),
                List.of("ROLE_STUDENT"),
                true
        );
        studentToken = jwtTokenProvider.generateTokenFromUserPrincipal(principal);

        testCourse = courseRepository.save(Course.builder()
                .title("Java Mastery")
                .slug("java-mastery")
                .description("Master modern Java programming from scratch.")
                .level(CourseLevel.BEGINNER)
                .iconUrl("Coffee")
                .published(true)
                .displayOrder(1)
                .build());

        testTopic = topicRepository.save(Topic.builder()
                .course(testCourse)
                .title("Getting Started")
                .slug("getting-started")
                .description("First steps with Java")
                .displayOrder(1)
                .build());

        testLesson = lessonRepository.save(Lesson.builder()
                .topic(testTopic)
                .title("Hello World in Java")
                .slug("hello-world-java")
                .contentMarkdown("# Hello World\nWelcome to Java!")
                .estimatedMinutes(15)
                .displayOrder(1)
                .build());
    }

    @Test
    @DisplayName("GET /api/courses - should return published courses list")
    void shouldReturnPublishedCourses() throws Exception {
        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title").value("Java Mastery"))
                .andExpect(jsonPath("$.data[0].slug").value("java-mastery"));
    }

    @Test
    @DisplayName("GET /api/courses/slug/{slug} - should return course detail with syllabus")
    void shouldReturnCourseDetailBySlug() throws Exception {
        mockMvc.perform(get("/api/courses/slug/{slug}", "java-mastery"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Java Mastery"))
                .andExpect(jsonPath("$.data.totalLessons").value(1))
                .andExpect(jsonPath("$.data.isEnrolled").value(false))
                .andExpect(jsonPath("$.data.topics", hasSize(1)))
                .andExpect(jsonPath("$.data.topics[0].title").value("Getting Started"))
                .andExpect(jsonPath("$.data.topics[0].lessons", hasSize(1)))
                .andExpect(jsonPath("$.data.topics[0].lessons[0].title").value("Hello World in Java"));
    }

    @Test
    @DisplayName("POST /api/enrollments/{courseId} - should enroll user in course")
    void shouldEnrollInCourse() throws Exception {
        mockMvc.perform(post("/api/enrollments/{courseId}", testCourse.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.courseTitle").value("Java Mastery"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        // Verify duplicate enrollment rejection
        mockMvc.perform(post("/api/enrollments/{courseId}", testCourse.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"));
    }

    @Test
    @DisplayName("POST /api/courses/lessons/{lessonId}/complete - should mark lesson complete and track progress")
    void shouldCompleteLessonAndTrackProgress() throws Exception {
        // First enroll
        mockMvc.perform(post("/api/enrollments/{courseId}", testCourse.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated());

        // Mark lesson complete
        mockMvc.perform(post("/api/courses/lessons/{lessonId}/complete", testLesson.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Check course detail now reports 100% progress
        mockMvc.perform(get("/api/courses/slug/{slug}", "java-mastery")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isEnrolled").value(true))
                .andExpect(jsonPath("$.data.completedLessons").value(1))
                .andExpect(jsonPath("$.data.progressPercentage").value(100.0));
    }

    @Test
    @DisplayName("GET /api/enrollments/my - should return user's enrolled courses")
    void shouldReturnMyEnrollments() throws Exception {
        mockMvc.perform(post("/api/enrollments/{courseId}", testCourse.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/enrollments/my")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].courseTitle").value("Java Mastery"));
    }
}
