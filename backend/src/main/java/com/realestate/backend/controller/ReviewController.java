package com.realestate.backend.controller;

import com.realestate.backend.dto.ReviewDTO;
import com.realestate.backend.entity.Review;
import com.realestate.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@RequestBody Review review) {
        try {
            ReviewDTO created = reviewService.createReview(review);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/target/{targetUserId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByTargetUser(@PathVariable Long targetUserId) {
        return ResponseEntity.ok(reviewService.getReviewsByTargetUserId(targetUserId));
    }
}
