package com.codecraft.domain.course.service;

import com.codecraft.common.exception.BadRequestException;
import com.codecraft.common.exception.ConflictException;
import com.codecraft.common.exception.ResourceNotFoundException;
import com.codecraft.common.storage.FileStorageService;
import com.codecraft.common.storage.StoredFile;
import com.codecraft.common.storage.UploadKind;
import com.codecraft.common.util.SlugUtil;
import com.codecraft.common.util.YouTubeUrlParser;
import com.codecraft.domain.course.dto.*;
import com.codecraft.domain.course.entity.*;
import com.codecraft.domain.course.repository.*;
import com.codecraft.domain.enrollment.repository.EnrollmentRepository;
import com.codecraft.domain.quiz.entity.Quiz;
import com.codecraft.domain.user.entity.User;
import com.codecraft.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Course authoring: courses, chapters (topics), lessons, videos, learning materials and content blocks.
 * Every mutation re-validates ownership on the server (teacher owns the course, or caller is super admin).
 */
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
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    // ------------------------------------------------------------------
    // Access helpers
    // ------------------------------------------------------------------

    private void checkCourseAccess(Course course, User user) {
        if (!CourseAccess.isOwnerOrAdmin(course, user)) {
            throw new AccessDeniedException("You do not have permission to modify this course");
        }
    }

    private Course loadCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
    }

    private Topic loadTopic(Long topicId) {
        return topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + topicId));
    }

    private Lesson loadLesson(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));
    }

    /** Ensures the lesson's owning course is editable by the user and returns the lesson. */
    private Lesson loadEditableLesson(Long lessonId, User user) {
        Lesson lesson = loadLesson(lessonId);
        checkCourseAccess(lesson.getTopic().getCourse(), user);
        return lesson;
    }

    /**
     * Resolve the instructor for a course. Teachers are always assigned to themselves; super admins may pick
     * any active teacher (or themselves when no id is supplied).
     */
    private User resolveTeacher(Long requestedTeacherId, User actor, User fallback) {
        if (!CourseAccess.isSuperAdmin(actor) || requestedTeacherId == null) {
            return fallback;
        }
        User teacher = userRepository.findById(requestedTeacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + requestedTeacherId));
        if (!CourseAccess.isTeacher(teacher) && !CourseAccess.isSuperAdmin(teacher)) {
            throw new BadRequestException("Selected user is not a teacher");
        }
        if (!teacher.isActive()) {
            throw new BadRequestException("Selected teacher account is disabled");
        }
        return teacher;
    }

    // ------------------------------------------------------------------
    // Courses
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<CourseSummaryDto> getTeacherCourses(User user) {
        List<Course> courses = CourseAccess.isSuperAdmin(user)
                ? courseRepository.findAll()
                : courseRepository.findByTeacherIdOrderByDisplayOrderAsc(user.getId());

        return courses.stream()
                .sorted(Comparator.comparing(Course::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(c -> {
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
    public CourseDetailDto createCourse(CreateCourseRequest request, User actor) {
        String slug = request.getSlug() != null && !request.getSlug().isBlank()
                ? SlugUtil.slugify(request.getSlug())
                : SlugUtil.slugify(request.getTitle());
        if (request.getSlug() != null && !request.getSlug().isBlank() && courseRepository.existsBySlug(slug)) {
            throw new ConflictException("Course slug '" + slug + "' is already in use");
        }
        slug = SlugUtil.unique(slug, 150, courseRepository::existsBySlug);

        User teacher = resolveTeacher(request.getTeacherId(), actor, actor);

        Course course = Course.builder()
                .title(request.getTitle().trim())
                .slug(slug)
                .description(request.getDescription())
                .category(blankToDefault(request.getCategory(), "General"))
                .level(request.getLevel() != null ? request.getLevel() : CourseLevel.BEGINNER)
                .estimatedDuration(blankToDefault(request.getEstimatedDuration(), "4 weeks"))
                .language(blankToDefault(request.getLanguage(), "English"))
                .iconUrl(request.getIconUrl())
                .thumbnailUrl(blankToNull(request.getThumbnailUrl()))
                .teacher(teacher)
                .status(CourseStatus.DRAFT)
                .published(false)
                .displayOrder(0)
                .build();

        Course saved = courseRepository.save(course);
        log.info("{} created course draft '{}' (id={}) for teacher {}", actor.getUsername(), saved.getTitle(), saved.getId(), teacher.getUsername());
        return CourseDetailDto.fromEntity(saved, 0, 0, false, 0, 0.0, new ArrayList<>());
    }

    @Transactional(readOnly = true)
    public CourseDetailDto getCourseForEdit(Long courseId, User user) {
        Course course = loadCourse(courseId);
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
        Course course = loadCourse(courseId);
        checkCourseAccess(course, user);

        course.setTitle(request.getTitle().trim());
        course.setDescription(request.getDescription());
        if (request.getCategory() != null) course.setCategory(blankToDefault(request.getCategory(), "General"));
        if (request.getLevel() != null) course.setLevel(request.getLevel());
        if (request.getEstimatedDuration() != null) course.setEstimatedDuration(blankToDefault(request.getEstimatedDuration(), "4 weeks"));
        if (request.getLanguage() != null) course.setLanguage(blankToDefault(request.getLanguage(), "English"));
        if (request.getIconUrl() != null) course.setIconUrl(request.getIconUrl());
        if (request.getThumbnailUrl() != null) {
            String newThumb = blankToNull(request.getThumbnailUrl());
            if (!Objects.equals(newThumb, course.getThumbnailUrl()) && fileStorageService.isManagedUrl(course.getThumbnailUrl())) {
                fileStorageService.deleteByUrl(course.getThumbnailUrl());
            }
            course.setThumbnailUrl(newThumb);
        }
        if (request.getTeacherId() != null && CourseAccess.isSuperAdmin(user)) {
            course.setTeacher(resolveTeacher(request.getTeacherId(), user, course.getTeacher()));
        }

        courseRepository.save(course);
        log.info("Course {} updated by {}", courseId, user.getUsername());
        return getCourseForEdit(courseId, user);
    }

    @Transactional
    public void deleteCourse(Long courseId, User user) {
        Course course = loadCourse(courseId);
        checkCourseAccess(course, user);
        // Deleting a course wipes student progress and uploads; teachers archive instead.
        if (!CourseAccess.isSuperAdmin(user)) {
            throw new AccessDeniedException("Only a Super Admin can delete a course. Archive it instead.");
        }

        // Remove stored binaries owned by this course before the cascade delete removes their metadata.
        for (CourseResource res : courseResourceRepository.findByCourseId(courseId)) {
            fileStorageService.deleteByUrl(res.getUrl());
        }
        course.getTopics().stream().flatMap(t -> t.getLessons().stream())
                .filter(l -> l.getVideoType() == VideoType.UPLOAD)
                .forEach(l -> fileStorageService.deleteByUrl(l.getVideoUrl()));
        fileStorageService.deleteByUrl(course.getThumbnailUrl());

        courseRepository.delete(course);
        log.info("Course {} deleted by {}", courseId, user.getUsername());
    }

    @Transactional(readOnly = true)
    public PublishValidationResultDto validatePublish(Long courseId, User user) {
        checkCourseAccess(loadCourse(courseId), user);
        return validatePublish(courseId);
    }

    @Transactional(readOnly = true)
    public PublishValidationResultDto validatePublish(Long courseId) {
        Course course = loadCourse(courseId);
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
            errors.add("Course must have at least one chapter");
        } else {
            for (Topic topic : course.getTopics()) {
                if (topic.getLessons() == null || topic.getLessons().isEmpty()) {
                    errors.add("Chapter '" + topic.getTitle() + "' must contain at least one lesson");
                }
                Quiz quiz = TopicDetailDto.primaryQuiz(topic);
                if (topic.isRequireQuizPass()) {
                    if (quiz == null || !quiz.isEnabled()) {
                        errors.add("Chapter '" + topic.getTitle() + "' requires a quiz but has no enabled quiz");
                    } else if (quiz.getQuestions().isEmpty()) {
                        errors.add("Quiz for chapter '" + topic.getTitle() + "' has no questions");
                    }
                }
                if (quiz != null && quiz.isEnabled()) {
                    boolean invalidQuestion = quiz.getQuestions().stream().anyMatch(q ->
                            q.getOptions().size() < 2 || q.getOptions().stream().noneMatch(o -> o.isCorrect()));
                    if (invalidQuestion) {
                        errors.add("Quiz for chapter '" + topic.getTitle() + "' has a question without enough options or a correct answer");
                    }
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
        Course course = loadCourse(courseId);
        checkCourseAccess(course, user);

        PublishValidationResultDto validation = validatePublish(courseId);
        if (!validation.isCanPublish()) {
            throw new BadRequestException("Course cannot be published: " + String.join("; ", validation.getErrors()));
        }

        course.setStatus(CourseStatus.PUBLISHED);
        course.setPublished(true);
        course.setPublishedAt(LocalDateTime.now());
        courseRepository.save(course);
        log.info("Course {} published by {}", courseId, user.getUsername());
        return getCourseForEdit(courseId, user);
    }

    @Transactional
    public CourseDetailDto unpublishCourse(Long courseId, User user) {
        Course course = loadCourse(courseId);
        checkCourseAccess(course, user);

        course.setStatus(CourseStatus.DRAFT);
        course.setPublished(false);
        courseRepository.save(course);
        log.info("Course {} unpublished by {}", courseId, user.getUsername());
        return getCourseForEdit(courseId, user);
    }

    @Transactional
    public CourseDetailDto archiveCourse(Long courseId, User user) {
        Course course = loadCourse(courseId);
        checkCourseAccess(course, user);

        course.setStatus(CourseStatus.ARCHIVED);
        course.setPublished(false);
        courseRepository.save(course);
        log.info("Course {} archived by {}", courseId, user.getUsername());
        return getCourseForEdit(courseId, user);
    }

    // ------------------------------------------------------------------
    // Chapters (Topics)
    // ------------------------------------------------------------------

    @Transactional
    public Topic addModule(Long courseId, CreateModuleRequest request, User user) {
        Course course = loadCourse(courseId);
        checkCourseAccess(course, user);

        int nextOrder = request.getDisplayOrder() != null
                ? request.getDisplayOrder()
                : course.getTopics().stream().mapToInt(Topic::getDisplayOrder).max().orElse(0) + 1;

        String base = request.getSlug() != null && !request.getSlug().isBlank()
                ? SlugUtil.slugify(request.getSlug())
                : course.getSlug() + "-" + SlugUtil.slugify(request.getTitle());
        String slug = SlugUtil.unique(base, 150, s -> topicRepository.findBySlug(s).isPresent());

        Topic topic = Topic.builder()
                .course(course)
                .title(request.getTitle().trim())
                .slug(slug)
                .description(request.getDescription())
                .displayOrder(nextOrder)
                .requireAllLessons(Boolean.TRUE.equals(request.getRequireAllLessons()))
                .requireQuizPass(Boolean.TRUE.equals(request.getRequireQuizPass()))
                .allowQuizRetakes(request.getAllowQuizRetakes() == null || request.getAllowQuizRetakes())
                .maxQuizAttempts(request.getMaxQuizAttempts())
                .build();

        return topicRepository.save(topic);
    }

    @Transactional
    public Topic updateModule(Long moduleId, UpdateModuleRequest request, User user) {
        Topic topic = loadTopic(moduleId);
        checkCourseAccess(topic.getCourse(), user);

        topic.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) topic.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) topic.setDisplayOrder(request.getDisplayOrder());
        if (request.getRequireAllLessons() != null) topic.setRequireAllLessons(request.getRequireAllLessons());
        if (request.getRequireQuizPass() != null) topic.setRequireQuizPass(request.getRequireQuizPass());
        if (request.getAllowQuizRetakes() != null) topic.setAllowQuizRetakes(request.getAllowQuizRetakes());
        if (Boolean.TRUE.equals(request.getClearMaxQuizAttempts())) {
            topic.setMaxQuizAttempts(null);
        } else if (request.getMaxQuizAttempts() != null) {
            topic.setMaxQuizAttempts(request.getMaxQuizAttempts());
        }

        return topicRepository.save(topic);
    }

    @Transactional
    public void deleteModule(Long moduleId, User user) {
        Topic topic = loadTopic(moduleId);
        checkCourseAccess(topic.getCourse(), user);

        for (Lesson lesson : topic.getLessons()) {
            cleanupLessonFiles(lesson);
        }
        topicRepository.delete(topic);
    }

    @Transactional
    public List<TopicDetailDto> reorderModules(Long courseId, List<Long> orderedTopicIds, User user) {
        Course course = loadCourse(courseId);
        checkCourseAccess(course, user);

        List<Topic> topics = topicRepository.findByCourseIdOrderByDisplayOrderAsc(courseId);
        applyOrder(topics, orderedTopicIds, Topic::getId, Topic::setDisplayOrder, "chapter");
        topicRepository.saveAll(topics);

        return topicRepository.findByCourseIdOrderByDisplayOrderAsc(courseId).stream()
                .map(TopicDetailDto::fromEntity)
                .toList();
    }

    // ------------------------------------------------------------------
    // Lessons
    // ------------------------------------------------------------------

    @Transactional
    public Lesson addLesson(Long moduleId, CreateLessonRequest request, User user) {
        Topic topic = loadTopic(moduleId);
        checkCourseAccess(topic.getCourse(), user);

        int nextOrder = request.getDisplayOrder() != null
                ? request.getDisplayOrder()
                : topic.getLessons().stream().mapToInt(Lesson::getDisplayOrder).max().orElse(0) + 1;

        String base = request.getSlug() != null && !request.getSlug().isBlank()
                ? SlugUtil.slugify(request.getSlug())
                : topic.getSlug() + "-" + SlugUtil.slugify(request.getTitle());
        String slug = SlugUtil.unique(base, 200, s -> lessonRepository.findBySlug(s).isPresent());

        Lesson lesson = Lesson.builder()
                .topic(topic)
                .title(request.getTitle().trim())
                .slug(slug)
                .description(request.getDescription())
                .contentMarkdown(request.getContentMarkdown() != null ? request.getContentMarkdown() : "")
                .estimatedMinutes(request.getEstimatedMinutes() > 0 ? request.getEstimatedMinutes() : 10)
                .displayOrder(nextOrder)
                .published(request.getPublished() == null || request.getPublished())
                .build();

        if (request.getVideoType() == VideoType.YOUTUBE) {
            applyYouTubeVideo(lesson, request.getVideoUrl());
        }

        return lessonRepository.save(lesson);
    }

    @Transactional
    public Lesson updateLesson(Long lessonId, UpdateLessonRequest request, User user) {
        Lesson lesson = loadEditableLesson(lessonId, user);

        lesson.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) lesson.setDescription(request.getDescription());
        if (request.getContentMarkdown() != null) lesson.setContentMarkdown(request.getContentMarkdown());
        if (request.getEstimatedMinutes() != null && request.getEstimatedMinutes() > 0) {
            lesson.setEstimatedMinutes(request.getEstimatedMinutes());
        }
        if (request.getDisplayOrder() != null) lesson.setDisplayOrder(request.getDisplayOrder());
        if (request.getPublished() != null) lesson.setPublished(request.getPublished());

        if (request.getVideoType() != null) {
            switch (request.getVideoType()) {
                case YOUTUBE -> {
                    cleanupUploadedVideo(lesson);
                    applyYouTubeVideo(lesson, request.getVideoUrl());
                }
                case NONE -> clearVideo(lesson);
                case UPLOAD -> {
                    // Uploaded videos are attached via uploadLessonVideo(); ignore here unless already an upload.
                    if (lesson.getVideoType() != VideoType.UPLOAD) {
                        throw new BadRequestException("Upload the video file to attach an uploaded video");
                    }
                }
            }
        }

        return lessonRepository.save(lesson);
    }

    @Transactional
    public void deleteLesson(Long lessonId, User user) {
        Lesson lesson = loadEditableLesson(lessonId, user);
        cleanupLessonFiles(lesson);
        lessonRepository.delete(lesson);
    }

    @Transactional
    public List<LessonSummaryDto> reorderLessons(Long moduleId, List<Long> orderedLessonIds, User user) {
        Topic topic = loadTopic(moduleId);
        checkCourseAccess(topic.getCourse(), user);

        List<Lesson> lessons = lessonRepository.findByTopicIdOrderByDisplayOrderAsc(moduleId);
        applyOrder(lessons, orderedLessonIds, Lesson::getId, Lesson::setDisplayOrder, "lesson");
        lessonRepository.saveAll(lessons);

        return lessonRepository.findByTopicIdOrderByDisplayOrderAsc(moduleId).stream()
                .map(l -> LessonSummaryDto.fromEntity(l, false))
                .toList();
    }

    /** Full lesson for the editor: video, content blocks and learning materials. */
    @Transactional(readOnly = true)
    public LessonDetailDto getLessonForEdit(Long lessonId, User user) {
        Lesson lesson = loadEditableLesson(lessonId, user);
        LessonDetailDto dto = LessonDetailDto.fromEntity(lesson, false, null, null);
        dto.setResources(courseResourceRepository.findByLessonIdOrderByDisplayOrderAscIdAsc(lessonId).stream()
                .map(CourseResourceDto::fromEntity)
                .toList());
        Quiz quiz = TopicDetailDto.primaryQuiz(lesson.getTopic());
        if (quiz != null) {
            dto.setChapterQuizId(quiz.getId());
            dto.setChapterQuizRequired(lesson.getTopic().isRequireQuizPass());
        }
        return dto;
    }

    // ------------------------------------------------------------------
    // Lesson video
    // ------------------------------------------------------------------

    @Transactional
    public LessonDetailDto uploadLessonVideo(Long lessonId, MultipartFile file, User user) {
        Lesson lesson = loadEditableLesson(lessonId, user);

        StoredFile stored = fileStorageService.store(file, UploadKind.VIDEO);
        cleanupUploadedVideo(lesson);

        lesson.setVideoType(VideoType.UPLOAD);
        lesson.setVideoUrl(stored.url());
        lesson.setVideoId(null);
        lesson.setVideoFileName(stored.originalFileName());
        lesson.setVideoMimeType(stored.mimeType());
        lesson.setVideoFileSize(stored.size());
        lessonRepository.save(lesson);

        log.info("Lesson {} video uploaded by {} ({} bytes)", lessonId, user.getUsername(), stored.size());
        return getLessonForEdit(lessonId, user);
    }

    @Transactional
    public LessonDetailDto removeLessonVideo(Long lessonId, User user) {
        Lesson lesson = loadEditableLesson(lessonId, user);
        clearVideo(lesson);
        lessonRepository.save(lesson);
        return getLessonForEdit(lessonId, user);
    }

    private void applyYouTubeVideo(Lesson lesson, String url) {
        String videoId = YouTubeUrlParser.extractVideoId(url)
                .orElseThrow(() -> new BadRequestException("Invalid YouTube URL. Use a youtube.com/watch?v=..., youtu.be/... or embed link."));
        lesson.setVideoType(VideoType.YOUTUBE);
        lesson.setVideoId(videoId);
        lesson.setVideoUrl(url.trim());
        lesson.setVideoFileName(null);
        lesson.setVideoMimeType(null);
        lesson.setVideoFileSize(null);
    }

    private void clearVideo(Lesson lesson) {
        cleanupUploadedVideo(lesson);
        lesson.setVideoType(VideoType.NONE);
        lesson.setVideoUrl(null);
        lesson.setVideoId(null);
        lesson.setVideoFileName(null);
        lesson.setVideoMimeType(null);
        lesson.setVideoFileSize(null);
    }

    private void cleanupUploadedVideo(Lesson lesson) {
        if (lesson.getVideoType() == VideoType.UPLOAD && lesson.getVideoUrl() != null) {
            fileStorageService.deleteByUrl(lesson.getVideoUrl());
        }
    }

    private void cleanupLessonFiles(Lesson lesson) {
        cleanupUploadedVideo(lesson);
        for (CourseResource res : courseResourceRepository.findByLessonId(lesson.getId())) {
            fileStorageService.deleteByUrl(res.getUrl());
        }
    }

    // ------------------------------------------------------------------
    // Content blocks (existing rich-content feature)
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ContentBlockDto> getContentBlocks(Long lessonId, User user) {
        loadEditableLesson(lessonId, user);
        return contentBlockRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId).stream()
                .map(ContentBlockDto::fromEntity)
                .toList();
    }

    @Transactional
    public ContentBlockDto addContentBlock(Long lessonId, CreateContentBlockRequest request, User user) {
        Lesson lesson = loadEditableLesson(lessonId, user);

        int nextOrder = request.getDisplayOrder() != null
                ? request.getDisplayOrder()
                : lesson.getContentBlocks().size() + 1;

        ContentBlock block = ContentBlock.builder()
                .lesson(lesson)
                .type(request.getType())
                .title(request.getTitle())
                .content(request.getContent())
                .dataJson(request.getDataJson())
                .displayOrder(nextOrder)
                .build();

        return ContentBlockDto.fromEntity(contentBlockRepository.save(block));
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

        return ContentBlockDto.fromEntity(contentBlockRepository.save(block));
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
        loadEditableLesson(lessonId, user);

        List<ContentBlock> blocks = contentBlockRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId);
        applyOrder(blocks, blockIds, ContentBlock::getId, ContentBlock::setDisplayOrder, "content block");
        contentBlockRepository.saveAll(blocks);

        return contentBlockRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId).stream()
                .map(ContentBlockDto::fromEntity)
                .toList();
    }

    // ------------------------------------------------------------------
    // Learning materials / resources
    // ------------------------------------------------------------------

    /** Link-style resource (external URL) attached to a course or lesson. */
    @Transactional
    public CourseResourceDto addResource(Long courseId, Long lessonId, CourseResourceDto dto, User user) {
        Course course = loadCourse(courseId);
        checkCourseAccess(course, user);

        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new BadRequestException("Resource title is required");
        }
        if (dto.getUrl() == null || dto.getUrl().isBlank()) {
            throw new BadRequestException("Resource URL is required");
        }

        Lesson lesson = null;
        if (lessonId != null) {
            lesson = loadLesson(lessonId);
            if (!lesson.getTopic().getCourse().getId().equals(courseId)) {
                throw new BadRequestException("Lesson does not belong to this course");
            }
        }

        CourseResource resource = CourseResource.builder()
                .course(course)
                .lesson(lesson)
                .title(dto.getTitle().trim())
                .description(dto.getDescription())
                .resourceType(dto.getResourceType() != null ? dto.getResourceType() : ResourceType.LINK)
                .url(dto.getUrl().trim())
                .fileName(dto.getFileName())
                .mimeType(dto.getMimeType())
                .fileSize(dto.getFileSize())
                .provider(dto.getProvider() != null ? dto.getProvider() : "External")
                .attribution(dto.getAttribution())
                .displayOrder(nextResourceOrder(lessonId))
                .uploadedBy(user)
                .build();

        return CourseResourceDto.fromEntity(courseResourceRepository.save(resource));
    }

    /** Upload a learning material file and attach it to a lesson. */
    @Transactional
    public CourseResourceDto uploadLessonMaterial(Long lessonId, MultipartFile file, String title, String description, User user) {
        Lesson lesson = loadEditableLesson(lessonId, user);

        StoredFile stored = fileStorageService.store(file, UploadKind.MATERIAL);
        String resolvedTitle = (title != null && !title.isBlank()) ? title.trim() : stripExtension(stored.originalFileName());

        CourseResource resource = CourseResource.builder()
                .course(lesson.getTopic().getCourse())
                .lesson(lesson)
                .title(resolvedTitle.length() > 200 ? resolvedTitle.substring(0, 200) : resolvedTitle)
                .description(description)
                .resourceType(resourceTypeFor(stored.extension()))
                .url(stored.url())
                .fileName(stored.originalFileName())
                .mimeType(stored.mimeType())
                .fileSize(stored.size())
                .provider("Upload")
                .displayOrder(nextResourceOrder(lessonId))
                .uploadedBy(user)
                .build();

        CourseResource saved = courseResourceRepository.save(resource);
        log.info("Material '{}' uploaded to lesson {} by {}", saved.getTitle(), lessonId, user.getUsername());
        return CourseResourceDto.fromEntity(saved);
    }

    /** Replace the file behind an existing material, keeping its title/description/order. */
    @Transactional
    public CourseResourceDto replaceMaterialFile(Long resourceId, MultipartFile file, User user) {
        CourseResource res = loadEditableResource(resourceId, user);

        StoredFile stored = fileStorageService.store(file, UploadKind.MATERIAL);
        fileStorageService.deleteByUrl(res.getUrl());

        res.setUrl(stored.url());
        res.setFileName(stored.originalFileName());
        res.setMimeType(stored.mimeType());
        res.setFileSize(stored.size());
        res.setResourceType(resourceTypeFor(stored.extension()));
        res.setProvider("Upload");
        return CourseResourceDto.fromEntity(courseResourceRepository.save(res));
    }

    @Transactional
    public CourseResourceDto updateResource(Long resourceId, UpdateResourceRequest request, User user) {
        CourseResource res = loadEditableResource(resourceId, user);
        res.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) res.setDescription(request.getDescription());
        return CourseResourceDto.fromEntity(courseResourceRepository.save(res));
    }

    @Transactional
    public void deleteResource(Long resourceId, User user) {
        CourseResource res = loadEditableResource(resourceId, user);
        fileStorageService.deleteByUrl(res.getUrl());
        courseResourceRepository.delete(res);
    }

    private CourseResource loadEditableResource(Long resourceId, User user) {
        CourseResource res = courseResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));
        checkCourseAccess(res.getCourse(), user);
        return res;
    }

    private int nextResourceOrder(Long lessonId) {
        if (lessonId == null) return 0;
        return courseResourceRepository.findByLessonId(lessonId).stream()
                .mapToInt(CourseResource::getDisplayOrder).max().orElse(0) + 1;
    }

    static ResourceType resourceTypeFor(String extension) {
        if (extension == null) return ResourceType.OTHER;
        return switch (extension.toLowerCase(Locale.ROOT)) {
            case "pdf", "doc", "docx", "txt", "md", "rtf" -> ResourceType.DOCUMENT;
            case "ppt", "pptx" -> ResourceType.SLIDES;
            case "xls", "xlsx", "csv" -> ResourceType.SPREADSHEET;
            case "png", "jpg", "jpeg", "webp", "gif" -> ResourceType.IMAGE;
            case "zip" -> ResourceType.ARCHIVE;
            case "mp4", "webm", "mov", "m4v" -> ResourceType.VIDEO;
            case "java", "py", "js", "ts", "jsx", "tsx", "c", "cpp", "h", "hpp", "cs", "go", "rs", "rb",
                 "php", "kt", "swift", "sql", "html", "css", "json", "xml", "yml", "yaml", "sh" -> ResourceType.CODE;
            default -> ResourceType.OTHER;
        };
    }

    // ------------------------------------------------------------------
    // Teacher stats
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public TeacherDashboardStatsDto getTeacherStats(User user) {
        List<Course> courses = CourseAccess.isSuperAdmin(user)
                ? courseRepository.findAll()
                : courseRepository.findByTeacherIdOrderByDisplayOrderAsc(user.getId());
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

    // ------------------------------------------------------------------
    // Utilities
    // ------------------------------------------------------------------

    /**
     * Apply a client-provided ordering. Every existing item must appear exactly once; unknown ids are rejected.
     */
    private <T> void applyOrder(List<T> items, List<Long> orderedIds, java.util.function.Function<T, Long> idOf,
                                java.util.function.BiConsumer<T, Integer> setOrder, String label) {
        if (orderedIds == null || orderedIds.isEmpty()) {
            throw new BadRequestException("Ordered id list is required");
        }
        Set<Long> existing = new HashSet<>();
        items.forEach(i -> existing.add(idOf.apply(i)));
        Set<Long> provided = new HashSet<>(orderedIds);
        if (provided.size() != orderedIds.size() || !existing.equals(provided)) {
            throw new BadRequestException("Reorder request must contain each " + label + " id exactly once");
        }
        for (T item : items) {
            setOrder.accept(item, orderedIds.indexOf(idOf.apply(item)) + 1);
        }
    }

    private static String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String stripExtension(String fileName) {
        if (fileName == null) return "Material";
        int dot = fileName.lastIndexOf('.');
        return dot > 0 ? fileName.substring(0, dot) : fileName;
    }
}
