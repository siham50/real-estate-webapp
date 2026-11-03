package com.realestate.backend.controller;

import com.realestate.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UploadServeController {

    private final FileStorageService fileStorageService;

    @GetMapping({
            "/uploads/{fileName:.+}",
            "/api/files/download/{fileName:.+}",
            "/api/uploads/{fileName:.+}"
    })
    public ResponseEntity<Resource> serveUploadedFile(@PathVariable String fileName) {
        try {
            Resource resource = fileStorageService.loadFileAsResource(fileName);
            if (resource == null || !resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = null;
            try {
                Path path = resource.getFile().toPath();
                contentType = Files.probeContentType(path);
            } catch (Exception ignored) {
            }

            if (contentType == null) {
                String lower = fileName.toLowerCase();
                if (lower.endsWith(".png")) {
                    contentType = "image/png";
                } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (lower.endsWith(".webp")) {
                    contentType = "image/webp";
                } else if (lower.endsWith(".pdf")) {
                    contentType = "application/pdf";
                } else {
                    contentType = "application/octet-stream";
                }
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                    .header("Access-Control-Allow-Origin", "*")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
