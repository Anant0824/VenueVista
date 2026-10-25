package com.ABES_HCL.VenueVista.controller;

import com.ABES_HCL.VenueVista.dto.CreateRazorpayOrderRequest;
import com.ABES_HCL.VenueVista.dto.PurchaseRequestDto;
import com.ABES_HCL.VenueVista.dto.RazorpayOrderResponse;
import com.ABES_HCL.VenueVista.dto.TicketResponseDto;
import com.ABES_HCL.VenueVista.dto.VerifyRazorpayPaymentRequest;
import com.ABES_HCL.VenueVista.service.RazorpayConfigurationException;
import com.ABES_HCL.VenueVista.service.RazorpayPaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class RazorpayController {

    private static final Logger LOGGER = LoggerFactory.getLogger(RazorpayController.class);

    private final RazorpayPaymentService razorpayPaymentService;

    public RazorpayController(RazorpayPaymentService razorpayPaymentService) {
        this.razorpayPaymentService = razorpayPaymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody CreateRazorpayOrderRequest request,
            @AuthenticationPrincipal UserDetails user
    ) {
        try {
            PurchaseRequestDto purchase = new PurchaseRequestDto(
                    request.eventId(),
                    request.quantity(),
                    request.ticketType()
            );
            Order order = razorpayPaymentService.createOrder(purchase, user.getUsername());
            return ResponseEntity.ok(new RazorpayOrderResponse(
                    order.get("id"),
                    ((Number) order.get("amount")).longValue(),
                    order.get("currency")
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RazorpayConfigurationException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (RazorpayException e) {
            LOGGER.error("Razorpay order creation failed.", e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "Unable to create Razorpay order."));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @Valid @RequestBody VerifyRazorpayPaymentRequest request,
            @AuthenticationPrincipal UserDetails user
    ) {
        try {
            TicketResponseDto ticket = razorpayPaymentService.verifyAndFulfill(
                    request.razorpayOrderId(),
                    request.razorpayPaymentId(),
                    request.razorpaySignature(),
                    user.getUsername()
            );
            return ResponseEntity.ok(ticket);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RazorpayConfigurationException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (RazorpayException e) {
            LOGGER.error("Razorpay payment verification failed.", e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "Unable to verify Razorpay payment."));
        }
    }
}
