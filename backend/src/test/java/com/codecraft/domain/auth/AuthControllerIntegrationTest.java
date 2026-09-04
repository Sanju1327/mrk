package com.codecraft.domain.auth;

import com.codecraft.domain.auth.dto.LoginRequest;
import com.codecraft.domain.auth.dto.RegisterRequest;
import com.codecraft.domain.user.entity.Role;
import com.codecraft.domain.user.repository.RoleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private RoleRepository roleRepository;

    @BeforeEach
    void setUp() {
        // Ensure ROLE_STUDENT exists for registration
        if (roleRepository.findByName("ROLE_STUDENT").isEmpty()) {
            roleRepository.save(Role.builder()
                    .name("ROLE_STUDENT")
                    .description("Standard student role")
                    .build());
        }
    }

    @Test
    @DisplayName("POST /api/auth/register — should register a new user and return JWT")
    void register_shouldCreateUserAndReturnToken() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("newcoder")
                .email("newcoder@codecraft.io")
                .fullName("New Coder")
                .password("Str0ngP@ss!")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Registration successful"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.username").value("newcoder"))
                .andExpect(jsonPath("$.data.user.email").value("newcoder@codecraft.io"))
                .andExpect(jsonPath("$.data.user.fullName").value("New Coder"))
                .andExpect(jsonPath("$.data.user.roles", hasItem("ROLE_STUDENT")));
    }

    @Test
    @DisplayName("POST /api/auth/register — should reject duplicate username")
    void register_shouldRejectDuplicateUsername() throws Exception {
        RegisterRequest first = RegisterRequest.builder()
                .username("dupeuser")
                .email("dupe1@codecraft.io")
                .fullName("First User")
                .password("Str0ngP@ss!")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isCreated());

        RegisterRequest duplicate = RegisterRequest.builder()
                .username("dupeuser")
                .email("dupe2@codecraft.io")
                .fullName("Second User")
                .password("Str0ngP@ss!")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register — should reject invalid email")
    void register_shouldRejectInvalidEmail() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("badmail")
                .email("not-an-email")
                .fullName("Bad Email User")
                .password("Str0ngP@ss!")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login — should authenticate with valid credentials")
    void login_shouldAuthenticateAndReturnToken() throws Exception {
        // Register first
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("logintester")
                .email("logintester@codecraft.io")
                .fullName("Login Tester")
                .password("MyS3cure#Pass")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        // Login
        LoginRequest loginReq = LoginRequest.builder()
                .usernameOrEmail("logintester")
                .password("MyS3cure#Pass")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.username").value("logintester"));
    }

    @Test
    @DisplayName("POST /api/auth/login — should reject wrong password")
    void login_shouldRejectWrongPassword() throws Exception {
        // Register first
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("wrongpasstester")
                .email("wrongpass@codecraft.io")
                .fullName("Wrong Pass")
                .password("CorrectPassword1!")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = LoginRequest.builder()
                .usernameOrEmail("wrongpasstester")
                .password("WrongPassword!")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/auth/me — should return current user profile with valid JWT")
    void me_shouldReturnProfileWithValidToken() throws Exception {
        // Register and capture token
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("metester")
                .email("metester@codecraft.io")
                .fullName("Me Tester")
                .password("MyS3cure#Pass")
                .build();

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseJson = registerResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseJson).path("data").path("accessToken").asText();

        // GET /api/auth/me with Bearer token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("metester"))
                .andExpect(jsonPath("$.data.email").value("metester@codecraft.io"))
                .andExpect(jsonPath("$.data.fullName").value("Me Tester"))
                .andExpect(jsonPath("$.data.roles", hasItem("ROLE_STUDENT")));
    }

    @Test
    @DisplayName("GET /api/auth/me — should return 401 without JWT")
    void me_shouldReturn401WithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
