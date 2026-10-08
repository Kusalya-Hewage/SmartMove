package com.smartmove.smartmove.report;

import com.smartmove.smartmove.report.dto.DriverPerformanceDTO;
import com.smartmove.smartmove.report.dto.MostUsedRouteDTO;
import com.smartmove.smartmove.report.dto.PassengerTravelHistoryDTO;
import com.smartmove.smartmove.report.dto.PaymentSummaryDTO;
import com.smartmove.smartmove.report.dto.RevenueByMonthDTO;
import com.smartmove.smartmove.report.dto.RevenueByRouteDTO;
import com.smartmove.smartmove.report.dto.RouteRatingDTO;
import com.smartmove.smartmove.report.dto.VehicleMaintenanceDTO;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // Most used routes
    @GetMapping("/most-used-routes")
    public ResponseEntity<List<MostUsedRouteDTO>>
    getMostUsedRoutes() {

        return ResponseEntity.ok(
                reportService.getMostUsedRoutes()
        );
    }

    // Revenue by route
    @GetMapping("/revenue-by-route")
    public ResponseEntity<List<RevenueByRouteDTO>>
    getRevenueByRoute() {

        return ResponseEntity.ok(
                reportService.getRevenueByRoute()
        );
    }

    // Revenue by month
    @GetMapping("/revenue-by-month")
    public ResponseEntity<List<RevenueByMonthDTO>>
    getRevenueByMonth() {

        return ResponseEntity.ok(
                reportService.getRevenueByMonth()
        );
    }

    // Passenger travel history
    @GetMapping("/passenger-travel-history/{passengerId}")
    public ResponseEntity<List<PassengerTravelHistoryDTO>>
    getPassengerTravelHistory(
            @PathVariable Long passengerId) {

        return ResponseEntity.ok(
                reportService.getPassengerTravelHistory(
                        passengerId
                )
        );
    }

    // Vehicle maintenance cost
    @GetMapping("/vehicle-maintenance-cost")
    public ResponseEntity<List<VehicleMaintenanceDTO>>
    getVehicleMaintenanceCost() {

        return ResponseEntity.ok(
                reportService.getVehicleMaintenanceCost()
        );
    }

    // Driver performance
    @GetMapping("/driver-performance")
    public ResponseEntity<List<DriverPerformanceDTO>>
    getDriverPerformance() {

        return ResponseEntity.ok(
                reportService.getDriverPerformance()
        );
    }

    // Route ratings
    @GetMapping("/route-ratings")
    public ResponseEntity<List<RouteRatingDTO>>
    getRouteRatings() {

        return ResponseEntity.ok(
                reportService.getRouteRatings()
        );
    }

    // Payment summary
    @GetMapping("/payment-summary")
    public ResponseEntity<List<PaymentSummaryDTO>>
    getPaymentSummary() {

        return ResponseEntity.ok(
                reportService.getPaymentSummary()
        );
    }
}