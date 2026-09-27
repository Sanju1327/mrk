package com.codecraft.common.storage;

import com.codecraft.common.exception.BadRequestException;
import com.codecraft.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
public class LocalFileStorageService implements FileStorageService {

    public static final String PUBLIC_PREFIX = "/uploads/";

    private final Path uploadDir;

    public LocalFileStorageService(AppProperties appProperties) {
        this.uploadDir = Paths.get(appProperties.getStorage().getLocalDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            log.error("Could not initialize upload directory: {}", uploadDir, e);
        }
    }

    public Path getUploadDir() {
        return uploadDir;
    }

    @Override
    public StoredFile store(MultipartFile file, UploadKind kind) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }
        if (file.getSize() > kind.getMaxSizeBytes()) {
            throw new BadRequestException("File size exceeds the " + kind.describeLimit() + " limit for "
                    + kind.name().toLowerCase(Locale.ROOT) + " uploads");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()
                || originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new BadRequestException("Invalid filename");
        }

        String extension = getFileExtension(originalFilename).toLowerCase(Locale.ROOT);
        if (!kind.isExtensionAllowed(extension)) {
            throw new BadRequestException("File type '." + extension + "' is not permitted for "
                    + kind.name().toLowerCase(Locale.ROOT) + " uploads");
        }

        String contentType = file.getContentType();
        if (!kind.isMimeTypeAllowed(contentType)) {
            throw new BadRequestException("MIME type '" + contentType + "' is not supported for "
                    + kind.name().toLowerCase(Locale.ROOT) + " uploads");
        }

        String storedFileName = UUID.randomUUID() + "." + extension;
        Path target = uploadDir.resolve(storedFileName).normalize();
        if (!target.startsWith(uploadDir)) {
            throw new BadRequestException("Invalid storage path");
        }

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to store file {}", originalFilename, e);
            throw new IllegalStateException("File storage failed. Please try again.");
        }

        log.info("Stored {} upload: {} -> {}", kind, originalFilename, storedFileName);
        return new StoredFile(
                PUBLIC_PREFIX + storedFileName,
                originalFilename,
                storedFileName,
                contentType != null ? contentType : "application/octet-stream",
                file.getSize(),
                extension
        );
    }

    @Override
    public void deleteByUrl(String url) {
        if (!isManagedUrl(url)) {
            return;
        }
        String fileName = url.substring(PUBLIC_PREFIX.length());
        if (fileName.isBlank() || fileName.contains("/") || fileName.contains("\\") || fileName.contains("..")) {
            return;
        }
        Path target = uploadDir.resolve(fileName).normalize();
        if (!target.startsWith(uploadDir)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("Could not delete stored file {}", target, e);
        }
    }

    @Override
    public boolean isManagedUrl(String url) {
        return url != null && url.startsWith(PUBLIC_PREFIX);
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex + 1);
    }
}
