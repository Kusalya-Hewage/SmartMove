package com.smartmove.smartmove.service;

import com.smartmove.smartmove.entity.Payment;
import com.smartmove.smartmove.entity.Ticket;
import com.smartmove.smartmove.repository.PaymentRepository;
import com.smartmove.smartmove.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TicketRepository ticketRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            TicketRepository ticketRepository) {

        this.paymentRepository = paymentRepository;
        this.ticketRepository = ticketRepository;
    }



    public List<Payment> getAllPayments() {

        return paymentRepository.findAll();
    }



    public Payment getPaymentById(Long id) {

        return paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found with ID: " + id
                        )
                );
    }



    public Payment getPaymentByTicket(Long ticketId) {

        return paymentRepository
                .findByTicketTicketId(ticketId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found for ticket ID: "
                                        + ticketId
                        )
                );
    }



    public Payment createPayment(
            Long ticketId,
            Payment paymentDetails) {

        // Find ticket
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Ticket not found with ID: " + ticketId
                        )
                );

        // Check whether ticket already has a payment
        if (paymentRepository
                .findByTicketTicketId(ticketId)
                .isPresent()) {

            throw new RuntimeException(
                    "This ticket already has a payment"
            );
        }

        // Set ticket
        paymentDetails.setTicket(ticket);

        // Set payment date automatically
        if (paymentDetails.getPaymentDate() == null) {

            paymentDetails.setPaymentDate(
                    LocalDateTime.now()
            );
        }

        // Default payment status
        if (paymentDetails.getPaymentStatus() == null) {

            paymentDetails.setPaymentStatus("PENDING");
        }

        return paymentRepository.save(paymentDetails);
    }



    public Payment updatePayment(
            Long id,
            Payment paymentDetails) {

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found with ID: " + id
                        )
                );

        payment.setAmount(
                paymentDetails.getAmount()
        );

        payment.setPaymentDate(
                paymentDetails.getPaymentDate()
        );

        payment.setPaymentMethod(
                paymentDetails.getPaymentMethod()
        );

        payment.setPaymentStatus(
                paymentDetails.getPaymentStatus()
        );

        payment.setTransactionReference(
                paymentDetails.getTransactionReference()
        );

        return paymentRepository.save(payment);
    }


    public void deletePayment(Long id) {

        if (!paymentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Payment not found with ID: " + id
            );
        }

        paymentRepository.deleteById(id);
    }



    public List<Payment> getPaymentsByStatus(
            String status) {

        return paymentRepository.findByPaymentStatus(
                status
        );
    }



    public List<Payment> getPaymentsByMethod(
            String method) {

        return paymentRepository.findByPaymentMethod(
                method
        );
    }
}
