package com.codecraft.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements CustomUserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // Scaffolding stub for Phase 1 - fully populated with JPA in Phase 2 & 3
        throw new UsernameNotFoundException("User not found: " + usernameOrEmail);
    }

    @Override
    public UserDetails loadUserById(Long id) throws UsernameNotFoundException {
        // Scaffolding stub for Phase 1 - fully populated with JPA in Phase 2 & 3
        throw new UsernameNotFoundException("User ID not found: " + id);
    }
}
