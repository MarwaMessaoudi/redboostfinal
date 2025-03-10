// src/main/java/team/project/redboost/config/TestUserConfiguration.java
package team.project.redboost.config;

public class TestUserConfiguration {

    private static final Long TEST_USER_ID = 1L; // ID de l'utilisateur de test
    private static final long TEST_USER_SPACE_LIMIT = 100 * 1024 * 1024; // 100 MB (en octets)

    public static Long getTestUserId() {
        return TEST_USER_ID;
    }

    public static long getTestUserSpaceLimit() {
        return TEST_USER_SPACE_LIMIT;
    }
}
