package com.has.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Request body for POST /api/reservations.
 * Combines guest details and reservation parameters into one JSON body.
 */
public class ReservationRequest {

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

    // --- Reservation fields ---
    @NotBlank(message = "Room type cannot be empty")
    private String roomType;

    @NotNull(message = "Start date cannot be null")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @NotNull(message = "End date cannot be null")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

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

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
}
