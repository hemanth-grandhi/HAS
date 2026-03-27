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
}
