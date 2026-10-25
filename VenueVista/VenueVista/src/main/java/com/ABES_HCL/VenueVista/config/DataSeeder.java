package com.ABES_HCL.VenueVista.config;

import com.ABES_HCL.VenueVista.entity.User;
import com.ABES_HCL.VenueVista.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

@Configuration
public class DataSeeder {
    @Value("${venuevista.admin.reset-users:false}")
    private boolean resetUsers;

    @Value("${venuevista.admin.username:}")
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
    public CommandLineRunner seedUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            PlatformTransactionManager transactionManager
    ) {
        return args -> {
            if (!resetUsers) {
                return;
            }

            if (!StringUtils.hasText(adminUsername)
                    || !StringUtils.hasText(adminEmail)
                    || adminPassword == null
                    || adminPassword.length() < 16) {
                throw new IllegalStateException(
                        "Set venuevista.admin.username, venuevista.admin.email, and a password of at least 16 characters before enabling the user reset."
                );
            }

            User admin = User.builder()
                    .username(adminUsername.trim())
                    .email(adminEmail.trim().toLowerCase())
                    .password(passwordEncoder.encode(adminPassword))
                    .role("ROLE_CREATOR")
                    .build();

            new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
                userRepository.deleteAllInBatch();
                userRepository.save(admin);
            });
            System.out.println("VenueVista: configured admin account seeded; existing users were removed.");
        };
    }
}