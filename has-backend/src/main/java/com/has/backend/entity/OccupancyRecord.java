package com.has.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "occupancy_records")
public class OccupancyRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recordId;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    private Double occupancyRate;
    private String month;
    private Double revisedTariff;
}
