package com.ABES_HCL.VenueVista.config;

import com.ABES_HCL.VenueVista.entity.User;
import com.ABES_HCL.VenueVista.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

import java.util.Set;

@Configuration
public class DataSeeder {
    @Value("${venuevista.admin.seed-enabled:${venuevista.admin.reset-users:false}}")
    private boolean seedAdmin;

    @Value("${venuevista.admin.username:anant}")
    private String adminUsername;

    @Value("${venuevista.admin.email:}")
    private String adminEmail;

    @Value("${venuevista.admin.password:}")
    private String adminPassword;

    // We define the BCrypt encoder here so Spring Security can use it later
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CommandLineRunner migrateLegacyUserRoles(JdbcTemplate jdbcTemplate) {
        return args -> jdbcTemplate.update("""
                INSERT INTO user_roles (user_id, role)
                SELECT users.id, users.role
                FROM users
                WHERE users.role IS NOT NULL
                  AND NOT EXISTS (
                      SELECT 1
                      FROM user_roles
                      WHERE user_roles.user_id = users.id
                        AND user_roles.role = users.role
                  )
                """);
    }

    @Bean
    public CommandLineRunner seedUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            PlatformTransactionManager transactionManager
    ) {
        return args -> {
            if (!seedAdmin) {
                return;
            }

            if (!StringUtils.hasText(adminUsername)) {
                throw new IllegalStateException("Set venuevista.admin.username before enabling admin seeding.");
            }

            String username = adminUsername.trim();
            if (userRepository.existsByUsername(username)) {
                System.out.println("VenueVista: admin account already exists; skipping seed.");
                return;
            }

            if (!StringUtils.hasText(adminEmail)
                    || adminPassword == null
                    || adminPassword.length() < 16) {
                throw new IllegalStateException(
                        "Set venuevista.admin.email and venuevista.admin.password (at least 16 characters) before enabling venuevista.admin.seed-enabled."
                );
            }

            User admin = User.builder()
                    .username(username)
                    .email(adminEmail.trim().toLowerCase())
                    .password(passwordEncoder.encode(adminPassword))
                    .role("ROLE_ADMIN")
                    .roles(Set.of("ROLE_ADMIN"))
                    .build();

            new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
                userRepository.save(admin);
            });
            System.out.println("VenueVista: configured admin account seeded.");
        };
    }
}