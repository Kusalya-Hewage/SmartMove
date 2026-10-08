package com.smartmove.smartmove.report;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ReportRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public List<Object[]> getMostUsedRoutes() {

        String sql = """
                SELECT
                    r.ROUTE_ID,
                    r.ROUTE_NAME,
                    r.SOURCE_LOCATION,
                    r.DESTINATION_LOCATION,
                    COUNT(t.TICKET_ID) AS TOTAL_TICKETS
                FROM ROUTE r
                JOIN TRIP tr
                    ON r.ROUTE_ID = tr.ROUTE_ID
                JOIN TICKET t
                    ON tr.TRIP_ID = t.TRIP_ID
                WHERE t.TICKET_STATUS <> 'CANCELLED'
                GROUP BY
                    r.ROUTE_ID,
                    r.ROUTE_NAME,
                    r.SOURCE_LOCATION,
                    r.DESTINATION_LOCATION
                ORDER BY TOTAL_TICKETS DESC
                """;

        Query query = entityManager.createNativeQuery(sql);

        return query.getResultList();
    }



    public List<Object[]> getRevenueByRoute() {

        String sql = """
                SELECT
                    r.ROUTE_ID,
                    r.ROUTE_NAME,
                    r.SOURCE_LOCATION,
                    r.DESTINATION_LOCATION,
                    COUNT(t.TICKET_ID) AS TICKETS_SOLD,
                    NVL(SUM(t.TICKET_PRICE), 0) AS TOTAL_REVENUE
                FROM ROUTE r
                JOIN TRIP tr
                    ON r.ROUTE_ID = tr.ROUTE_ID
                JOIN TICKET t
                    ON tr.TRIP_ID = t.TRIP_ID
                WHERE t.TICKET_STATUS <> 'CANCELLED'
                GROUP BY
                    r.ROUTE_ID,
                    r.ROUTE_NAME,
                    r.SOURCE_LOCATION,
                    r.DESTINATION_LOCATION
                ORDER BY TOTAL_REVENUE DESC
                """;

        Query query = entityManager.createNativeQuery(sql);

        return query.getResultList();
    }

    public List<Object[]> getRevenueByMonth() {

        String sql = """
                SELECT
                    TO_CHAR(t.BOOKING_DATE, 'YYYY-MM') AS BOOKING_MONTH,
                    COUNT(t.TICKET_ID) AS TOTAL_TICKETS,
                    NVL(SUM(t.TICKET_PRICE), 0) AS TOTAL_REVENUE
                FROM TICKET t
                WHERE t.TICKET_STATUS <> 'CANCELLED'
                GROUP BY TO_CHAR(t.BOOKING_DATE, 'YYYY-MM')
                ORDER BY BOOKING_MONTH
                """;

        Query query = entityManager.createNativeQuery(sql);

        return query.getResultList();
    }

    public List<Object[]> getPassengerTravelHistory(
            Long passengerId) {

        String sql = """
                SELECT
                    p.PASSENGER_ID,
                    p.FULL_NAME,
                    t.TICKET_ID,
                    tr.TRIP_DATE,
                    r.ROUTE_NAME,
                    r.SOURCE_LOCATION,
                    r.DESTINATION_LOCATION,
                    t.SEAT_NUMBER,
                    t.TICKET_PRICE,
                    t.TICKET_STATUS
                FROM PASSENGER p
                JOIN TICKET t
                    ON p.PASSENGER_ID = t.PASSENGER_ID
                JOIN TRIP tr
                    ON t.TRIP_ID = tr.TRIP_ID
                JOIN ROUTE r
                    ON tr.ROUTE_ID = r.ROUTE_ID
                WHERE p.PASSENGER_ID = :passengerId
                ORDER BY tr.TRIP_DATE DESC
                """;

        Query query = entityManager.createNativeQuery(sql);

        query.setParameter(
                "passengerId",
                passengerId
        );

        return query.getResultList();
    }



    public List<Object[]> getVehicleMaintenanceCost() {

        String sql = """
                SELECT
                    v.VEHICLE_ID,
                    v.REGISTRATION_NO,
                    v.BRAND,
                    v.MODEL,
                    COUNT(m.MAINTENANCE_ID) AS MAINTENANCE_COUNT,
                    NVL(SUM(m.COST), 0) AS TOTAL_MAINTENANCE_COST
                FROM VEHICLE v
                LEFT JOIN MAINTENANCE m
                    ON v.VEHICLE_ID = m.VEHICLE_ID
                GROUP BY
                    v.VEHICLE_ID,
                    v.REGISTRATION_NO,
                    v.BRAND,
                    v.MODEL
                ORDER BY TOTAL_MAINTENANCE_COST DESC
                """;

        Query query = entityManager.createNativeQuery(sql);

        return query.getResultList();
    }


    public List<Object[]> getDriverPerformance() {

        String sql = """
                SELECT
                    d.DRIVER_ID,
                    d.FIRST_NAME || ' ' || d.LAST_NAME AS DRIVER_NAME,
                    COUNT(tr.TRIP_ID) AS TOTAL_TRIPS,
                    SUM(
                        CASE
                            WHEN tr.TRIP_STATUS = 'COMPLETED'
                            THEN 1
                            ELSE 0
                        END
                    ) AS COMPLETED_TRIPS,
                    SUM(
                        CASE
                            WHEN tr.TRIP_STATUS = 'CANCELLED'
                            THEN 1
                            ELSE 0
                        END
                    ) AS CANCELLED_TRIPS
                FROM DRIVER d
                LEFT JOIN TRIP tr
                    ON d.DRIVER_ID = tr.DRIVER_ID
                GROUP BY
                    d.DRIVER_ID,
                    d.FIRST_NAME,
                    d.LAST_NAME
                ORDER BY TOTAL_TRIPS DESC
                """;

        Query query = entityManager.createNativeQuery(sql);

        return query.getResultList();
    }


    public List<Object[]> getRouteRatings() {

        String sql = """
                SELECT
                    r.ROUTE_ID,
                    r.ROUTE_NAME,
                    COUNT(f.FEEDBACK_ID) AS TOTAL_FEEDBACK,
                    ROUND(AVG(f.RATING), 2) AS AVERAGE_RATING,
                    MIN(f.RATING) AS LOWEST_RATING,
                    MAX(f.RATING) AS HIGHEST_RATING
                FROM ROUTE r
                JOIN TRIP tr
                    ON r.ROUTE_ID = tr.ROUTE_ID
                JOIN FEEDBACK f
                    ON tr.TRIP_ID = f.TRIP_ID
                GROUP BY
                    r.ROUTE_ID,
                    r.ROUTE_NAME
                ORDER BY r.ROUTE_ID
                """;

        Query query = entityManager.createNativeQuery(sql);

        return query.getResultList();
    }



    public List<Object[]> getPaymentSummary() {

        String sql = """
                SELECT
                    PAYMENT_METHOD,
                    PAYMENT_STATUS,
                    COUNT(PAYMENT_ID) AS PAYMENT_COUNT,
                    NVL(SUM(AMOUNT), 0) AS TOTAL_AMOUNT
                FROM PAYMENT
                GROUP BY
                    PAYMENT_METHOD,
                    PAYMENT_STATUS
                ORDER BY
                    PAYMENT_METHOD,
                    PAYMENT_STATUS
                """;

        Query query = entityManager.createNativeQuery(sql);

        return query.getResultList();
    }
}