package com.has.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tariff_revision_plans")
public class TariffRevisionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long planId;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    private Double percentage;
    private Double originalTariff;
    private Double revisedTariff;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private boolean applied;

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Double getOriginalTariff() {
        return originalTariff;
    }

    public void setOriginalTariff(Double originalTariff) {
        this.originalTariff = originalTariff;
    }

    public Double getRevisedTariff() {
        return revisedTariff;
    }

    public void setRevisedTariff(Double revisedTariff) {
        this.revisedTariff = revisedTariff;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDate getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public boolean isApplied() {
        return applied;
    }

    public void setApplied(boolean applied) {
        this.applied = applied;
    }
}
