package com.ABES_HCL.VenueVista.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AuthRequestDiagnosticFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthRequestDiagnosticFilter.class);
    private static final String LOGIN_PATH = "/api/auth/login";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !LOGIN_PATH.equals(request.getServletPath());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        LOGGER.info(
                "Login request received: method={}, path={}, origin={}, contentType={}, accept={}, " +
                        "accessControlRequestMethod={}, accessControlRequestHeaders={}, userAgent={}, " +
                        "authorizationPresent={}, cookiePresent={}",
                request.getMethod(),
                request.getServletPath(),
                request.getHeader("Origin"),
                request.getHeader("Content-Type"),
                request.getHeader("Accept"),
                request.getHeader("Access-Control-Request-Method"),
                request.getHeader("Access-Control-Request-Headers"),
                request.getHeader("User-Agent"),
                request.getHeader("Authorization") != null,
                request.getHeader("Cookie") != null
        );

        try {
            filterChain.doFilter(request, response);
            LOGGER.info(
                    "Login request completed: method={}, path={}, status={}",
                    request.getMethod(),
                    request.getServletPath(),
                    response.getStatus()
            );
        } catch (IOException | ServletException | RuntimeException exception) {
            LOGGER.warn(
                    "Login request failed before completion: method={}, path={}, exceptionType={}",
                    request.getMethod(),
                    request.getServletPath(),
                    exception.getClass().getName()
            );
            throw exception;
        }
    }
}
