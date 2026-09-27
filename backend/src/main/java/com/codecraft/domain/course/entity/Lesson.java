package com.codecraft.domain.course.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "lessons",
        indexes = {
                @Index(name = "idx_lessons_topic_id", columnList = "topic_id"),
                @Index(name = "idx_lessons_slug", columnList = "slug")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "content_markdown", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String contentMarkdown = "";

    @Column(name = "estimated_minutes", nullable = false)
    @Builder.Default
    private int estimatedMinutes = 10;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private int displayOrder = 0;

    // --- Primary lesson video ---

    @Enumerated(EnumType.STRING)
    @Column(name = "video_type", nullable = false, length = 20)
    @Builder.Default
    private VideoType videoType = VideoType.NONE;

    /** Original YouTube URL or the public URL of the uploaded file. */
    @Column(name = "video_url", length = 500)
    private String videoUrl;

    /** Extracted YouTube video id (only for YOUTUBE). */
    @Column(name = "video_id", length = 50)
    private String videoId;

    @Column(name = "video_file_name", length = 255)
    private String videoFileName;

    @Column(name = "video_mime_type", length = 100)
    private String videoMimeType;

    @Column(name = "video_file_size")
    private Long videoFileSize;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private boolean published = true;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<ContentBlock> contentBlocks = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
