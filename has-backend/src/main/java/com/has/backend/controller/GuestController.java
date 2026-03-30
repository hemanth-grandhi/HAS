package com.has.backend.controller;

import com.has.backend.entity.Guest;
import com.has.backend.service.GuestService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/guests")
public class GuestController {
    private final GuestService service;

    public GuestController(GuestService service) {
        this.service = service;
    }

    @GetMapping
    public List<Guest> getAllGuests() {
        return service.getAllGuests();
    }

    @GetMapping("/{guestId}")
    public Guest getGuestById(@PathVariable Long guestId) {
        return service.getGuestById(guestId);
    }

    @PutMapping("/{guestId}")
    public Guest updateGuest(@PathVariable Long guestId, @RequestBody Guest guestData) {
        return service.updateGuest(guestId, guestData);
    }
}
