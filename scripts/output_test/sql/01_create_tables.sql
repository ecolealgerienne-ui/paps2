-- ============================================
-- SCRIPT CRÉATION TABLES - ANIMAL TRACE
-- Référentiels Vétérinaires ANSES
-- ============================================

-- Table ESPECES
CREATE TABLE IF NOT EXISTS especes (
    code_espece INTEGER PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    nom_scientifique VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table CATEGORIES_AGE
CREATE TABLE IF NOT EXISTS categories_age (
    code_categorie VARCHAR(50),
    code_espece INTEGER,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    age_min_jours INTEGER NOT NULL,
    age_max_jours INTEGER,
    ordre INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (code_categorie, code_espece),
    FOREIGN KEY (code_espece) REFERENCES especes(code_espece)
);

CREATE INDEX idx_categories_age_espece ON categories_age(code_espece);

-- Table CATEGORIES_PRODUIT
CREATE TABLE IF NOT EXISTS categories_produit (
    code_categorie VARCHAR(50) PRIMARY KEY,
    libelle VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table RACES
CREATE TABLE IF NOT EXISTS races (
    code_fao VARCHAR(50) PRIMARY KEY,
    nom_local VARCHAR(200) NOT NULL,
    nom_anglais VARCHAR(200),
    code_espece INTEGER NOT NULL,
    pays_origine VARCHAR(100),
    description TEXT,
    classification_adaptation VARCHAR(100),
    classification_geographique VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_espece) REFERENCES especes(code_espece)
);

CREATE INDEX idx_races_espece ON races(code_espece);
CREATE INDEX idx_races_nom ON races(nom_local);

-- Table MEDICAMENTS_CLINIQUE
CREATE TABLE IF NOT EXISTS medicaments_clinique (
    id_medicament INTEGER PRIMARY KEY,
    code_categorie VARCHAR(50) NOT NULL,
    substance_active VARCHAR(500),
    code_atcvet VARCHAR(20),
    nom_commercial VARCHAR(500) NOT NULL,
    forme_pharmaceutique VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_categorie) REFERENCES categories_produit(code_categorie)
);

CREATE INDEX idx_medicaments_categorie ON medicaments_clinique(code_categorie);
CREATE INDEX idx_medicaments_atcvet ON medicaments_clinique(code_atcvet);
CREATE INDEX idx_medicaments_nom ON medicaments_clinique(nom_commercial);

-- Table MEDICAMENTS_ESPECES_AGE_POSOLOGIE (Structure OBC simplifiée)
CREATE TABLE IF NOT EXISTS medicaments_especes_age_posologie (
    id_medicament INTEGER,
    code_espece INTEGER,
    code_categorie_age VARCHAR(50),
    voie_administration INTEGER,
    dose_min_mg_par_kg DECIMAL(10,2),
    dose_max_mg_par_kg DECIMAL(10,2),
    dose_texte_original TEXT,
    protocole_duree_jours INTEGER,
    temps_attente_lait_jours INTEGER,         -- Temps attente lait (code_denree=9)
    temps_attente_viande_jours INTEGER,       -- Temps attente viande (code_denree=14)
    parsing_verified BOOLEAN DEFAULT FALSE,
    notes_validation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_medicament, code_espece, code_categorie_age, voie_administration),
    FOREIGN KEY (id_medicament) REFERENCES medicaments_clinique(id_medicament),
    FOREIGN KEY (code_espece) REFERENCES especes(code_espece),
    FOREIGN KEY (code_categorie_age, code_espece) REFERENCES categories_age(code_categorie, code_espece)
);

CREATE INDEX idx_posologie_medicament ON medicaments_especes_age_posologie(id_medicament);
CREATE INDEX idx_posologie_espece ON medicaments_especes_age_posologie(code_espece);

-- Table CONDITIONNEMENTS_NATIONAUX
CREATE TABLE IF NOT EXISTS conditionnements_nationaux (
    package_id VARCHAR(100),
    code_pays CHAR(2),
    id_medicament INTEGER NOT NULL,
    gtin_ean VARCHAR(14),
    nom_commercial_local VARCHAR(500),
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (package_id, code_pays),
    FOREIGN KEY (id_medicament) REFERENCES medicaments_clinique(id_medicament)
);

CREATE INDEX idx_conditionnements_medicament ON conditionnements_nationaux(id_medicament);
CREATE INDEX idx_conditionnements_gtin ON conditionnements_nationaux(gtin_ean);
