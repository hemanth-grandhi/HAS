package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

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
                .orElseThrow(() -> new RuntimeException("Check-in not found for token: " + tokenNumber));

        CateringOrder order = new CateringOrder();
        order.setCheckIn(checkIn);
        order.setTokenNumber(tokenNumber);
        order.setFoodItemName(foodItem);
        order.setQuantity(quantity);
        order.setCharges(charges);
        order.setDateTime(LocalDateTime.now());

        return cateringRepo.save(order);
    }

    public List<CateringOrder> getOrdersByToken(String tokenNumber) {
        return cateringRepo.findByTokenNumber(tokenNumber);
    }

    public List<CateringOrder> getAllOrders() {
        return cateringRepo.findAll();
    }
}
