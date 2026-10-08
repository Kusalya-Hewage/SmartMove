package com.smartmove.smartmove.repository;

import com.smartmove.smartmove.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    boolean existsByTripTripIdAndSeatNumber(
            Long tripId,
            String seatNumber
    );
    boolean existsByPassengerPassengerIdAndTripTripId(
            Long passengerId,
            Long tripId
    );

    List<Ticket> findByTripTripId(Long tripId);

    List<Ticket> findByPassengerPassengerId(Long passengerId);

    List<Ticket> findByTicketStatus(String ticketStatus);
}
