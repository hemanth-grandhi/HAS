package com.has.backend.dto;

import jakarta.validation.constraints.NotNull;

public class TariffRevisionRequest {

    @NotNull
    private Double percentage; // positive = increase, negative = decrease

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
}
