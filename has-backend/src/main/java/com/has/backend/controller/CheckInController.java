package com.has.backend.controller;

import com.has.backend.dto.CheckInFromReservationRequest;
import com.has.backend.dto.CheckInRequest;
import com.has.backend.entity.CheckIn;
import com.has.backend.entity.Guest;
import com.has.backend.service.CheckInService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/checkins")
@PreAuthorize("hasRole('RECEPTIONIST')")
public class CheckInController {
    private final CheckInService service;

    public CheckInController(CheckInService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CheckIn> processCheckIn(@Valid @RequestBody CheckInRequest request) {
        Guest guest = new Guest();
        guest.setName(request.getName());
        guest.setContactNumber(request.getContactNumber());
        guest.setArrivalDate(request.getArrivalDate());
        guest.setExpectedCheckOutDate(request.getExpectedCheckOutDate());

        CheckIn checkIn = service.processCheckIn(guest, request.getRoomType(), request.getAdvancePayment());
        return ResponseEntity.status(HttpStatus.CREATED).body(checkIn);
    }

    @PostMapping("/from-reservation")
    public ResponseEntity<CheckIn> processCheckInFromReservation(
            @Valid @RequestBody CheckInFromReservationRequest request) {
        CheckIn checkIn = service.processCheckIn(request.getTokenNumber(), request.getAdvancePayment());
        return ResponseEntity.status(HttpStatus.CREATED).body(checkIn);
    }

    @GetMapping("/{tokenNumber}")
    public ResponseEntity<CheckIn> getCheckIn(@PathVariable String tokenNumber) {
        return ResponseEntity.ok(service.getCheckInByToken(tokenNumber));
    }

    @GetMapping
    public ResponseEntity<List<CheckIn>> getAllCheckIns() {
        return ResponseEntity.ok(service.getAllCheckIns());
    }
}
