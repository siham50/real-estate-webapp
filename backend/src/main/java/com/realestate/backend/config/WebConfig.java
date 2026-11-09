package com.realestate.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadUri = uploadPath.toUri().toString();
        if (!uploadUri.endsWith("/")) {
            uploadUri += "/";
        }

        List<String> locations = new ArrayList<>();
        locations.add(uploadUri);
        locations.add("file:uploads/");
        locations.add("file:backend/uploads/");
        locations.add("file:../uploads/");

        try {
            Path currentDirPath = Paths.get(System.getProperty("user.dir", ".")).toAbsolutePath().normalize();
            String currentUri = currentDirPath.toUri().toString();
            if (!currentUri.endsWith("/")) {
                currentUri += "/";
            }
            locations.add(currentUri + "uploads/");
            locations.add(currentUri + "backend/uploads/");
        } catch (Exception ignored) {
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(locations.toArray(new String[0]))
                .setCachePeriod(3600);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
