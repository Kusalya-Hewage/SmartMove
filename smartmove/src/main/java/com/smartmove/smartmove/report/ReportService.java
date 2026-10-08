package com.smartmove.smartmove.report;

import com.smartmove.smartmove.report.dto.DriverPerformanceDTO;
import com.smartmove.smartmove.report.dto.MostUsedRouteDTO;
import com.smartmove.smartmove.report.dto.PassengerTravelHistoryDTO;
import com.smartmove.smartmove.report.dto.PaymentSummaryDTO;
import com.smartmove.smartmove.report.dto.RevenueByMonthDTO;
import com.smartmove.smartmove.report.dto.RevenueByRouteDTO;
import com.smartmove.smartmove.report.dto.RouteRatingDTO;
import com.smartmove.smartmove.report.dto.VehicleMaintenanceDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public List<MostUsedRouteDTO> getMostUsedRoutes() {

        return reportRepository.getMostUsedRoutes()
                .stream()
                .map(row -> new MostUsedRouteDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        ((Number) row[4]).longValue()
                ))
                .toList();
    }

    public List<RevenueByRouteDTO> getRevenueByRoute() {

        return reportRepository.getRevenueByRoute()
                .stream()
                .map(row -> new RevenueByRouteDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        ((Number) row[4]).longValue(),
                        (BigDecimal) row[5]
                ))
                .toList();
    }

    public List<RevenueByMonthDTO> getRevenueByMonth() {

        return reportRepository.getRevenueByMonth()
                .stream()
                .map(row -> new RevenueByMonthDTO(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        (BigDecimal) row[2]
                ))
                .toList();
    }

    public List<PassengerTravelHistoryDTO>
    getPassengerTravelHistory(Long passengerId) {

        return reportRepository
                .getPassengerTravelHistory(passengerId)
                .stream()
                .map(row -> new PassengerTravelHistoryDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        (java.sql.Date) row[3],
                        (String) row[4],
                        (String) row[5],
                        (String) row[6],
                        (String) row[7],
                        (BigDecimal) row[8],
                        (String) row[9]
                ))
                .toList();
    }

    public List<VehicleMaintenanceDTO>
    getVehicleMaintenanceCost() {

        return reportRepository
                .getVehicleMaintenanceCost()
                .stream()
                .map(row -> new VehicleMaintenanceDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        ((Number) row[4]).longValue(),
                        (BigDecimal) row[5]
                ))
                .toList();
    }

    public List<DriverPerformanceDTO>
    getDriverPerformance() {

        return reportRepository
                .getDriverPerformance()
                .stream()
                .map(row -> new DriverPerformanceDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        ((Number) row[3]).longValue(),
                        ((Number) row[4]).longValue()
                ))
                .toList();
    }

    public List<RouteRatingDTO> getRouteRatings() {

        return reportRepository
                .getRouteRatings()
                .stream()
                .map(row -> new RouteRatingDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        (BigDecimal) row[3],
                        ((Number) row[4]).intValue(),
                        ((Number) row[5]).intValue()
                ))
                .toList();
    }

    public List<PaymentSummaryDTO> getPaymentSummary() {

        return reportRepository
                .getPaymentSummary()
                .stream()
                .map(row -> new PaymentSummaryDTO(
                        (String) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        (BigDecimal) row[3]
                ))
                .toList();
    }
}