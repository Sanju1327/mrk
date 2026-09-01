package com.codecraft.domain.repository;

import com.codecraft.domain.achievement.entity.Achievement;
import com.codecraft.domain.achievement.entity.UserAchievement;
import com.codecraft.domain.achievement.repository.AchievementRepository;
import com.codecraft.domain.achievement.repository.UserAchievementRepository;
import com.codecraft.domain.course.entity.Course;
import com.codecraft.domain.course.entity.CourseLevel;
import com.codecraft.domain.course.entity.Lesson;
import com.codecraft.domain.course.entity.Topic;
import com.codecraft.domain.course.repository.CourseRepository;
import com.codecraft.domain.course.repository.LessonRepository;
import com.codecraft.domain.course.repository.TopicRepository;
import com.codecraft.domain.enrollment.entity.Enrollment;
import com.codecraft.domain.enrollment.entity.EnrollmentStatus;
import com.codecraft.domain.enrollment.repository.EnrollmentRepository;
import com.codecraft.domain.problem.entity.Difficulty;
import com.codecraft.domain.problem.entity.Problem;
import com.codecraft.domain.problem.entity.TestCase;
import com.codecraft.domain.problem.repository.ProblemRepository;
import com.codecraft.domain.problem.repository.TestCaseRepository;
import com.codecraft.domain.progress.entity.DailyActivity;
import com.codecraft.domain.progress.repository.DailyActivityRepository;
import com.codecraft.domain.quiz.entity.Question;
import com.codecraft.domain.quiz.entity.QuestionOption;
import com.codecraft.domain.quiz.entity.QuestionType;
import com.codecraft.domain.quiz.entity.Quiz;
import com.codecraft.domain.quiz.repository.QuestionRepository;
import com.codecraft.domain.quiz.repository.QuizRepository;
import com.codecraft.domain.submission.entity.Submission;
import com.codecraft.domain.submission.entity.SubmissionStatus;
import com.codecraft.domain.submission.repository.SubmissionRepository;
import com.codecraft.domain.user.entity.Role;
import com.codecraft.domain.user.entity.User;
import com.codecraft.domain.user.repository.RoleRepository;
import com.codecraft.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RepositoryIntegrationTests {

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private TopicRepository topicRepository;
    @Autowired private LessonRepository lessonRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private ProblemRepository problemRepository;
    @Autowired private TestCaseRepository testCaseRepository;
    @Autowired private SubmissionRepository submissionRepository;
    @Autowired private QuizRepository quizRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private AchievementRepository achievementRepository;
    @Autowired private UserAchievementRepository userAchievementRepository;
    @Autowired private DailyActivityRepository dailyActivityRepository;

    private User testUser;
    private Role studentRole;
    private Course testCourse;
    private Topic testTopic;
    private Problem testProblem;

    @BeforeEach
    void setUp() {
        studentRole = roleRepository.save(Role.builder()
                .name("ROLE_STUDENT")
                .description("Student Role")
                .build());

        testUser = userRepository.save(User.builder()
                .username("testcoder")
                .email("testcoder@example.com")
                .passwordHash("$2a$12$e0MYzXy8V0/8x8...")
                .fullName("Test Coder")
                .roles(Set.of(studentRole))
                .active(true)
                .build());

        testCourse = courseRepository.save(Course.builder()
                .title("Java Mastery")
                .slug("java-mastery")
                .description("Complete Java Course")
                .level(CourseLevel.BEGINNER)
                .published(true)
                .displayOrder(1)
                .build());

        testTopic = topicRepository.save(Topic.builder()
                .course(testCourse)
                .title("Basics")
                .slug("basics")
                .description("Basics topic")
                .displayOrder(1)
                .build());

        testProblem = problemRepository.save(Problem.builder()
                .topic(testTopic)
                .title("Two Sum")
                .slug("two-sum")
                .description("Find indices")
                .constraints("2 <= nums.length <= 1000")
                .difficulty(Difficulty.EASY)
                .supportedLanguage("JAVA")
                .timeLimitMs(2000)
                .memoryLimitMb(256)
                .starterCode("public class Solution {}")
                .explanation("Hash map approach")
                .dailyChallenge(true)
                .build());
    }

    @Test
    @DisplayName("Should find User by username and email")
    void shouldFindUserByUsernameAndEmail() {
        Optional<User> found = userRepository.findByUsername("testcoder");
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("testcoder@example.com");
        assertThat(found.get().getRoles()).hasSize(1);
    }

    @Test
    @DisplayName("Should create and query Enrollment")
    void shouldCreateAndQueryEnrollment() {
        Enrollment enrollment = enrollmentRepository.save(Enrollment.builder()
                .user(testUser)
                .course(testCourse)
                .status(EnrollmentStatus.ACTIVE)
                .build());

        assertThat(enrollment.getId()).isNotNull();
        assertThat(enrollmentRepository.existsByUserIdAndCourseId(testUser.getId(), testCourse.getId())).isTrue();
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(testUser.getId());
        assertThat(enrollments).hasSize(1);
    }

    @Test
    @DisplayName("Should save Problem with TestCases and filter by difficulty")
    void shouldSaveProblemWithTestCases() {
        TestCase sampleCase = testCaseRepository.save(TestCase.builder()
                .problem(testProblem)
                .inputData("[2,7,11,15]\n9")
                .expectedOutput("[0,1]")
                .sample(true)
                .hidden(false)
                .displayOrder(1)
                .build());

        assertThat(sampleCase.getId()).isNotNull();

        Page<Problem> easyProblems = problemRepository.findProblemsFiltered(null, Difficulty.EASY, null, PageRequest.of(0, 10));
        assertThat(easyProblems.getContent()).hasSize(1);

        Optional<Problem> daily = problemRepository.findFirstByDailyChallengeTrue();
        assertThat(daily).isPresent();
        assertThat(daily.get().getSlug()).isEqualTo("two-sum");
    }

    @Test
    @DisplayName("Should record Submissions and compute distinct accepted problem count")
    void shouldRecordSubmissionsAndComputeStats() {
        submissionRepository.save(Submission.builder()
                .user(testUser)
                .problem(testProblem)
                .language("JAVA")
                .sourceCode("class Solution {}")
                .status(SubmissionStatus.ACCEPTED)
                .executionTimeMs(45)
                .memoryUsedKb(15000)
                .passedTestCases(4)
                .totalTestCases(4)
                .build());

        long acceptedCount = submissionRepository.countDistinctAcceptedProblemsByUserId(testUser.getId());
        assertThat(acceptedCount).isEqualTo(1L);

        long easyAccepted = submissionRepository.countDistinctEasyAcceptedProblemsByUserId(testUser.getId());
        assertThat(easyAccepted).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should create Quiz with Question Options and evaluate Attempt")
    void shouldCreateQuizAndQuestions() {
        Quiz quiz = quizRepository.save(Quiz.builder()
                .topic(testTopic)
                .title("Java Basics Quiz")
                .timeLimitMinutes(15)
                .passingScorePercentage(70)
                .build());

        Question q1 = questionRepository.save(Question.builder()
                .quiz(quiz)
                .questionText("What does JVM stand for?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(10)
                .displayOrder(1)
                .build());

        assertThat(q1.getId()).isNotNull();
        assertThat(quiz.getId()).isNotNull();
    }

    @Test
    @DisplayName("Should record DailyActivity and UserAchievements")
    void shouldRecordDailyActivityAndAchievements() {
        DailyActivity activity = dailyActivityRepository.save(DailyActivity.builder()
                .user(testUser)
                .activityDate(LocalDate.now())
                .submissionCount(3)
                .lessonCount(1)
                .quizCount(1)
                .build());

        assertThat(activity.getId()).isNotNull();

        Achievement achievement = achievementRepository.save(Achievement.builder()
                .code("FIRST_JAVA_ACCEPTED")
                .title("First Code Accepted")
                .description("Solve your first problem")
                .points(50)
                .criteriaType("SUBMISSION_ACCEPTED")
                .criteriaThreshold(1)
                .build());

        UserAchievement userAchievement = userAchievementRepository.save(UserAchievement.builder()
                .user(testUser)
                .achievement(achievement)
                .build());

        assertThat(userAchievement.getId()).isNotNull();
        assertThat(userAchievementRepository.existsByUserIdAndAchievementId(testUser.getId(), achievement.getId())).isTrue();
    }
}
