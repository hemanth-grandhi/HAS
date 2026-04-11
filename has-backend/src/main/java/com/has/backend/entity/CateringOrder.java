package com.has.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "catering_orders")
public class CateringOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "check_in_id", nullable = false)
    private CheckIn checkIn;

    private String tokenNumber;

    private String foodItemName;
    private Integer quantity;
    private Double charges;
    private LocalDateTime dateTime;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public CheckIn getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(CheckIn checkIn) {
        this.checkIn = checkIn;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public String getFoodItemName() {
        return foodItemName;
    }

    public void setFoodItemName(String foodItemName) {
        this.foodItemName = foodItemName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getCharges() {
        return charges;
    }

    public void setCharges(Double charges) {
        this.charges = charges;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }
}
