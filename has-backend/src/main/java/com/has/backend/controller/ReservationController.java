package com.has.backend.controller;

import com.has.backend.entity.*;
import com.has.backend.service.*;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService service;

    @PostMapping
    public String makeReservation(@Valid @RequestBody Guest guest,
                                  @RequestParam String roomType) {
        return service.makeReservation(guest, roomType, LocalDateTime.now());
    }
}
