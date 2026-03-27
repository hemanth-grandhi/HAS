package com.has.backend.controller;

import com.has.backend.entity.*;
import com.has.backend.service.*;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/frequent-guests")
@RequiredArgsConstructor
public class FrequentGuestController {
    private final FrequentGuestService service;

    @PostMapping("/register/{guestId}")
    public FrequentGuest registerFrequentGuest(@PathVariable Long guestId) {
        return service.registerFrequentGuest(guestId);
    }
}
