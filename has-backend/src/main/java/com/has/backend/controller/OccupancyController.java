package com.has.backend.controller;

import com.has.backend.entity.OccupancyRecord;
import com.has.backend.service.OccupancyService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/occupancy")
@PreAuthorize("hasRole('HOTEL_MANAGER')")
public class OccupancyController {
    private final OccupancyService service;

    public OccupancyController(OccupancyService service) {
        this.service = service;
    }

    @GetMapping("/report")
    public List<OccupancyRecord> getOccupancyReport() {
        return service.getOccupancyReport();
    }

    @PutMapping("/tariff/{roomId}")
    public void reviseTariff(@PathVariable Long roomId, @RequestParam Double percentage) {
        service.reviseTariff(roomId, percentage);
    }
}
