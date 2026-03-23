package com.has.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "guests")
public class Guest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long guestId;

    @NotBlank(message = "Name cannot be empty")
    private String name;

    @NotBlank(message = "Contact number cannot be empty")
    @Size(min = 10, max = 15, message = "Contact number must be between 10 and 15 characters")
    private String contactNumber;

    @NotNull(message = "Arrival date cannot be null")
    private LocalDate arrivalDate;

    @NotNull(message = "Expected duration cannot be null")
    @Min(value = 1, message = "Expected duration must be at least 1 day")
    private Integer expectedDuration;

    public Long getGuestId() {
        return guestId;
    }

    public void setGuestId(Long guestId) {
        this.guestId = guestId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public LocalDate getArrivalDate() {
        return arrivalDate;
    }

    public void setArrivalDate(LocalDate arrivalDate) {
        this.arrivalDate = arrivalDate;
    }

    public Integer getExpectedDuration() {
        return expectedDuration;
    }

    public void setExpectedDuration(Integer expectedDuration) {
        this.expectedDuration = expectedDuration;
    }

}
