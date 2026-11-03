package com.realestate.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir:uploads/}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Impossible de créer le dossier de stockage des fichiers uploadés.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Impossible d'enregistrer un fichier vide.");
        }

        try {
            if (!Files.exists(this.fileStorageLocation)) {
                Files.createDirectories(this.fileStorageLocation);
            }

            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
            String extension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0) {
                extension = originalFilename.substring(dotIndex);
            }

            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFilename).normalize();

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            // Synchroniser vers uploads/ à la racine du projet pour garantir l'accès quel que soit le CWD
            try {
                Path altRootPath = Paths.get("uploads").toAbsolutePath().normalize();
                if (!altRootPath.equals(this.fileStorageLocation)) {
                    Files.createDirectories(altRootPath);
                    Files.copy(targetLocation, altRootPath.resolve(uniqueFilename), StandardCopyOption.REPLACE_EXISTING);
                }
            } catch (Exception ignored) {
            }

            try {
                Path backendUploadsPath = Paths.get("backend", "uploads").toAbsolutePath().normalize();
                if (!backendUploadsPath.equals(this.fileStorageLocation)) {
                    Files.createDirectories(backendUploadsPath);
                    Files.copy(targetLocation, backendUploadsPath.resolve(uniqueFilename), StandardCopyOption.REPLACE_EXISTING);
                }
            } catch (Exception ignored) {
            }

            return "/uploads/" + uniqueFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier sur le serveur.", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            String cleanedName = StringUtils.cleanPath(fileName);
            if (cleanedName.contains("/")) {
                cleanedName = cleanedName.substring(cleanedName.lastIndexOf('/') + 1);
            }
            if (cleanedName.contains("\\")) {
                cleanedName = cleanedName.substring(cleanedName.lastIndexOf('\\') + 1);
            }

            List<Path> candidateDirs = Arrays.asList(
                    this.fileStorageLocation,
                    Paths.get("uploads").toAbsolutePath().normalize(),
                    Paths.get("backend/uploads").toAbsolutePath().normalize(),
                    Paths.get("../uploads").toAbsolutePath().normalize(),
                    Paths.get(System.getProperty("user.dir"), "uploads").normalize(),
                    Paths.get(System.getProperty("user.dir"), "backend", "uploads").normalize()
            );

            for (Path dir : candidateDirs) {
                Path filePath = dir.resolve(cleanedName).normalize();
                if (Files.exists(filePath) && Files.isReadable(filePath)) {
                    Resource resource = new UrlResource(filePath.toUri());
                    if (resource.exists() && resource.isReadable()) {
                        return resource;
                    }
                }
            }

            Path fallbackPath = this.fileStorageLocation.resolve(cleanedName).normalize();
            Resource resource = new UrlResource(fallbackPath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            return null;
        } catch (MalformedURLException ex) {
            return null;
        }
    }
}
