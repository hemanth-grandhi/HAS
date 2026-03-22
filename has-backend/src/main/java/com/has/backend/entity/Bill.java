package com.has.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "bills")
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long billId;

    @OneToOne
    @JoinColumn(name = "check_in_id", nullable = false)
    private CheckIn checkIn;

    private Double roomCharges;
    private Double cateringCharges;
    private Double discountAmount;
    private Double advancePayment;
    private Double balancePayable;
}
