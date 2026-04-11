package com.has.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public class CateringOrderRequest {

    @NotBlank
    private String tokenNumber;

    @NotBlank
    private String foodItemName;

    @Min(1)
    private int quantity;

    @PositiveOrZero
    private double charges;

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public String getFoodItemName() { return foodItemName; }
    public void setFoodItemName(String foodItemName) { this.foodItemName = foodItemName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getCharges() { return charges; }
    public void setCharges(double charges) { this.charges = charges; }
}
