package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.entity.Ticket;
import com.smartmove.smartmove.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;



@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {




    private final TicketService ticketService;




    public TicketController(
            TicketService ticketService
    ) {

        this.ticketService =
                ticketService;

    }




    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {

        return ResponseEntity.ok(
                ticketService.getAllTickets()
        );

    }



    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                ticketService.getTicketById(
                        id
                )
        );

    }



    @PostMapping
    public ResponseEntity<?> createTicket(

            @RequestParam Long tripId,

            @RequestParam Long passengerId,

            @RequestBody Ticket ticket

    ) {

        try {

            System.out.println(
                    "========================================"
            );

            System.out.println(
                    "CREATE TICKET REQUEST"
            );

            System.out.println(
                    "Trip ID      : " +
                            tripId
            );

            System.out.println(
                    "Passenger ID : " +
                            passengerId
            );

            System.out.println(
                    "Seat Number  : " +
                            ticket.getSeatNumber()
            );

            System.out.println(
                    "Ticket Price : " +
                            ticket.getTicketPrice()
            );

            System.out.println(
                    "Status       : " +
                            ticket.getTicketStatus()
            );

            System.out.println(
                    "========================================"
            );



            Ticket savedTicket =
                    ticketService.createTicket(
                            tripId,
                            passengerId,
                            ticket
                    );



            Map<String, Object> response =
                    new HashMap<>();


            response.put(
                    "success",
                    true
            );


            response.put(
                    "message",
                    "Ticket booked successfully"
            );


            response.put(
                    "ticketId",
                    savedTicket.getTicketId()
            );


            response.put(
                    "tripId",
                    tripId
            );


            response.put(
                    "passengerId",
                    passengerId
            );


            response.put(
                    "seatNumber",
                    savedTicket.getSeatNumber()
            );


            response.put(
                    "ticketPrice",
                    savedTicket.getTicketPrice()
            );


            response.put(
                    "ticketStatus",
                    savedTicket.getTicketStatus()
            );


            response.put(
                    "bookingDate",
                    savedTicket.getBookingDate()
            );


            return ResponseEntity
                    .status(
                            HttpStatus.CREATED
                    )
                    .body(
                            response
                    );

        }
        catch (Exception e) {


            System.err.println(
                    "========================================"
            );

            System.err.println(
                    "TICKET BOOKING ERROR"
            );

            System.err.println(
                    "Exception Type : " +
                            e.getClass().getName()
            );

            System.err.println(
                    "Message        : " +
                            e.getMessage()
            );


            if (
                    e.getCause() != null
            ) {

                System.err.println(
                        "Cause          : " +
                                e.getCause().getMessage()
                );

            }


            System.err.println(
                    "========================================"
            );


            e.printStackTrace();



            Map<String, Object> error =
                    new HashMap<>();


            error.put(
                    "success",
                    false
            );


            error.put(
                    "message",
                    e.getMessage() != null
                            ? e.getMessage()
                            : "Ticket booking failed."
            );


            error.put(
                    "exception",
                    e.getClass().getSimpleName()
            );


            if (
                    e.getCause() != null
            ) {

                error.put(
                        "cause",
                        e.getCause().getMessage()
                );

            }


            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            error
                    );

        }

    }


    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(

            @PathVariable Long id,

            @RequestBody Ticket ticket

    ) {

        return ResponseEntity.ok(
                ticketService.updateTicket(
                        id,
                        ticket
                )
        );

    }



    @PutMapping("/{id}/cancel")
    public ResponseEntity<Ticket> cancelTicket(

            @PathVariable Long id

    ) {

        return ResponseEntity.ok(
                ticketService.cancelTicket(
                        id
                )
        );

    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTicket(

            @PathVariable Long id

    ) {

        ticketService.deleteTicket(
                id
        );


        return ResponseEntity.ok(
                "Ticket deleted successfully"
        );

    }


    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Ticket>> getTicketsByTrip(

            @PathVariable Long tripId

    ) {

        return ResponseEntity.ok(
                ticketService.getTicketsByTrip(
                        tripId
                )
        );

    }



    @GetMapping("/passenger/{passengerId}")
    public ResponseEntity<List<Ticket>> getTicketsByPassenger(

            @PathVariable Long passengerId

    ) {

        return ResponseEntity.ok(
                ticketService.getTicketsByPassenger(
                        passengerId
                )
        );

    }


    @GetMapping("/status/{status}")
    public ResponseEntity<List<Ticket>> getTicketsByStatus(

            @PathVariable String status

    ) {

        return ResponseEntity.ok(
                ticketService.getTicketsByStatus(
                        status
                )
        );

    }

}