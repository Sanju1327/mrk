package com.codecraft.config;

import com.codecraft.domain.user.entity.Role;
import com.codecraft.domain.user.entity.User;
import com.codecraft.domain.user.repository.RoleRepository;
import com.codecraft.domain.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import org.springframework.core.annotation.Order;

@Slf4j
@Component
@Order(1)
public class SuperAdminBootstrapRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.super-admin.email:Sanju@gmail.com}")
    private String bootstrapEmail;

    @Value("${app.bootstrap.super-admin.password:}")
    private String bootstrapPassword;

    @Value("${app.bootstrap.super-admin.username:SanjuAdmin}")
    private String bootstrapUsername;

    @Value("${app.bootstrap.super-admin.full-name:Sanju Kumar}")
    private String bootstrapFullName;

    public SuperAdminBootstrapRunner(UserRepository userRepository,
                                     RoleRepository roleRepository,
                                     PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        boolean superAdminExists = userRepository.existsByRolesName("ROLE_SUPER_ADMIN")
                || userRepository.existsByEmailIgnoreCase(bootstrapEmail);

        if (superAdminExists) {
            if (bootstrapPassword != null && !bootstrapPassword.trim().isEmpty()) {
                User existing = userRepository.findByEmailIgnoreCase(bootstrapEmail)
                        .or(() -> userRepository.findByUsernameIgnoreCase(bootstrapUsername))
                        .orElse(null);
                if (existing != null && !passwordEncoder.matches(bootstrapPassword, existing.getPasswordHash())) {
                    existing.setPasswordHash(passwordEncoder.encode(bootstrapPassword));
                    userRepository.save(existing);
                    log.info("Super Admin password synchronized with configured bootstrap credentials.");
                }
            }
            log.info("Super Admin account is already present. Bootstrap completed.");
            return;
        }

        if (bootstrapPassword == null || bootstrapPassword.trim().isEmpty()) {
            log.warn("Super Admin bootstrap password not configured. Skipping bootstrap.");
            return;
        }

        log.info("Bootstrapping initial Super Admin account for: {}", bootstrapEmail);

        Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name("ROLE_SUPER_ADMIN")
                        .description("Platform owner with full system administration and teacher management authority")
                        .build()));

        // Ensure teacher role exists as well
        Role teacherRole = roleRepository.findByName("ROLE_TEACHER")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name("ROLE_TEACHER")
                        .description("Course creator and curriculum instructor")
                        .build()));

        Set<Role> roles = new HashSet<>();
        roles.add(superAdminRole);
        roles.add(teacherRole);

        User superAdmin = User.builder()
                .username(bootstrapUsername)
                .email(bootstrapEmail)
                .fullName(bootstrapFullName)
                .passwordHash(passwordEncoder.encode(bootstrapPassword))
                .roles(roles)
                .active(true)
                .bio("CodeCraft Platform Super Administrator")
                .build();

        userRepository.save(superAdmin);
        log.info("Super Admin account created successfully with ID: {} and roles: {}", superAdmin.getId(), roles.stream().map(Role::getName).toList());
    }
}
