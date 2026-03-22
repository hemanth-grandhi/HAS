package com.has.backend.entity;

import jakarta.persistence.*;

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

    public Long getBillId() {
        return billId;
    }

    public void setBillId(Long billId) {
        this.billId = billId;
    }

    public CheckIn getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(CheckIn checkIn) {
        this.checkIn = checkIn;
    }

    public Double getRoomCharges() {
        return roomCharges;
    }

    public void setRoomCharges(Double roomCharges) {
        this.roomCharges = roomCharges;
    }

    public Double getCateringCharges() {
        return cateringCharges;
    }

    public void setCateringCharges(Double cateringCharges) {
        this.cateringCharges = cateringCharges;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public Double getAdvancePayment() {
        return advancePayment;
    }

    public void setAdvancePayment(Double advancePayment) {
        this.advancePayment = advancePayment;
    }

    public Double getBalancePayable() {
        return balancePayable;
    }

    public void setBalancePayable(Double balancePayable) {
        this.balancePayable = balancePayable;
    }
}
