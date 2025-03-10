package team.project.redboost.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI redBoostOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("RedBoost API")
                        .description("API Documentation pour le projet RedBoost")
                        .version("1.0")
                        .contact(new Contact()
                                .name("RedBoost Team")
                                .email("contact@redboost.com")));
    }
}