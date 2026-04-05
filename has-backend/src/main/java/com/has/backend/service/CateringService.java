package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CateringService {
    private final CateringOrderRepository cateringRepo;

    public CateringService(CateringOrderRepository cateringRepo) {
        this.cateringRepo = cateringRepo;
    }

    public CateringOrder logConsumption(String tokenNumber, String foodItem, int quantity, double charges) {
        CateringOrder order = new CateringOrder();
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
