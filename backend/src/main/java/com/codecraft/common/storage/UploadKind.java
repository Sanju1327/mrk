package com.codecraft.common.storage;

import java.util.Locale;
import java.util.Set;

/**
 * Categories of uploads with their own extension whitelist and size limit.
 * Validation is done server-side by {@link FileStorageService}; never trust client-provided type hints alone.
 */
public enum UploadKind {

    /** Course thumbnails and inline images. */
    IMAGE(
            Set.of("png", "jpg", "jpeg", "webp", "gif"),
            Set.of("image/png", "image/jpeg", "image/webp", "image/gif"),
            10L * 1024 * 1024
    ),

    /** Lesson videos played back through the HTML5 player. */
    VIDEO(
            Set.of("mp4", "webm", "m4v", "mov"),
            Set.of("video/mp4", "video/webm", "video/x-m4v", "video/quicktime"),
            500L * 1024 * 1024
    ),

    /** Lesson learning materials: documents, slides, spreadsheets, archives, source code, images, text. */
    MATERIAL(
            Set.of(
                    "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "csv", "txt", "md", "rtf",
                    "zip", "png", "jpg", "jpeg", "webp", "gif",
                    "java", "py", "js", "ts", "jsx", "tsx", "c", "cpp", "h", "hpp", "cs", "go", "rs", "rb",
                    "php", "kt", "swift", "sql", "html", "css", "json", "xml", "yml", "yaml", "sh"
            ),
            null, // extension whitelist is authoritative; MIME sniffing across office/code types is unreliable
            50L * 1024 * 1024
    );

    private final Set<String> allowedExtensions;
    private final Set<String> allowedMimeTypes;
    private final long maxSizeBytes;

    UploadKind(Set<String> allowedExtensions, Set<String> allowedMimeTypes, long maxSizeBytes) {
        this.allowedExtensions = allowedExtensions;
        this.allowedMimeTypes = allowedMimeTypes;
        this.maxSizeBytes = maxSizeBytes;
    }

    public Set<String> getAllowedExtensions() {
        return allowedExtensions;
    }

    public long getMaxSizeBytes() {
        return maxSizeBytes;
    }

    public boolean isExtensionAllowed(String extension) {
        return extension != null && allowedExtensions.contains(extension.toLowerCase(Locale.ROOT));
    }

    /**
     * MIME check on top of the (authoritative) extension whitelist. Browsers and HTTP clients
     * frequently send {@code application/octet-stream} for less common containers (.mov/.m4v),
     * so the generic binary type is tolerated when the extension has already been accepted.
     */
    public boolean isMimeTypeAllowed(String mimeType) {
        if (allowedMimeTypes == null) {
            return true;
        }
        if (mimeType == null || mimeType.isBlank()) {
            return true;
        }
        String normalized = mimeType.toLowerCase(Locale.ROOT);
        int semicolon = normalized.indexOf(';');
        if (semicolon > 0) {
            normalized = normalized.substring(0, semicolon).trim();
        }
        return GENERIC_BINARY.equals(normalized) || allowedMimeTypes.contains(normalized);
    }

    private static final String GENERIC_BINARY = "application/octet-stream";

    public String describeLimit() {
        return (maxSizeBytes / (1024 * 1024)) + "MB";
    }
}
