package com.has.backend.controller;

import com.has.backend.entity.Bill;
import com.has.backend.service.BillingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/billing")
public class BillingController {
    private final BillingService service;

    public BillingController(BillingService service) {
        this.service = service;
    }

    @PostMapping("/checkout/{tokenNumber}")
    public Bill processCheckout(@PathVariable String tokenNumber) {
        return service.processCheckout(tokenNumber);
    }

    @PostMapping("/confirm-payment/{billId}")
    public void confirmPayment(@PathVariable Long billId) {
        service.confirmPayment(billId);
    }

    @GetMapping("/{billId}")
    public Bill getBillById(@PathVariable Long billId) {
        return service.getBillById(billId);
    }

    @GetMapping("/by-token/{tokenNumber}")
    public Bill getBillByToken(@PathVariable String tokenNumber) {
        return service.getBillByToken(tokenNumber);
    }
}
