package com.has.backend.controller;

import com.has.backend.dto.TariffRevisionRequest;
import com.has.backend.entity.OccupancyRecord;
import com.has.backend.entity.TariffRevisionPlan;
import com.has.backend.service.OccupancyService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/occupancy")
@PreAuthorize("hasRole('HOTEL_MANAGER')")
public class OccupancyController {
    private final OccupancyService service;

    public OccupancyController(OccupancyService service) {
        this.service = service;
    }

    @GetMapping("/report")
    public ResponseEntity<List<OccupancyRecord>> getOccupancyReport() {
        return ResponseEntity.ok(service.getOccupancyReport());
    }

    @GetMapping("/realtime")
    public ResponseEntity<Map<String, Object>> getRealTimeOccupancy() {
        return ResponseEntity.ok(service.calculateRealTimeOccupancy());
    }

    @GetMapping("/report/monthly-average")
    public ResponseEntity<Map<String, Object>> getMonthlyAverage(@RequestParam String month) {
        return ResponseEntity.ok(service.getAverageOccupancyForMonth(month));
    }

    @PutMapping("/tariff/{roomId}")
    public ResponseEntity<Void> reviseTariff(
            @PathVariable Long roomId,
            @Valid @RequestBody TariffRevisionRequest request) {
        service.reviseTariff(roomId, request.getPercentage());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/tariff/{roomId}/schedule-next-week")
    public ResponseEntity<TariffRevisionPlan> scheduleTariffRevision(
            @PathVariable Long roomId,
            @Valid @RequestBody TariffRevisionRequest request) {
        return ResponseEntity.ok(service.scheduleTariffForNextWeek(roomId, request.getPercentage()));
    }

    @GetMapping("/tariff/plans")
    public ResponseEntity<List<TariffRevisionPlan>> getTariffPlans() {
        return ResponseEntity.ok(service.getTariffRevisionPlans());
    }
}
