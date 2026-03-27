package com.has.backend.controller;

import com.has.backend.entity.CheckIn;
import com.has.backend.entity.Guest;
import com.has.backend.service.CheckInService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkins")
public class CheckInController {
    private final CheckInService service;

    // Inject the service via constructor
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
}

