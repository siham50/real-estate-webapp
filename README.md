# Projet Real Estate Web Application

## Structure du Projet

```text
real-estate-webapp/
├── .env                  # Variables d'environnement
├── .env.example          # Exemple de variables
├── .gitignore            # Fichiers ignorés par Git
├── docker-compose.yml    # Configuration Docker (MySQL + Backend)
├── README.md             # Ce fichier
├── backend/
│   ├── Dockerfile        # Image Docker du backend
│   ├── pom.xml           # Dépendances Maven
│   └── src/main/
│       ├── java/com/realestate/backend/
│       │   ├── RealEstateApplication.java
│       │   ├── config/CorsConfig.java
│       │   ├── controller/TestController.java
│       │   ├── entity/User.java
│       │   ├── entity/enums/Role.java
│       │   ├── repository/UserRepository.java
│       │   └── service/UserService.java
│       └── resources/application.properties
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── Header.jsx
        │   ├── Hero.jsx
        │   ├── PropertyList.jsx
        │   └── Footer.jsx
        └── services/api.js
```

---

## ÉTAPE 1: Lancer la base de données MySQL et le Backend (Docker)

### 1.1 Ouvrir un terminal à la racine du projet
```powershell
cd C:\Users\hp\Desktop\real-estate-webapp
```

### 1.2 Arrêter les anciens conteneurs (si nécessaire)
```powershell
docker-compose down
```

### 1.3 Construire et lancer les conteneurs
```powershell
docker-compose up -d --build
```
> **Patience :** Le premier build prend 2 à 5 minutes (compilation Maven). Les suivants sont plus rapides (cache Docker).

### 1.4 Vérifier que les 2 conteneurs tournent
```powershell
docker ps
```
**Résultat attendu :**

| NOM | IMAGE | PORTS | STATUS |
|---|---|---|---|
| real_estate_mysql | mysql:8.0 | 0.0.0.0:3307->3306/tcp | Up |
| real_estate_backend | real-estate-webapp-backend | 0.0.0.0:8080->8080/tcp | Up |

### 1.5 Vérifier les logs du backend
```powershell
docker logs real_estate_backend
```
**Chercher ces 3 lignes (preuves de succès) :**
```text
HikariPool-1 - Start completed.
Hibernate: create table users (...)
Started RealEstateApplication in X.XXX seconds
```

---

## ÉTAPE 2: Vérifier la Base de Données

### 2.1 Se connecter au conteneur MySQL et vérifier les tables
```powershell
docker exec -it real_estate_mysql mysql -u root -proot -e "USE real_estate_db; SHOW TABLES; DESCRIBE users;"
```
**Résultat attendu :**
```text
+--------------------------+
| Tables_in_real_estate_db |
+--------------------------+
| users                    |
+--------------------------+

+-----------------------+-----------------------+------+-----+---------+----------------+
| Field                 | Type                  | Null | Key | Default | Extra          |
+-----------------------+-----------------------+------+-----+---------+----------------+
| id                    | bigint                | NO   | PRI | NULL    | auto_increment |
| created_at            | datetime(6)           | NO   |     | NULL    |                |
| email                 | varchar(100)          | NO   | UNI | NULL    |                |
| first_name            | varchar(50)           | NO   |     | NULL    |                |
| identity_document_url | varchar(255)          | YES  |     | NULL    |                |
| is_active             | bit(1)                | NO   |     | NULL    |                |
| is_identity_verified  | bit(1)                | YES  |     | NULL    |                |
| last_name             | varchar(50)           | NO   |     | NULL    |                |
| password              | varchar(255)          | NO   |     | NULL    |                |
| phone                 | varchar(20)           | NO   |     | NULL    |                |
| role                  | enum('CLIENT',...)    | NO   |     | NULL    |                |
+-----------------------+-----------------------+------+-----+---------+----------------+
```

> **Note :** La table `users` a été créée automatiquement par Hibernate grâce à `spring.jpa.hibernate.ddl-auto=update` dans `application.properties`. Aucune création manuelle n'est nécessaire.

---

## ÉTAPE 3: Tester les APIs REST avec Postman

### 3.1 Créer une collection Postman
1. Ouvrir Postman
2. Cliquer sur **Collections > + > Nommer : ImmoConnect API**

