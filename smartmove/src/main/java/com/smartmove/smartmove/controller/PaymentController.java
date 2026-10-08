package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.entity.Payment;
import com.smartmove.smartmove.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService) {

        this.paymentService = paymentService;
    }


    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {

        return ResponseEntity.ok(
                paymentService.getAllPayments()
        );
    }



    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(id)
        );
    }



    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<Payment> getPaymentByTicket(
            @PathVariable Long ticketId) {

        return ResponseEntity.ok(
                paymentService.getPaymentByTicket(
                        ticketId
                )
        );
    }



    @PostMapping
    public ResponseEntity<Payment> createPayment(
            @RequestParam Long ticketId,
            @RequestBody Payment payment) {

        Payment savedPayment =
                paymentService.createPayment(
                        ticketId,
                        payment
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedPayment);
    }



    @PutMapping("/{id}")
    public ResponseEntity<Payment> updatePayment(
            @PathVariable Long id,
            @RequestBody Payment payment) {

        return ResponseEntity.ok(
                paymentService.updatePayment(
                        id,
                        payment
                )
        );
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePayment(
            @PathVariable Long id) {

        paymentService.deletePayment(id);

        return ResponseEntity.ok(
                "Payment deleted successfully"
        );
    }



    @GetMapping("/status/{status}")
    public ResponseEntity<List<Payment>> getPaymentsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                paymentService.getPaymentsByStatus(status)
        );
    }



    @GetMapping("/method/{method}")
    public ResponseEntity<List<Payment>> getPaymentsByMethod(
            @PathVariable String method) {

        return ResponseEntity.ok(
                paymentService.getPaymentsByMethod(method)
        );
    }
}
