package com.smartmove.smartmove.repository;

import com.smartmove.smartmove.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTicketTicketId(Long ticketId);

    Optional<Payment> findByTransactionReference(
            String transactionReference
    );

    List<Payment> findByPaymentStatus(String paymentStatus);

    List<Payment> findByPaymentMethod(String paymentMethod);
}
