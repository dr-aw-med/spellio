# Schéma Prisma Requis pour l'Authentification

Ce fichier documente les modèles Prisma nécessaires pour que le système d'authentification fonctionne.

## Modèles Requis

### User
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  password      String?   // Requis pour l'authentification par email
  image         String?
  role          String    @default("PARENT") // "PARENT" ou "CHILD"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  childProfiles ChildProfile[]
  
  @@map("users")
}
```

### Account (pour OAuth)
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}
```

### Session (pour NextAuth)
```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

### VerificationToken (pour NextAuth)
```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

### ChildProfile
```prisma
model ChildProfile {
  id          String      @id @default(cuid())
  userId      String
  name        String
  avatar      String?
  schoolLevel String      // "CP", "CE1", "CE2", etc.
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("child_profiles")
}
```

## Notes

1. Le champ `password` dans le modèle `User` doit être hashé avec bcrypt avant d'être stocké.
2. Le champ `role` doit être soit "PARENT" soit "CHILD".
3. Le champ `schoolLevel` dans `ChildProfile` doit correspondre aux valeurs définies dans `types/user.ts`.
4. Les relations sont configurées avec `onDelete: Cascade` pour maintenir l'intégrité référentielle.

