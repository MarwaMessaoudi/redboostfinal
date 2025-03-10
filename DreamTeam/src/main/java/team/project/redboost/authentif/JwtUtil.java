package team.project.redboost.authentif;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import team.project.redboost.entities.Role;

import java.security.Key;
import java.util.Collection;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret.key}")
    private String secretKey;

    // Add method to get the secret key
    public String getSecretKey() {
        return secretKey;
    }

    // Extract a claim from the token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        Key key = Keys.hmacShaKeyFor(getSecretKey().getBytes());
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Retrieve email from JWT token
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Retrieve expiration date from JWT token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generates a JWT token for email/password users (no provider or providerId).
     */
    public String generateToken(String email, Collection<? extends GrantedAuthority> authorities) {
        return generateToken(email, null, null, authorities); // Call the main method with null provider and providerId
    }

    /**
     * Generates a JWT token for OAuth2 users (with provider and providerId).
     */
    public String generateToken(String email, String provider, String providerId, Collection<? extends GrantedAuthority> authorities) {
        // Extract the single role from authorities
        String role = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .map(this::removeRolePrefix) // Remove the ROLE_ prefix
                .findFirst() // Get the first (and only) role
                .orElseThrow(() -> new IllegalArgumentException("User must have at least one role."));

        Key key = Keys.hmacShaKeyFor(getSecretKey().getBytes());

        JwtBuilder builder = Jwts.builder()
                .setSubject(email)
                .claim("role", role) // Store the role as a single string
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours validity
                .signWith(key); // Use the Key object directly

        // Add provider and providerId only if they are not null
        if (provider != null) {
            builder.claim("provider", provider);
        }
        if (providerId != null) {
            builder.claim("providerId", providerId);
        }

        return builder.compact();
    }

    // Generate a refresh token for the user
    public String generateRefreshToken(String email, Collection<? extends GrantedAuthority> authorities) {
        // Extract the single role from authorities
        String role = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .map(this::removeRolePrefix) // Remove the ROLE_ prefix
                .findFirst() // Get the first (and only) role
                .orElseThrow(() -> new IllegalArgumentException("User must have at least one role."));

        Key key = Keys.hmacShaKeyFor(getSecretKey().getBytes());

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) // Store the role as a single string
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7)) // 7 days validity
                .signWith(key) // Use the Key object directly
                .compact();
    }

    // Helper method to remove the ROLE_ prefix
    private String removeRolePrefix(String authority) {
        if (authority.startsWith("ROLE_")) {
            return authority.substring(5); // Remove the first 5 characters (ROLE_)
        }
        return authority;
    }

    // Check if the token has expired
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Validate token
    public Boolean validateToken(String token, String email) {
        final String emailFromToken = extractEmail(token);
        return (emailFromToken.equals(email) && !isTokenExpired(token));
    }

    // Get the role from the token
    public Role getRoleFromToken(String token) {
        Key key = Keys.hmacShaKeyFor(getSecretKey().getBytes());

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key) // Use the Key object directly
                .build()
                .parseClaimsJws(token)
                .getBody();

        String roleName = claims.get("role", String.class); // Extract the role as a string
        return Role.valueOf(roleName); // Convert the string to the Role enum
    }
}