package com.ABES_HCL.VenueVista.service;

import com.ABES_HCL.VenueVista.dto.PurchaseRequestDto;
import com.ABES_HCL.VenueVista.dto.TicketResponseDto;
import com.ABES_HCL.VenueVista.entity.RazorpayOrder;
import com.ABES_HCL.VenueVista.repository.RazorpayOrderRepository;
import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RazorpayPaymentService {

    private final String keyId;
    private final String keySecret;
    private final TicketService ticketService;
    private final RazorpayOrderRepository orderRepository;

    public RazorpayPaymentService(
            @Value("${razorpay.key-id:}") String keyId,
            @Value("${razorpay.key-secret:}") String keySecret,
            TicketService ticketService,
            RazorpayOrderRepository orderRepository
    ) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.ticketService = ticketService;
        this.orderRepository = orderRepository;
    }

    public Order createOrder(PurchaseRequestDto request, String username) throws RazorpayException {
        requireTestCredentials();
        long unitPricePaise = ticketService.validateRazorpayOrderRequest(request);
        long amountPaise;
        try {
            amountPaise = Math.multiplyExact(unitPricePaise, request.getQuantity());
        } catch (ArithmeticException e) {
            throw new IllegalArgumentException("Order amount is outside Razorpay's supported range.", e);
        }
        if (amountPaise <= 0 || amountPaise > Integer.MAX_VALUE) {
            throw new IllegalArgumentException("Order amount is outside Razorpay's supported range.");
        }

        JSONObject orderData = new JSONObject()
                .put("amount", amountPaise)
                .put("currency", "INR")
                .put("receipt", "vv-" + java.util.UUID.randomUUID().toString().replace("-", ""));
        Order order = new RazorpayClient(keyId, keySecret).orders.create(orderData);
        ticketService.createRazorpayOrderRecord(order.get("id"), request, username, unitPricePaise);
        return order;
    }

    public TicketResponseDto verifyAndFulfill(
            String orderId,
            String paymentId,
            String signature,
            String username
    ) throws RazorpayException {
        requireTestCredentials();

        JSONObject signatureData = new JSONObject()
                .put("razorpay_order_id", orderId)
                .put("razorpay_payment_id", paymentId)
                .put("razorpay_signature", signature);
        if (!Utils.verifyPaymentSignature(signatureData, keySecret)) {
            throw new IllegalArgumentException("Razorpay payment signature is invalid.");
        }

        Payment payment = new RazorpayClient(keyId, keySecret).payments.fetch(paymentId);
        Object paymentOrderId = payment.get("order_id");
        Object paymentAmount = payment.get("amount");
        Object paymentCurrency = payment.get("currency");
        if (!orderId.equals(paymentOrderId)
                || !"captured".equals(payment.get("status"))
                || !(paymentAmount instanceof Number amount)
                || !"INR".equals(paymentCurrency)) {
            throw new IllegalArgumentException("Razorpay payment is not a captured INR payment for this order.");
        }

        RazorpayOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Razorpay order was not found."));
        long expectedAmount = Math.multiplyExact(order.getUnitPricePaise(), order.getQuantity());
        if (amount.longValue() != expectedAmount) {
            throw new IllegalArgumentException("Razorpay payment amount does not match the order.");
        }

        return ticketService.fulfillRazorpayOrder(orderId, paymentId, username);
    }

    private void requireTestCredentials() {
        if (keyId.isBlank() || !keyId.startsWith("rzp_test_") || keySecret.isBlank()) {
            throw new RazorpayConfigurationException(
                    "Configure Razorpay Test Mode credentials in RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
            );
        }
    }
}
