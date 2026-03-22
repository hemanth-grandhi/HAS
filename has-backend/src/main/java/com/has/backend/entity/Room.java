package com.has.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    private String occupancyType; // Single, Double
    private String acStatus; // AC, Non-AC
    private Double baseTariff;
    private Double currentTariff;

    // AVAILABLE, RESERVED, OCCUPIED, VACANT
    private String availabilityStatus;
}
