package com.codecraft.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String username;
    private final String email;
    private final String fullName;

    @JsonIgnore
    private final String password;

    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean active;

    public static UserPrincipal create(Long id, String username, String email, String fullName, String password, List<String> roles, boolean active) {
        List<GrantedAuthority> authorities = roles.stream()
                .map(role -> (GrantedAuthority) new SimpleGrantedAuthority(role.startsWith("ROLE_") ? role : "ROLE_" + role))
                .toList();

        return UserPrincipal.builder()
                .id(id)
                .username(username)
                .email(email)
                .fullName(fullName)
                .password(password)
                .authorities(authorities)
                .active(active)
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
