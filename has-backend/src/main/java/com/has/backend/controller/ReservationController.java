package com.has.backend.controller;

import com.has.backend.entity.*;
import com.has.backend.service.*;
import org.springframework.format.annotation.DateTimeFormat;
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
            @RequestParam String roomType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return service.makeReservation(guest, roomType, startDate, endDate);
    }

    @GetMapping("/{tokenNumber}")
    public Reservation getReservation(@PathVariable String tokenNumber) {
        return service.getReservationByToken(tokenNumber);
    }

    @GetMapping
    public List<Reservation> getAllReservations() {
        return service.getAllReservations();
    }

    @GetMapping("/lookup")
    public List<Reservation> lookupReservations(
            @RequestParam String name,
            @RequestParam String contactNumber
    ) {
        return service.findReservationsByGuestDetails(name, contactNumber);
    }

    @DeleteMapping("/{tokenNumber}")
    public void cancelReservation(@PathVariable String tokenNumber) {
        service.cancelReservation(tokenNumber);
    }
}
