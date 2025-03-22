package team.project.redboost.entities;

public enum Niveau {
    DEBUTANT(0, 100),
    INTERMEDIAIRE(101, 500),
    AVANCE(501, 1000),
    EXPERT(1001, Integer.MAX_VALUE);

    private final int seuilMin;
    private final int seuilMax;

    Niveau(int seuilMin, int seuilMax) {
        this.seuilMin = seuilMin;
        this.seuilMax = seuilMax;
    }

    public int getSeuilMin() {
        return seuilMin;
    }

    public int getSeuilMax() {
        return seuilMax;
    }

    public static Niveau getNiveauByScore(int score) {
        for (Niveau niveau : values()) {
            if (score >= niveau.getSeuilMin() && score <= niveau.getSeuilMax()) {
                return niveau;
            }
        }
        return DEBUTANT;  // Par défaut
    }
}

