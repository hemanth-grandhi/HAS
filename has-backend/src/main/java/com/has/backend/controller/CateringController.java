package com.has.backend.controller;

import com.has.backend.dto.CateringOrderRequest;
import com.has.backend.entity.*;
import com.has.backend.service.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/catering")
@PreAuthorize("hasRole('CATERING_MANAGER')")
public class CateringController {
    private final CateringService service;

    public CateringController(CateringService service) {
        this.service = service;
    }

    @PostMapping("/log")
    public ResponseEntity<CateringOrder> logConsumption(@Valid @RequestBody CateringOrderRequest request) {
        CateringOrder order = service.logConsumption(
                request.getTokenNumber(),
                request.getFoodItemName(),
                request.getQuantity(),
                request.getCharges()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/{tokenNumber}")
    public ResponseEntity<List<CateringOrder>> getOrdersByToken(@PathVariable String tokenNumber) {
        return ResponseEntity.ok(service.getOrdersByToken(tokenNumber));
    }

    @GetMapping
    public ResponseEntity<List<CateringOrder>> getAllOrders() {
        return ResponseEntity.ok(service.getAllOrders());
    }
}
