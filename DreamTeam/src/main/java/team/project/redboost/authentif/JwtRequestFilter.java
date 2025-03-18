package team.project.redboost.authentif;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);
    private static final String JWT_SECRET = "your-secret-key"; // Match this with /Auth/login

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        String email = null;
        String jwtToken = null;

        logger.info("Processing request: " + request.getRequestURI());
        logger.info("Authorization Header: " + authorizationHeader);

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwtToken = authorizationHeader.substring(7);
            try {
                // Try Firebase validation
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(jwtToken);
                email = decodedToken.getEmail();
                logger.info("Firebase JWT Token validated. Email: " + email);
            } catch (FirebaseAuthException e) {
                logger.warn("Failed to verify Firebase JWT: " + e.getMessage());
                // Fallback to HS256 validation
                try {
                    Claims claims = Jwts.parser()
                            .setSigningKey(JWT_SECRET)
                            .parseClaimsJws(jwtToken)
                            .getBody();
                    email = claims.getSubject();
                    String role = claims.get("role", String.class);
                    logger.info("HS256 JWT Token validated. Email: " + email + ", Role: " + role);
                } catch (JwtException ex) {
                    logger.warn("Failed to verify HS256 JWT: " + ex.getMessage());
                }
            }
        } else {
            logger.info("No valid Bearer token found in Authorization header");
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            logger.info("UserDetails loaded: " + userDetails.getUsername());

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
            logger.info("SecurityContext set with authenticated user: " + userDetails.getUsername());
        }

        chain.doFilter(request, response);
    }
}