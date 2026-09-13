package com.codecraft.security;

import com.codecraft.domain.user.entity.User;
import com.codecraft.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements CustomUserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        String trimmed = usernameOrEmail != null ? usernameOrEmail.trim() : "";
        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(trimmed, trimmed)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with username or email: " + trimmed));

        return buildUserPrincipal(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) throws UsernameNotFoundException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with id: " + id));

        return buildUserPrincipal(user);
    }

    private UserPrincipal buildUserPrincipal(User user) {
        return UserPrincipal.create(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPasswordHash(),
                user.getRoles().stream()
                        .map(role -> role.getName())
                        .toList(),
                user.isActive()
        );
    }
}
