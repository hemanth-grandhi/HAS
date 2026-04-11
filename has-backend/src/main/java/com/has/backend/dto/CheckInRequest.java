package com.has.backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/**
 * Request body for POST /api/checkins (walk-in check-in).
 * Combines guest details and check-in parameters into one JSON body.
 */
public class CheckInRequest {

    // --- Guest fields ---
    @NotBlank(message = "Name cannot be empty")
    private String name;

    @NotBlank(message = "Contact number cannot be empty")
    @Size(min = 10, max = 15, message = "Contact number must be between 10 and 15 characters")
    private String contactNumber;

    @NotNull(message = "Arrival date cannot be null")
    private LocalDate arrivalDate;

    @NotNull(message = "Expected check-out date cannot be null")
    private LocalDate expectedCheckOutDate;

    // --- Check-in fields ---
    @NotBlank(message = "Room type cannot be empty")
    private String roomType;

    @NotNull(message = "Advance payment cannot be null")
    @PositiveOrZero(message = "Advance payment must be zero or positive")
    private Double advancePayment;

    // Getters and setters

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public LocalDate getArrivalDate() { return arrivalDate; }
    public void setArrivalDate(LocalDate arrivalDate) { this.arrivalDate = arrivalDate; }

    public LocalDate getExpectedCheckOutDate() { return expectedCheckOutDate; }
    public void setExpectedCheckOutDate(LocalDate expectedCheckOutDate) { this.expectedCheckOutDate = expectedCheckOutDate; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public Double getAdvancePayment() { return advancePayment; }
    public void setAdvancePayment(Double advancePayment) { this.advancePayment = advancePayment; }
}
