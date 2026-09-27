package com.codecraft.common.storage;

/**
 * Result of a successful upload. Only metadata is persisted in the database; the binary lives in storage.
 */
public record StoredFile(
        String url,
        String originalFileName,
        String storedFileName,
        String mimeType,
        long size,
        String extension
) {
}
