package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class CateringService {
    private final CateringOrderRepository cateringRepo;
    private final CheckInRepository checkInRepo;

    public CateringService(CateringOrderRepository cateringRepo, CheckInRepository checkInRepo) {
        this.cateringRepo = cateringRepo;
        this.checkInRepo = checkInRepo;
    }

    public CateringOrder logConsumption(String tokenNumber, String foodItem, int quantity, double charges) {
        CheckIn checkIn = checkInRepo.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new RuntimeException("Invalid Token"));

        CateringOrder order = new CateringOrder();
        order.setCheckIn(checkIn);
        order.setFoodItemName(foodItem);
        order.setQuantity(quantity);
        order.setCharges(charges);
        order.setDateTime(LocalDateTime.now());

        return cateringRepo.save(order);
    }
}
