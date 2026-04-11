package com.has.backend.controller;

import com.has.backend.dto.ReservationRequest;
import com.has.backend.entity.*;
import com.has.backend.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationService service;

    public ReservationController(ReservationService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMINISTRATOR')")
    public ResponseEntity<String> makeReservation(@Valid @RequestBody ReservationRequest request) {
        Guest guest = new Guest();
        guest.setName(request.getName());
        guest.setContactNumber(request.getContactNumber());
        guest.setArrivalDate(request.getArrivalDate());
        guest.setExpectedCheckOutDate(request.getExpectedCheckOutDate());

        String token = service.makeReservation(guest, request.getRoomType(), request.getStartDate(), request.getEndDate());
        return ResponseEntity.status(HttpStatus.CREATED).body(token);
    }

    @GetMapping("/{tokenNumber}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMINISTRATOR')")
    public ResponseEntity<Reservation> getReservation(@PathVariable String tokenNumber) {
        return ResponseEntity.ok(service.getReservationByToken(tokenNumber));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMINISTRATOR')")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(service.getAllReservations());
    }

    @GetMapping("/lookup")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMINISTRATOR')")
    public ResponseEntity<List<Reservation>> lookupReservations(
            @RequestParam String name,
            @RequestParam String contactNumber) {
        return ResponseEntity.ok(service.findReservationsByGuestDetails(name, contactNumber));
    }

    @DeleteMapping("/{tokenNumber}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMINISTRATOR')")
    public ResponseEntity<Void> cancelReservation(@PathVariable String tokenNumber) {
        service.cancelReservation(tokenNumber);
        return ResponseEntity.noContent().build();
    }
}
