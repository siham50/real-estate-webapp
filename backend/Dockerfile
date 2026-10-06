# ============================================
# Étape 1 : Compilation et Build avec Maven et JDK 21
# ============================================
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Installation de Maven
RUN apk add --no-cache maven

# Copie des fichiers de configuration et du code source
COPY pom.xml .
COPY src ./src

# Compilation et packaging de l'application
RUN mvn clean package -DskipTests

# ============================================
# Étape 2 : Image d'exécution légère avec JRE 21
# ============================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copie du binaire .jar généré depuis l'étape de build
COPY --from=build /app/target/*.jar app.jar

# Exposition du port applicatif
EXPOSE 8080

# Commande d'exécution
ENTRYPOINT ["java", "-jar", "app.jar"]