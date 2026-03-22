package com.has.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "catering_orders")
public class CateringOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "check_in_id", nullable = false)
    private CheckIn checkIn;

    private String foodItemName;
    private Integer quantity;
    private Double charges;
    private LocalDateTime dateTime;
}
