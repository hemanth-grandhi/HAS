package com.has.backend.controller;

import com.has.backend.entity.*;
import com.has.backend.service.*;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/catering")
@RequiredArgsConstructor
public class CateringController {
    private final CateringService service;

    @PostMapping("/log")
    public CateringOrder logConsumption(@RequestParam String tokenNumber, @RequestParam String foodItemName, @RequestParam int quantity, @RequestParam double charges) {
        return service.logConsumption(tokenNumber, foodItemName, quantity, charges);
    }
}
