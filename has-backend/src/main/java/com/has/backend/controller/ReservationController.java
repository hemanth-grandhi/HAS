package com.has.backend.controller;

import com.has.backend.dto.ReservationRequest;
import com.has.backend.entity.*;
import com.has.backend.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.temporal.ChronoUnit;
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
        guest.setExpectedDuration((int) Math.max(1,
                ChronoUnit.DAYS.between(request.getArrivalDate(), request.getExpectedCheckOutDate())));
        guest.setRoomType(request.getRoomType());

        String token = service.makeReservation(guest, request.getRoomType(), request.getStartDate(), request.getEndDate());
        return ResponseEntity.status(HttpStatus.CREATED).body(token);
    }

    @GetMapping("/{reservationId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOTEL_MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<Reservation> getReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(service.getReservationById(reservationId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOTEL_MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(service.getAllReservations());
    }

    @GetMapping("/lookup")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOTEL_MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<List<Reservation>> lookupReservations(
            @RequestParam String name,
            @RequestParam String contactNumber) {
        return ResponseEntity.ok(service.findReservationsByGuestDetails(name, contactNumber));
    }

    @DeleteMapping("/{reservationId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMINISTRATOR')")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long reservationId) {
        service.cancelReservation(reservationId);
        return ResponseEntity.noContent().build();
    }
}
