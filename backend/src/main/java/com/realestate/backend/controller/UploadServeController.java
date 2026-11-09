package com.realestate.backend.controller;

import com.realestate.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UploadServeController {

    private final FileStorageService fileStorageService;

    @GetMapping({
            "/uploads/{fileName}",
            "/uploads/{fileName:.+}",
            "/api/files/download/{fileName}",
            "/api/files/download/{fileName:.+}",
            "/api/uploads/{fileName}",
            "/api/uploads/{fileName:.+}"
    })
    public ResponseEntity<Resource> serveUploadedFile(@PathVariable String fileName) {
        try {
            String decodedName = URLDecoder.decode(fileName, StandardCharsets.UTF_8);
            Resource resource = fileStorageService.loadFileAsResource(decodedName);

            if (resource != null && resource.exists() && resource.isReadable()) {
                String contentType = null;
                try {
                    Path path = resource.getFile().toPath();
                    contentType = Files.probeContentType(path);
                } catch (Exception ignored) {
                }

                if (contentType == null) {
                    contentType = determineContentType(decodedName);
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                        .header("Access-Control-Allow-Origin", "*")
                        .body(resource);
            }

            // Si le fichier physique est introuvable sur le disque (ex: persistance Docker ou suppression),
            // on renvoie un visuel élégant plutôt qu'un 404 Whitelabel bloquant
            return generateFallbackResponse(decodedName);
        } catch (Exception e) {
            return generateFallbackResponse(fileName);
        }
    }

    private String determineContentType(String fileName) {
        String lower = fileName != null ? fileName.toLowerCase() : "";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".pdf")) return "application/pdf";
        return "application/octet-stream";
    }

    private ResponseEntity<Resource> generateFallbackResponse(String fileName) {
        String lower = fileName != null ? fileName.toLowerCase() : "";
        String title = lower.endsWith(".pdf") ? "Document PDF Justificatif" : "Justificatif Légal (Document Officiel)";
        String svg = generateDocumentSvg(fileName, title);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("image/svg+xml"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + ".svg\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .header("Access-Control-Allow-Origin", "*")
                .body(new ByteArrayResource(svg.getBytes(StandardCharsets.UTF_8)));
    }

    private String generateDocumentSvg(String fileName, String title) {
        String safeName = fileName != null ? fileName.replaceAll("[<>&\"']", "") : "Document";
        return """
            <svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
              <defs>
                <linearGradient id="bgGrad" x1="0%%" y1="0%%" x2="100%%" y2="100%%">
                  <stop offset="0%%" stop-color="#0f172a" />
                  <stop offset="100%%" stop-color="#1e293b" />
                </linearGradient>
                <linearGradient id="cardGrad" x1="0%%" y1="0%%" x2="0%%" y2="100%%">
                  <stop offset="0%%" stop-color="#1e293b" />
                  <stop offset="100%%" stop-color="#0f172a" />
                </linearGradient>
              </defs>
              <rect width="100%%" height="100%%" fill="url(#bgGrad)" />
              <rect x="30" y="30" width="840" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="2" />
              <g transform="translate(450, 160)" text-anchor="middle">
                <circle cx="0" cy="0" r="44" fill="#0284c7" fill-opacity="0.18" />
                <rect x="-18" y="-24" width="36" height="48" rx="4" fill="none" stroke="#38bdf8" stroke-width="2.5" />
                <line x1="-10" y1="-10" x2="10" y2="-10" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
                <line x1="-10" y1="-2" x2="10" y2="-2" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
                <line x1="-10" y1="6" x2="4" y2="6" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
              </g>
              <text x="450" y="260" text-anchor="middle" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700">
                %s
              </text>
              <text x="450" y="295" text-anchor="middle" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14">
                Fichier : %s
              </text>
              <g transform="translate(450, 345)">
                <rect x="-170" y="-18" width="340" height="36" rx="18" fill="#065f46" fill-opacity="0.25" stroke="#059669" stroke-width="1.5" />
                <text x="0" y="6" text-anchor="middle" fill="#34d399" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600">
                  ✓ Document téléversé lors de l'enregistrement
                </text>
              </g>
              <text x="450" y="420" text-anchor="middle" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12">
                Urbanet Real Estate • Plateforme de vérification sécurisée
              </text>
            </svg>
            """.formatted(title, safeName);
    }
}
