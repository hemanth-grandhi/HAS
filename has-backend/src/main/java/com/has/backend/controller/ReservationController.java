package com.has.backend.controller;

import com.has.backend.entity.*;
import com.has.backend.service.*;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationService service;

    public ReservationController(ReservationService service) {
        this.service = service;
    }

    @PostMapping
    public String makeReservation(@Valid @RequestBody Guest guest,
            @RequestParam String roomType) {
        return service.makeReservation(guest, roomType, LocalDateTime.now());
    }

    @GetMapping("/{tokenNumber}")
    public Reservation getReservation(@PathVariable String tokenNumber) {
        return service.getReservationByToken(tokenNumber);
    }

    @GetMapping
    public List<Reservation> getAllReservations() {
        return service.getAllReservations();
    }

    @DeleteMapping("/{tokenNumber}")
    public void cancelReservation(@PathVariable String tokenNumber) {
        service.cancelReservation(tokenNumber);
    }
}