### 3.2 Test 1: Backend opérationnel

| Champ | Valeur |
|---|---|
| **Méthode** | GET |
| **URL** | `http://localhost:8080/api/test` |

Cliquer sur **Send**.
**Résultat attendu :**
* **Status :** `200 OK` 
* **Body :** `Backend Spring Boot opérationnel`

### 3.3 Test 2: Connexion MySQL

| Champ | Valeur |
|---|---|
| **Méthode** | GET |
| **URL** | `http://localhost:8080/api/db-connection` |

Cliquer sur **Send**.
**Résultat attendu :**
* **Status :** `200 OK` 
* **Body :**
```json
{
  "status": "SUCCESS",
  "message": "Connexion MySQL établie avec succès !",
  "userCount": 0
}
```

---

## ÉTAPE 4: Lancer le Frontend React

### 4.1 Ouvrir un NOUVEAU terminal (garder le premier ouvert)
```powershell
cd C:\Users\hp\Desktop\real-estate-webapp\frontend
```

### 4.2 Installer les dépendances (uniquement la première fois)
```powershell
npm install
```

### 4.3 Lancer le serveur de développement
```powershell
npm run dev
```
**Résultat attendu :**
```text
  VITE v5.x.x  ready in 500 ms
  ➜  Local:   http://localhost:5173/    (ou 5174 si 5173 est occupé)
```

### 4.4 Ouvrir le navigateur
Ouvrir : `http://localhost:5173` (ou `http://localhost:5174`)

---

## ÉTAPE 5: Récapitulatif des Preuves à Présenter

| # | Preuve | 
|---|---|
| 1 | Docker tourne avec 2 conteneurs |
| 2 | Backend démarré + table créée | 
| 3 | Table `users` créée automatiquement | 
| 4 | API `/api/test` fonctionne | 
| 5 | Connexion MySQL fonctionne | 
| 6 | Frontend React affiche le statut backend | 
| 7 | Code source organisé en couches | 

---

## ÉTAPE 6: Architecture Fonctionnelle à Expliquer

```text
┌──────────────────────────────────────────────────┐
│  FRONTEND (React + Vite)                         │
│  http://localhost:5173 ou 5174                   │
│  └─ Header, Hero, PropertyList, Footer           │
└──────────────────────────────────────────────────┘
                     ⬇ HTTP/JSON (Axios + CORS)
┌──────────────────────────────────────────────────┐
│  BACKEND (Spring Boot 3 + Java 21)               │
│  http://localhost:8080                           │
│  ├─ Controller  → TestController                 │
│  ├─ Service     → UserService                    │
│  └─ Repository  → UserRepository                 │
└──────────────────────────────────────────────────┘
                     ⬇ JDBC / Hibernate (ORM)
┌──────────────────────────────────────────────────┐
│  BASE DE DONNÉES (MySQL 8 dans Docker)           │
│  localhost:3307                                  │
│  └─ Table : users (11 colonnes)                  │
└──────────────────────────────────────────────────┘
```

---

## ÉTAPE 7: Visualiser la Base de Données

La base MySQL tourne dans un conteneur Docker sur le **port 3307**. 

## Pour visualiser la base de données on utilise DBeaver:
**DBeaver** est un client MySQL gratuit, moderne et multiplateforme. C'est l'outil idéal pour explorer la base de données.

#### Installation

