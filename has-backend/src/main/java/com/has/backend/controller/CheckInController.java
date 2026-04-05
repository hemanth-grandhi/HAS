package com.has.backend.controller;

import com.has.backend.entity.CheckIn;
import com.has.backend.entity.Guest;
import com.has.backend.service.CheckInService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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
    public CheckIn processCheckIn(
            @Valid @RequestBody Guest guestData,
            @RequestParam String roomType,
            @RequestParam Double advancePayment
    ) {
        return service.processCheckIn(guestData, roomType, advancePayment);
    }

    @GetMapping("/{tokenNumber}")
    public CheckIn getCheckIn(@PathVariable String tokenNumber) {
        return service.getCheckInByToken(tokenNumber);
    }

    @GetMapping
    public List<CheckIn> getAllCheckIns() {
        return service.getAllCheckIns();
    }
}
