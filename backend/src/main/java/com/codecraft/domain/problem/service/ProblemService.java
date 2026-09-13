package com.codecraft.domain.problem.service;

import com.codecraft.common.exception.ResourceNotFoundException;
import com.codecraft.domain.problem.dto.ProblemDetailDto;
import com.codecraft.domain.problem.dto.ProblemSummaryDto;
import com.codecraft.domain.problem.dto.TestCaseDto;
import com.codecraft.domain.problem.entity.Difficulty;
import com.codecraft.domain.problem.entity.Problem;
import com.codecraft.domain.problem.entity.TestCase;
import com.codecraft.domain.problem.repository.ProblemRepository;
import com.codecraft.domain.problem.repository.TestCaseRepository;
import com.codecraft.domain.submission.entity.Submission;
import com.codecraft.domain.submission.entity.SubmissionStatus;
import com.codecraft.domain.submission.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final SubmissionRepository submissionRepository;
    private final com.codecraft.domain.course.repository.TopicRepository topicRepository;
    private final com.codecraft.domain.course.repository.CourseRepository courseRepository;
    private final com.codecraft.domain.course.repository.LessonRepository lessonRepository;

    @Transactional(readOnly = true)
    public Page<ProblemSummaryDto> getProblems(
            Long topicId,
            Difficulty difficulty,
            String search,
            Pageable pageable,
            Long userId
    ) {
        Page<Problem> problems = problemRepository.findProblemsFiltered(topicId, difficulty, search, pageable);
        return problems.map(problem -> {
            boolean solved = false;
            if (userId != null) {
                solved = submissionRepository.existsByUserIdAndProblemIdAndStatus(
                        userId, problem.getId(), SubmissionStatus.ACCEPTED
                );
            }
            double acceptanceRate = calculateAcceptanceRate(problem);
            long totalSubmissions = problem.getSubmissions() != null ? problem.getSubmissions().size() : 0;
            return ProblemSummaryDto.fromEntity(problem, acceptanceRate, totalSubmissions, solved);
        });
    }

    @Transactional(readOnly = true)
    public ProblemDetailDto getProblemBySlug(String slug, Long userId) {
        Problem problem = problemRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "slug", slug));
        return buildProblemDetail(problem, userId);
    }

    @Transactional(readOnly = true)
    public ProblemDetailDto getProblemById(Long id, Long userId) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", id));
        return buildProblemDetail(problem, userId);
    }

    @Transactional(readOnly = true)
    public ProblemDetailDto getDailyChallenge(Long userId) {
        Problem problem = problemRepository.findFirstByDailyChallengeTrue()
                .orElseGet(() -> problemRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Problem of the Day not configured", "daily", true)));
        return buildProblemDetail(problem, userId);
    }

    private ProblemDetailDto buildProblemDetail(Problem problem, Long userId) {
        boolean solved = false;
        if (userId != null) {
            solved = submissionRepository.existsByUserIdAndProblemIdAndStatus(
                    userId, problem.getId(), SubmissionStatus.ACCEPTED
            );
        }

        List<TestCase> sampleTestCases = testCaseRepository.findByProblemIdAndSampleTrueOrderByDisplayOrderAsc(problem.getId());
        List<TestCaseDto> sampleTestCaseDtos = sampleTestCases.stream()
                .map(TestCaseDto::fromEntity)
                .collect(Collectors.toList());

        double acceptanceRate = calculateAcceptanceRate(problem);
        long totalSubmissions = problem.getSubmissions() != null ? problem.getSubmissions().size() : 0;

        return ProblemDetailDto.fromEntity(
                problem,
                solved,
                acceptanceRate,
                totalSubmissions,
                sampleTestCaseDtos
        );
    }

    @Transactional
    public ProblemDetailDto createProblem(com.codecraft.domain.problem.dto.CreateProblemRequest request, com.codecraft.domain.user.entity.User teacher) {
        if (problemRepository.existsBySlug(request.getSlug())) {
            throw new com.codecraft.common.exception.ConflictException("Problem slug '" + request.getSlug() + "' is already in use");
        }

        com.codecraft.domain.course.entity.Topic topic = null;
        if (request.getTopicId() != null) {
            topic = topicRepository.findById(request.getTopicId()).orElse(null);
        }

        com.codecraft.domain.course.entity.Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId()).orElse(null);
        }

        com.codecraft.domain.course.entity.Lesson lesson = null;
        if (request.getLessonId() != null) {
            lesson = lessonRepository.findById(request.getLessonId()).orElse(null);
        }

        Problem problem = Problem.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .description(request.getDescription())
                .constraints(request.getConstraints())
                .difficulty(request.getDifficulty())
                .supportedLanguage(request.getSupportedLanguage())
                .timeLimitMs(request.getTimeLimitMs())
                .memoryLimitMb(request.getMemoryLimitMb())
                .starterCode(request.getStarterCode())
                .explanation(request.getExplanation())
                .topic(topic)
                .course(course)
                .lesson(lesson)
                .createdBy(teacher)
                .published(true)
                .build();

        if (request.getTestCases() != null) {
            int order = 1;
            for (com.codecraft.domain.problem.dto.CreateProblemRequest.TestCaseInputDto tcDto : request.getTestCases()) {
                TestCase tc = TestCase.builder()
                        .problem(problem)
                        .inputData(tcDto.getInputData())
                        .expectedOutput(tcDto.getExpectedOutput())
                        .sample(tcDto.isSample())
                        .hidden(tcDto.isHidden())
                        .explanation(tcDto.getExplanation())
                        .displayOrder(tcDto.getDisplayOrder() > 0 ? tcDto.getDisplayOrder() : order++)
                        .build();
                problem.getTestCases().add(tc);
            }
        }

        Problem saved = problemRepository.save(problem);
        log.info("Teacher {} created problem: {} (id={})", teacher.getUsername(), saved.getTitle(), saved.getId());
        return buildProblemDetail(saved, teacher.getId());
    }

    private double calculateAcceptanceRate(Problem problem) {
        if (problem.getSubmissions() == null || problem.getSubmissions().isEmpty()) {
            return 0.0;
        }
        long accepted = problem.getSubmissions().stream()
                .filter(s -> s.getStatus() == SubmissionStatus.ACCEPTED)
                .count();
        double rate = (double) accepted / problem.getSubmissions().size() * 100.0;
        return Math.round(rate * 10.0) / 10.0;
    }
}
