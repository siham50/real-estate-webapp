package com.realestate.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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
            // Crée le dossier s'il n'existe pas
            if (!Files.exists(this.fileStorageLocation)) {
                Files.createDirectories(this.fileStorageLocation);
            }

            // Extraction de l'extension du fichier d'origine
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
            String extension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0) {
                extension = originalFilename.substring(dotIndex);
            }

            // Génération d'un nom de fichier unique (UUID + extension)
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            // Copie du fichier dans le dossier
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFilename).normalize();
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            // Retourne le chemin relatif (ex: /uploads/uuid.pdf)
            return "/uploads/" + uniqueFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier sur le serveur.", ex);
        }
    }
}
