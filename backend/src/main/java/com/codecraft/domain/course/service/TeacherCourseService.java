package com.codecraft.domain.course.service;

import com.codecraft.common.exception.BadRequestException;
import com.codecraft.common.exception.ConflictException;
import com.codecraft.common.exception.ResourceNotFoundException;
import com.codecraft.domain.course.dto.*;
import com.codecraft.domain.course.entity.*;
import com.codecraft.domain.course.repository.*;
import com.codecraft.domain.enrollment.repository.EnrollmentRepository;
import com.codecraft.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherCourseService {

    private final CourseRepository courseRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final ContentBlockRepository contentBlockRepository;
    private final CourseResourceRepository courseResourceRepository;
    private final EnrollmentRepository enrollmentRepository;

    private boolean isOwnerOrAdmin(Course course, User user) {
        if (user == null) return false;
        boolean isSuperAdmin = user.getRoles().stream()
                .anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()));
        if (isSuperAdmin) return true;
        return course.getTeacher() != null && course.getTeacher().getId().equals(user.getId());
    }

    private void checkCourseAccess(Course course, User user) {
        if (!isOwnerOrAdmin(course, user)) {
            throw new AccessDeniedException("You do not have permission to modify this course");
        }
    }

    @Transactional(readOnly = true)
    public List<CourseSummaryDto> getTeacherCourses(User user) {
        boolean isSuperAdmin = user.getRoles().stream()
                .anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()));

        List<Course> courses = isSuperAdmin ?
                courseRepository.findAll() :
                courseRepository.findByTeacherIdOrderByDisplayOrderAsc(user.getId());

        return courses.stream().map(c -> {
            int topicCount = c.getTopics().size();
            int lessonCount = c.getTopics().stream().mapToInt(t -> t.getLessons().size()).sum();
            int estimatedHours = c.getTopics().stream()
                    .flatMap(t -> t.getLessons().stream())
                    .mapToInt(Lesson::getEstimatedMinutes)
                    .sum() / 60;
            return CourseSummaryDto.fromEntity(c, topicCount, lessonCount, Math.max(1, estimatedHours));
        }).toList();
    }

    @Transactional
    public CourseDetailDto createCourse(CreateCourseRequest request, User teacher) {
        if (courseRepository.existsBySlug(request.getSlug())) {
            throw new ConflictException("Course slug '" + request.getSlug() + "' is already in use");
        }

        Course course = Course.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .description(request.getDescription())
                .category(request.getCategory())
                .level(request.getLevel() != null ? request.getLevel() : CourseLevel.BEGINNER)
                .estimatedDuration(request.getEstimatedDuration() != null ? request.getEstimatedDuration() : "4 weeks")
                .iconUrl(request.getIconUrl())
                .teacher(teacher)
                .status(CourseStatus.DRAFT)
                .published(false)
                .displayOrder(0)
                .build();

        Course saved = courseRepository.save(course);
        log.info("Teacher {} created course draft: {} (id={})", teacher.getUsername(), saved.getTitle(), saved.getId());

        return CourseDetailDto.fromEntity(saved, 0, 0, false, 0, 0.0, new ArrayList<>());
    }

    @Transactional(readOnly = true)
    public CourseDetailDto getCourseForEdit(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        checkCourseAccess(course, user);

        List<TopicDetailDto> topicDtos = course.getTopics().stream()
                .map(TopicDetailDto::fromEntity)
                .toList();

        int totalLessons = course.getTopics().stream().mapToInt(t -> t.getLessons().size()).sum();
        int estimatedHours = course.getTopics().stream()
                .flatMap(t -> t.getLessons().stream())
                .mapToInt(Lesson::getEstimatedMinutes)
                .sum() / 60;

        return CourseDetailDto.fromEntity(course, totalLessons, Math.max(1, estimatedHours), false, 0, 0.0, topicDtos);
    }

    @Transactional
    public CourseDetailDto updateCourse(Long courseId, UpdateCourseRequest request, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        checkCourseAccess(course, user);

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory());
        if (request.getLevel() != null) course.setLevel(request.getLevel());
        if (request.getEstimatedDuration() != null) course.setEstimatedDuration(request.getEstimatedDuration());
        if (request.getIconUrl() != null) course.setIconUrl(request.getIconUrl());

        Course updated = courseRepository.save(course);
        log.info("Course {} updated by {}", updated.getId(), user.getUsername());

        return getCourseForEdit(courseId, user);
    }

    @Transactional
    public void deleteCourse(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        checkCourseAccess(course, user);

        courseRepository.delete(course);
        log.info("Course {} deleted by {}", courseId, user.getUsername());
    }

    @Transactional(readOnly = true)
    public PublishValidationResultDto validatePublish(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        List<String> errors = new ArrayList<>();

        if (course.getTitle() == null || course.getTitle().trim().isEmpty()) {
            errors.add("Course title is required");
        }
        if (course.getDescription() == null || course.getDescription().trim().isEmpty()) {
            errors.add("Course description is required");
        }
        if (course.getTeacher() == null) {
            errors.add("Course must have an assigned instructor");
        }
        if (course.getTopics() == null || course.getTopics().isEmpty()) {
            errors.add("Course must have at least one module");
        } else {
            for (Topic topic : course.getTopics()) {
                if (topic.getLessons() == null || topic.getLessons().isEmpty()) {
                    errors.add("Module '" + topic.getTitle() + "' must contain at least one lesson");
                }
            }
        }

        return PublishValidationResultDto.builder()
                .canPublish(errors.isEmpty())
                .errors(errors)
                .build();
    }

    @Transactional
    public CourseDetailDto publishCourse(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        checkCourseAccess(course, user);

        PublishValidationResultDto validation = validatePublish(courseId);
        if (!validation.isCanPublish()) {
            throw new BadRequestException("Course cannot be published: " + String.join("; ", validation.getErrors()));
        }

        course.setStatus(CourseStatus.PUBLISHED);
        course.setPublished(true);
        course.setPublishedAt(LocalDateTime.now());
        Course published = courseRepository.save(course);
        log.info("Course {} successfully published by {}", published.getId(), user.getUsername());

        return getCourseForEdit(courseId, user);
    }

    @Transactional
    public CourseDetailDto unpublishCourse(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        checkCourseAccess(course, user);

        course.setStatus(CourseStatus.DRAFT);
        course.setPublished(false);
        Course unpublished = courseRepository.save(course);
        log.info("Course {} unpublished by {}", unpublished.getId(), user.getUsername());

        return getCourseForEdit(courseId, user);
    }

    // --- Module (Topic) Management ---

    @Transactional
    public Topic addModule(Long courseId, CreateModuleRequest request, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        checkCourseAccess(course, user);

        int nextOrder = request.getDisplayOrder() != null ?
                request.getDisplayOrder() :
                course.getTopics().size() + 1;

        Topic topic = Topic.builder()
                .course(course)
                .title(request.getTitle())
                .slug(request.getSlug())
                .description(request.getDescription())
                .displayOrder(nextOrder)
                .build();

        return topicRepository.save(topic);
    }

    @Transactional
    public Topic updateModule(Long moduleId, UpdateModuleRequest request, User user) {
        Topic topic = topicRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + moduleId));
        checkCourseAccess(topic.getCourse(), user);

        topic.setTitle(request.getTitle());
        if (request.getDescription() != null) topic.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) topic.setDisplayOrder(request.getDisplayOrder());

        return topicRepository.save(topic);
    }

    @Transactional
    public void deleteModule(Long moduleId, User user) {
        Topic topic = topicRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + moduleId));
        checkCourseAccess(topic.getCourse(), user);

        topicRepository.delete(topic);
    }

    // --- Lesson Management ---

    @Transactional
    public Lesson addLesson(Long moduleId, CreateLessonRequest request, User user) {
        Topic topic = topicRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + moduleId));
        checkCourseAccess(topic.getCourse(), user);

        int nextOrder = request.getDisplayOrder() != null ?
                request.getDisplayOrder() :
                topic.getLessons().size() + 1;

        Lesson lesson = Lesson.builder()
                .topic(topic)
                .title(request.getTitle())
                .slug(request.getSlug())
                .contentMarkdown(request.getContentMarkdown() != null ? request.getContentMarkdown() : "")
                .estimatedMinutes(request.getEstimatedMinutes() > 0 ? request.getEstimatedMinutes() : 10)
                .displayOrder(nextOrder)
                .build();

        return lessonRepository.save(lesson);
    }

    @Transactional
    public Lesson updateLesson(Long lessonId, UpdateLessonRequest request, User user) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));
        checkCourseAccess(lesson.getTopic().getCourse(), user);

        lesson.setTitle(request.getTitle());
        if (request.getContentMarkdown() != null) lesson.setContentMarkdown(request.getContentMarkdown());
        if (request.getEstimatedMinutes() != null && request.getEstimatedMinutes() > 0) {
            lesson.setEstimatedMinutes(request.getEstimatedMinutes());
        }
        if (request.getDisplayOrder() != null) lesson.setDisplayOrder(request.getDisplayOrder());

        return lessonRepository.save(lesson);
    }

    @Transactional
    public void deleteLesson(Long lessonId, User user) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));
        checkCourseAccess(lesson.getTopic().getCourse(), user);

        lessonRepository.delete(lesson);
    }

    // --- Content Blocks Management ---

    @Transactional
    public ContentBlockDto addContentBlock(Long lessonId, CreateContentBlockRequest request, User user) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));
        checkCourseAccess(lesson.getTopic().getCourse(), user);

        int nextOrder = request.getDisplayOrder() != null ?
                request.getDisplayOrder() :
                lesson.getContentBlocks().size() + 1;

        ContentBlock block = ContentBlock.builder()
                .lesson(lesson)
                .type(request.getType())
                .title(request.getTitle())
                .content(request.getContent())
                .dataJson(request.getDataJson())
                .displayOrder(nextOrder)
                .build();

        ContentBlock saved = contentBlockRepository.save(block);
        return ContentBlockDto.fromEntity(saved);
    }

    @Transactional
    public ContentBlockDto updateContentBlock(Long blockId, CreateContentBlockRequest request, User user) {
        ContentBlock block = contentBlockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Content block not found with id: " + blockId));
        checkCourseAccess(block.getLesson().getTopic().getCourse(), user);

        if (request.getType() != null) block.setType(request.getType());
        if (request.getTitle() != null) block.setTitle(request.getTitle());
        if (request.getContent() != null) block.setContent(request.getContent());
        if (request.getDataJson() != null) block.setDataJson(request.getDataJson());
        if (request.getDisplayOrder() != null) block.setDisplayOrder(request.getDisplayOrder());

        ContentBlock saved = contentBlockRepository.save(block);
        return ContentBlockDto.fromEntity(saved);
    }

    @Transactional
    public void deleteContentBlock(Long blockId, User user) {
        ContentBlock block = contentBlockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Content block not found with id: " + blockId));
        checkCourseAccess(block.getLesson().getTopic().getCourse(), user);

        contentBlockRepository.delete(block);
    }

    @Transactional
    public List<ContentBlockDto> reorderContentBlocks(Long lessonId, List<Long> blockIds, User user) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));
        checkCourseAccess(lesson.getTopic().getCourse(), user);

        List<ContentBlock> blocks = contentBlockRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId);
        for (int i = 0; i < blockIds.size(); i++) {
            Long blockId = blockIds.get(i);
            int order = i + 1;
            blocks.stream().filter(b -> b.getId().equals(blockId)).findFirst().ifPresent(b -> b.setDisplayOrder(order));
        }
        contentBlockRepository.saveAll(blocks);

        return contentBlockRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId).stream()
                .map(ContentBlockDto::fromEntity)
                .toList();
    }

    // --- Resources Management ---

    @Transactional
    public CourseResourceDto addResource(Long courseId, Long lessonId, CourseResourceDto dto, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        checkCourseAccess(course, user);

        Lesson lesson = null;
        if (lessonId != null) {
            lesson = lessonRepository.findById(lessonId)
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));
        }

        CourseResource resource = CourseResource.builder()
                .course(course)
                .lesson(lesson)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .resourceType(dto.getResourceType())
                .url(dto.getUrl())
                .fileName(dto.getFileName())
                .mimeType(dto.getMimeType())
                .fileSize(dto.getFileSize())
                .provider(dto.getProvider() != null ? dto.getProvider() : "Official Docs")
                .attribution(dto.getAttribution())
                .uploadedBy(user)
                .build();

        CourseResource saved = courseResourceRepository.save(resource);
        return CourseResourceDto.fromEntity(saved);
    }

    @Transactional
    public void deleteResource(Long resourceId, User user) {
        CourseResource res = courseResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));
        checkCourseAccess(res.getCourse(), user);
        courseResourceRepository.delete(res);
    }

    // --- Teacher Stats ---

    @Transactional(readOnly = true)
    public TeacherDashboardStatsDto getTeacherStats(User user) {
        List<Course> courses = courseRepository.findByTeacherIdOrderByDisplayOrderAsc(user.getId());
        long total = courses.size();
        long published = courses.stream().filter(c -> c.getStatus() == CourseStatus.PUBLISHED).count();
        long drafts = courses.stream().filter(c -> c.getStatus() == CourseStatus.DRAFT).count();

        long enrolledStudents = courses.stream()
                .mapToLong(c -> enrollmentRepository.countByCourseId(c.getId()))
                .sum();

        return TeacherDashboardStatsDto.builder()
                .myCoursesCount(total)
                .draftsCount(drafts)
                .publishedCount(published)
                .enrolledStudentsCount(enrolledStudents)
                .averageProgressPercentage(0.0)
                .build();
    }
}
