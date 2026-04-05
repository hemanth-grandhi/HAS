package com.has.backend.controller;

import com.has.backend.entity.*;
import com.has.backend.service.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/frequent-guests")
public class FrequentGuestController {
    private final FrequentGuestService service;

    public FrequentGuestController(FrequentGuestService service) {
        this.service = service;
    }

    @PostMapping("/register/{guestId}")
    public FrequentGuest registerFrequentGuest(@PathVariable Long guestId) {
        return service.registerFrequentGuest(guestId);
    }

    @GetMapping("/{frequentGuestId}")
    public FrequentGuest getFrequentGuest(@PathVariable int frequentGuestId) {
        return service.getFrequentGuest(frequentGuestId);
    }

    @PutMapping("/{frequentGuestId}/rewards")
    public FrequentGuest updateRewards(@PathVariable int frequentGuestId,
            @RequestParam(required = false) Integer rewardPoints,
            @RequestParam(required = false) String discountTier) {
        return service.updateRewards(frequentGuestId, rewardPoints, discountTier);
    }
}
