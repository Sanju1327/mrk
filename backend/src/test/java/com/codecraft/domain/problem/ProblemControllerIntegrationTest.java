package com.codecraft.domain.problem;

import com.codecraft.domain.course.entity.Course;
import com.codecraft.domain.course.entity.CourseLevel;
import com.codecraft.domain.course.entity.Topic;
import com.codecraft.domain.course.repository.CourseRepository;
import com.codecraft.domain.course.repository.TopicRepository;
import com.codecraft.domain.problem.entity.Difficulty;
import com.codecraft.domain.problem.entity.Problem;
import com.codecraft.domain.problem.entity.TestCase;
import com.codecraft.domain.problem.repository.ProblemRepository;
import com.codecraft.domain.problem.repository.TestCaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProblemControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    private Problem twoSum;
    private Problem palindrome;

    @BeforeEach
    void setUp() {
        testCaseRepository.deleteAll();
        problemRepository.deleteAll();
        topicRepository.deleteAll();
        courseRepository.deleteAll();

        Course course = courseRepository.save(Course.builder()
                .title("Java Algorithms")
                .slug("java-algorithms")
                .description("Data structures & algorithms")
                .level(CourseLevel.INTERMEDIATE)
                .published(true)
                .displayOrder(1)
                .build());

        Topic topic = topicRepository.save(Topic.builder()
                .course(course)
                .title("Arrays & Strings")
                .slug("arrays-strings")
                .description("Array manipulation")
                .displayOrder(1)
                .build());

        twoSum = problemRepository.save(Problem.builder()
                .topic(topic)
                .title("Two Sum")
                .slug("two-sum")
                .description("Find two numbers that add up to target.")
                .constraints("2 <= nums.length <= 10^4")
                .difficulty(Difficulty.EASY)
                .supportedLanguage("JAVA")
                .timeLimitMs(2000)
                .memoryLimitMb(256)
                .starterCode("class Solution { public int[] twoSum(int[] nums, int target) { return new int[0]; } }")
                .dailyChallenge(true)
                .build());

        testCaseRepository.save(TestCase.builder()
                .problem(twoSum)
                .inputData("[2,7,11,15]\n9")
                .expectedOutput("[0,1]")
                .explanation("nums[0] + nums[1] = 9")
                .sample(true)
                .hidden(false)
                .displayOrder(1)
                .build());

        palindrome = problemRepository.save(Problem.builder()
                .topic(topic)
                .title("Valid Palindrome")
                .slug("valid-palindrome")
                .description("Check if string is palindrome.")
                .constraints("1 <= s.length <= 2 * 10^5")
                .difficulty(Difficulty.EASY)
                .supportedLanguage("JAVA")
                .timeLimitMs(2000)
                .memoryLimitMb(256)
                .starterCode("class Solution { public boolean isPalindrome(String s) { return false; } }")
                .dailyChallenge(false)
                .build());
    }

    @Test
    @DisplayName("GET /api/problems - should return paginated list of problems")
    void shouldReturnPaginatedProblems() throws Exception {
        mockMvc.perform(get("/api/problems"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.page.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/problems/daily - should return problem of the day")
    void shouldReturnDailyProblem() throws Exception {
        mockMvc.perform(get("/api/problems/daily"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Two Sum"))
                .andExpect(jsonPath("$.data.isDailyChallenge").value(true))
                .andExpect(jsonPath("$.data.sampleTestCases", hasSize(1)))
                .andExpect(jsonPath("$.data.sampleTestCases[0].inputData").value("[2,7,11,15]\n9"));
    }

    @Test
    @DisplayName("GET /api/problems/slug/{slug} - should return problem detail with sample test cases")
    void shouldReturnProblemDetailBySlug() throws Exception {
        mockMvc.perform(get("/api/problems/slug/{slug}", "two-sum"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Two Sum"))
                .andExpect(jsonPath("$.data.difficulty").value("EASY"))
                .andExpect(jsonPath("$.data.starterCode", containsString("class Solution")))
                .andExpect(jsonPath("$.data.sampleTestCases", hasSize(1)));
    }

    @Test
    @DisplayName("GET /api/problems?search=Palindrome - should filter problems by title")
    void shouldFilterProblemsBySearch() throws Exception {
        mockMvc.perform(get("/api/problems").param("search", "Palindrome"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].title").value("Valid Palindrome"));
    }
}
