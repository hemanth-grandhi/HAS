package com.has.backend.controller;

import com.has.backend.entity.Bill;
import com.has.backend.service.BillingService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing")
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMINISTRATOR')")
public class BillingController {
    private final BillingService service;

    public BillingController(BillingService service) {
        this.service = service;
    }

    @PostMapping("/checkout/{tokenNumber}")
    public ResponseEntity<Bill> processCheckout(
            @PathVariable String tokenNumber,
            @RequestParam(defaultValue = "false") boolean registerFrequentGuest) {
        return ResponseEntity.ok(service.processCheckout(tokenNumber, registerFrequentGuest));
    }

    @PatchMapping("/confirm-payment/{billId}")
    public ResponseEntity<Void> confirmPayment(@PathVariable Long billId) {
        service.confirmPayment(billId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{billId}")
    public ResponseEntity<Bill> getBillById(@PathVariable Long billId) {
        return ResponseEntity.ok(service.getBillById(billId));
    }

    @GetMapping("/by-token/{tokenNumber}")
    public ResponseEntity<Bill> getBillByToken(@PathVariable String tokenNumber) {
        return ResponseEntity.ok(service.getBillByToken(tokenNumber));
    }

    @GetMapping(value = "/print/{billId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> printBill(@PathVariable Long billId) {
        return ResponseEntity.ok(service.generatePrintableBill(billId));
    }
}
