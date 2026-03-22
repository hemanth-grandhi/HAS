package com.has.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
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

    @NotBlank(message = "Room type cannot be empty")
    private String roomType;
}
