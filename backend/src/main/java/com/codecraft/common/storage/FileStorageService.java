package com.codecraft.common.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Storage abstraction for uploaded course assets (videos, learning materials, images).
 * The default implementation stores files on the local filesystem under the configured uploads directory
 * and serves them through {@code /uploads/**}. Swap the implementation to move to object storage.
 */
public interface FileStorageService {

    /**
     * Validate and store an uploaded file.
     *
     * @throws com.codecraft.common.exception.BadRequestException when the file fails validation
     */
    StoredFile store(MultipartFile file, UploadKind kind);

    /**
     * Delete a previously stored file by its public URL. Unknown/external URLs are ignored.
     */
    void deleteByUrl(String url);

    /**
     * @return true when the URL points to a file managed by this storage.
     */
    boolean isManagedUrl(String url);
}
