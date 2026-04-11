package com.has.backend.controller;

import com.has.backend.entity.Guest;
import com.has.backend.service.GuestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/guests")
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMINISTRATOR')")
public class GuestController {
    private final GuestService service;

    public GuestController(GuestService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Guest>> getAllGuests() {
        return ResponseEntity.ok(service.getAllGuests());
    }

    @GetMapping("/{guestId}")
    public ResponseEntity<Guest> getGuestById(@PathVariable Long guestId) {
        return ResponseEntity.ok(service.getGuestById(guestId));
    }

    @PutMapping("/{guestId}")
    public ResponseEntity<Guest> updateGuest(@PathVariable Long guestId, @RequestBody Guest guestData) {
        return ResponseEntity.ok(service.updateGuest(guestId, guestData));
    }
}
