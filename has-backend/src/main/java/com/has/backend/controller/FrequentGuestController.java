package com.has.backend.controller;

import com.has.backend.entity.*;
import com.has.backend.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/frequent-guests")
public class FrequentGuestController {
    private final FrequentGuestService service;

    public FrequentGuestController(FrequentGuestService service) {
        this.service = service;
    }

    @PostMapping("/register/{guestId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMINISTRATOR')")
    public ResponseEntity<FrequentGuest> registerFrequentGuest(@PathVariable Long guestId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registerFrequentGuest(guestId));
    }

    @GetMapping("/{frequentGuestId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOTEL_MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<FrequentGuest> getFrequentGuest(@PathVariable int frequentGuestId) {
        return ResponseEntity.ok(service.getFrequentGuest(frequentGuestId));
    }

    @PutMapping("/{frequentGuestId}/rewards")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMINISTRATOR')")
    public ResponseEntity<FrequentGuest> updateRewards(
            @PathVariable int frequentGuestId,
            @RequestParam(required = false) Integer rewardPoints,
            @RequestParam(required = false) String discountTier) {
        return ResponseEntity.ok(service.updateRewards(frequentGuestId, rewardPoints, discountTier));
    }
}