1. Télécharger DBeaver : [https://dbeaver.io/download/](https://dbeaver.io/download/)
2. Installer la version **Community** (gratuite)
3. Lancer DBeaver

#### Connexion à la base Docker

1. Cliquer sur **"New Database Connection"** (icône prise électrique en haut à gauche)
2. Choisir **MySQL** → **Next**
3. Remplir les champs :

| Champ | Valeur |
| :--- | :--- |
| **Server Host** | `localhost` |
| **Port** | `3307` ⚠️ (pas 3306) |
| **Database** | `real_estate_db` |
| **Username** | `username` |
| **Password** | `password` |

4. Cliquer sur **"Test Connection"**  
   → Si un message "Connected" apparaît, la connexion est réussie   
   → Sinon, cliquer sur "Download Driver" puis retester.
5. Cliquer sur **Finish**

#### Visualiser les tables

Dans le panneau de gauche, dérouler :
```text
real_estate_db
└── Databases
└── real_estate_db
└── Tables
└── users ← Double-cliquer dessus
```

- Onglet **Data** : affiche les données (lignes)
- Onglet **Properties** : affiche la structure (colonnes, types, clés)
- Onglet **ER Diagram** : schéma visuel de la base


## ÉTAPE 8: Commandes Utiles (Résumé)

**Démarrer toute l'application**
```powershell
# Terminal 1 : Docker (MySQL + Backend)
cd C:\Users\hp\Desktop\real-estate-webapp
docker-compose up -d --build

# Terminal 2 : Frontend React
cd C:\Users\hp\Desktop\real-estate-webapp\frontend
npm run dev
```

**Arrêter toute l'application**
```powershell
# Arrêter Docker
cd C:\Users\hp\Desktop\real-estate-webapp
docker-compose down

# Arrêter React : Ctrl+C dans le terminal
```

**Vérifier l'état**
```powershell
# Conteneurs actifs
docker ps

# Logs du backend
docker logs real_estate_backend

# Tables MySQL
docker exec -it real_estate_mysql mysql -u <DB_USER> -p<DB_PASSWORD> -e "USE real_estate_db; SHOW TABLES;"

# Structure d'une table
docker exec -it real_estate_mysql mysql -u <DB_USER> -p<DB_PASSWORD> -e "USE real_estate_db; DESCRIBE users;"

# Voir les données d'une table
docker exec -it real_estate_mysql mysql -u <DB_USER> -p<DB_PASSWORD> -e "USE real_estate_db; SELECT * FROM users;"

# Mode interactif 
docker exec -it real_estate_mysql mysql -u <DB_USER> -p<DB_PASSWORD> -e
# ou
docker exec -it real_estate_mysql mysql -u <DB_USER> -p   #ici il faut entrer mdp après
# et après faire
USE real_estate_db;
SHOW TABLES;
DESCRIBE users;
SELECT * FROM users;
```


**URLs à connaître**

| Service | URL |
|---|---|
| **Backend API** | `http://localhost:8080/api` |
| **Test Backend** | `http://localhost:8080/api/test` |
| **Test Connexion BD** | `http://localhost:8080/api/db-connection` |
| **Frontend React** | `http://localhost:5173` (ou 5174) |
| **MySQL (Docker)** | `localhost:3307` (user: root, password: root) |

---

## ÉTAPE 9: Points Clés 

* **Architecture en 3 couches :** Controller → Service → Repository (séparation des responsabilités).
* **Injection de dépendances :** Spring gère les Beans (IoC), pas de `new`.
* **ORM Hibernate :** La table `users` est créée automatiquement à partir de l'entité `User.java` (`ddl-auto=update`).
* **Docker :** MySQL et Backend tournent dans des conteneurs isolés et reproductibles.
* **Communication Frontend ↔ Backend :** API REST (HTTP/JSON) avec CORS configuré.
* **Connexion MySQL :** Prouvée par le endpoint `/api/db-connection` qui exécute un `SELECT COUNT(*) FROM users`.

---

## ÉTAPE 10: Résolution des Problèmes Courants

| Problème | Cause | Solution |
|---|---|---|
| `port is already allocated` | Un autre service utilise 8080 | `docker stop <conteneur>` ou changer le port |
| `Network Error` dans React | CORS non configuré | Vérifier que `CorsConfig.java` autorise `localhost:5173/5174` |
| `Cannot connect to MySQL` | Conteneur MySQL non démarré | `docker-compose up -d` |
| `Table 'users' doesn't exist` | Hibernate n'a pas créé la table | Vérifier `ddl-auto=update` et redémarrer |
| `Cannot find module 'react'` | Dépendances non installées | `cd frontend && npm install` |

---

## Conclusion

État d'avancement:
* Une architecture Docker complète (MySQL + Backend)
* Un backend Spring Boot en 3 couches (Controller → Service → Repository)
* Une base de données MySQL créée automatiquement par Hibernate
* Un frontend React connecté au backend via API REST
* Une communication fonctionnelle Frontend ↔ Backend ↔ MySQL

Toute la chaîne est opérationnelle et démontrable. 