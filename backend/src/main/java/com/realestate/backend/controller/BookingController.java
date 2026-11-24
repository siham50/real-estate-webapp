package com.realestate.backend.controller;

import com.realestate.backend.dto.BookingDTO;
import com.realestate.backend.entity.Booking;
import com.realestate.backend.entity.enums.BookingStatus;
import com.realestate.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BookingController {

    private static final Logger log = LoggerFactory.getLogger(BookingController.class);
    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@RequestBody Booking request) {
        log.info("Requête POST /api/bookings reçue : client={}, property={}, availability={}",
                request.getResolvedClientId(), request.getResolvedPropertyId(), request.getResolvedAvailabilityId());
        BookingDTO created = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(bookingService.getBookingsByClientId(clientId));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(bookingService.getBookingsByOwnerId(ownerId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingDTO> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "reason", required = false) String reason) {
        try {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.trim().toUpperCase());
            return ResponseEntity.ok(bookingService.updateBookingStatus(id, bookingStatus, reason));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(
            @PathVariable Long id,
            @RequestParam(value = "reason", required = false) String reason) {
        try {
            return ResponseEntity.ok(bookingService.cancelBooking(id, reason));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<BookingDTO> rescheduleBooking(
            @PathVariable Long id,
            @RequestParam("newAvailabilityId") Long newAvailabilityId) {
        try {
            return ResponseEntity.ok(bookingService.rescheduleBooking(id, newAvailabilityId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/respond-reschedule")
    public ResponseEntity<BookingDTO> respondToReschedule(
            @PathVariable Long id,
            @RequestParam("accept") boolean accept) {
        try {
            return ResponseEntity.ok(bookingService.respondToReschedule(id, accept));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
