package com.ABES_HCL.VenueVista.config;

import com.ABES_HCL.VenueVista.entity.User;
import com.ABES_HCL.VenueVista.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

import java.util.Set;

@Configuration
public class DataSeeder {
    @Value("${venuevista.admin.username:anant}")
    private String adminUsername;

    @Value("${venuevista.admin.email:}")
    private String adminEmail;

    @Value("${venuevista.admin.password:}")
    private String adminPassword;

    @Bean
    public CommandLineRunner seedUsers(
            UserRepository userRepository,
            JdbcTemplate jdbcTemplate,
            PasswordEncoder passwordEncoder,
            PlatformTransactionManager transactionManager
    ) {
        return args -> {
            if (!StringUtils.hasText(adminUsername)) {
                throw new IllegalStateException("Set VENUEVISTA_ADMIN_USERNAME before starting the application.");
            }

            if (!StringUtils.hasText(adminEmail)
                    || adminPassword == null
                    || adminPassword.length() < 16) {
                throw new IllegalStateException(
                        "Set VENUEVISTA_ADMIN_EMAIL and VENUEVISTA_ADMIN_PASSWORD (at least 16 characters) before starting the application."
                );
            }

            String username = adminUsername.trim();
            User admin = User.builder()
                    .username(username)
                    .email(adminEmail.trim().toLowerCase())
                    .password(passwordEncoder.encode(adminPassword))
                    .role("ROLE_ADMIN")
                    .roles(Set.of("ROLE_ADMIN"))
                    .build();

            new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
                jdbcTemplate.update("DELETE FROM user_roles");
                jdbcTemplate.update("DELETE FROM users");
                userRepository.save(admin);
            });
            System.out.println("VenueVista: users and roles reset; super admin seeded.");
        };
    }
}