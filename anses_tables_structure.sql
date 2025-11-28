-- ============================================================================
-- TABLES RÉFÉRENTIELS ANSES - ANIMAL TRACE
-- Structure backend pour données vétérinaires OBC
-- ============================================================================

-- 1. ESPECES
CREATE TABLE especes (
    code_espece INTEGER PRIMARY KEY,
    nom_espece VARCHAR(200) NOT NULL,
    nom_scientifique VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_especes_nom ON especes(nom_espece);

-- 2. CATEGORIES_AGE
CREATE TABLE categories_age (
    code_categorie VARCHAR(50) NOT NULL,
    code_espece INTEGER NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    age_min_jours INTEGER,
    age_max_jours INTEGER,
    ordre INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (code_categorie, code_espece),
    FOREIGN KEY (code_espece) REFERENCES especes(code_espece)
);

CREATE INDEX idx_categories_espece ON categories_age(code_espece);

-- 3. SUBSTANCES_ACTIVES
CREATE TABLE substances_actives (
    code_substance INTEGER PRIMARY KEY,
    nom_substance VARCHAR(500) NOT NULL,
    code_atc VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_substances_nom ON substances_actives(nom_substance);
CREATE INDEX idx_substances_atc ON substances_actives(code_atc);

-- 4. VOIES_ADMINISTRATION
CREATE TABLE voies_administration (
    code_voie INTEGER PRIMARY KEY,
    libelle VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. DENREES
CREATE TABLE denrees (
    code_denree INTEGER PRIMARY KEY,
    nom_denree VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. UNITES
CREATE TABLE unites (
    code_unite INTEGER PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL,
    type_unite VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. RACES
CREATE TABLE races (
    id_race VARCHAR(50) PRIMARY KEY,
    code_espece INTEGER NOT NULL,
    nom_race VARCHAR(300) NOT NULL,
    nom_local VARCHAR(300),
    source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_espece) REFERENCES especes(code_espece)
);

CREATE INDEX idx_races_espece ON races(code_espece);
CREATE INDEX idx_races_nom ON races(nom_race);

-- 8. CATEGORIES_PRODUIT
CREATE TABLE categories_produit (
    code_categorie INTEGER PRIMARY KEY,
    libelle VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. MEDICAMENTS_CLINIQUE
CREATE TABLE medicaments_clinique (
    id_medicament INTEGER PRIMARY KEY,
    num_amm VARCHAR(100) UNIQUE NOT NULL,
    code_atcvet VARCHAR(20),
    nom_commercial VARCHAR(500) NOT NULL,
    forme_pharmaceutique VARCHAR(200),
    titulaire_amm VARCHAR(500),
    code_categorie INTEGER,
    code_substance INTEGER,
    rcp_section_composition TEXT,
    rcp_section_posologie TEXT,
    rcp_section_temps_attente TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_categorie) REFERENCES categories_produit(code_categorie),
    FOREIGN KEY (code_substance) REFERENCES substances_actives(code_substance)
);

CREATE INDEX idx_medicaments_nom ON medicaments_clinique(nom_commercial);
CREATE INDEX idx_medicaments_atcvet ON medicaments_clinique(code_atcvet);
CREATE INDEX idx_medicaments_substance ON medicaments_clinique(code_substance);

-- 10. MEDICAMENTS_ESPECES_AGE_POSOLOGIE (Structure OBC simplifiée)
CREATE TABLE medicaments_especes_age_posologie (
    id_posologie VARCHAR(100) PRIMARY KEY,
    id_medicament INTEGER NOT NULL,
    code_espece INTEGER NOT NULL,
    code_categorie_age VARCHAR(50) NOT NULL,
    voie_administration INTEGER NOT NULL,
    dose_min_mg_par_kg DECIMAL(10,2),
    dose_max_mg_par_kg DECIMAL(10,2),
    dose_texte_original TEXT,
    protocole_duree_jours INTEGER,
    temps_attente_lait_jours INTEGER,
    temps_attente_viande_jours INTEGER,
    parsing_verified BOOLEAN DEFAULT FALSE,
    notes_validation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_medicament) REFERENCES medicaments_clinique(id_medicament),
    FOREIGN KEY (code_espece) REFERENCES especes(code_espece),
    FOREIGN KEY (code_categorie_age, code_espece) REFERENCES categories_age(code_categorie, code_espece),
    FOREIGN KEY (voie_administration) REFERENCES voies_administration(code_voie),
    UNIQUE (id_medicament, code_espece, code_categorie_age, voie_administration)
);

CREATE INDEX idx_posologie_medicament ON medicaments_especes_age_posologie(id_medicament);
CREATE INDEX idx_posologie_espece ON medicaments_especes_age_posologie(code_espece);
CREATE INDEX idx_posologie_categorie ON medicaments_especes_age_posologie(code_categorie_age);
CREATE INDEX idx_posologie_lookup ON medicaments_especes_age_posologie(id_medicament, code_espece, code_categorie_age);

-- 11. CONDITIONNEMENTS_NATIONAUX
CREATE TABLE conditionnements_nationaux (
    id_conditionnement VARCHAR(100) PRIMARY KEY,
    id_medicament INTEGER NOT NULL,
    code_pays CHAR(2) DEFAULT 'FR',
    gtin_ean VARCHAR(14),
    libelle_conditionnement VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_medicament) REFERENCES medicaments_clinique(id_medicament)
);

CREATE INDEX idx_conditionnements_medicament ON conditionnements_nationaux(id_medicament);
CREATE INDEX idx_conditionnements_gtin ON conditionnements_nationaux(gtin_ean);
