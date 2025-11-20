/**
 * Seed pour créer des dictées d'exemple
 */

import { prisma } from "../../lib/prisma";
import {
  SchoolLevel,
  DictationCategory,
  Difficulty,
} from "../../types/dictation";

const dictations = [
  // CP - Facile
  {
    title: "Les animaux de la ferme",
    text: "Le chat miaule. Le chien aboie. La vache meugle. Le coq chante.",
    level: SchoolLevel.CP,
    category: DictationCategory.VOCABULARY,
    difficulty: Difficulty.EASY,
    description: "Dictée simple sur les animaux et leurs cris",
    estimatedDuration: 3,
  },
  {
    title: "Les couleurs",
    text: "Le ciel est bleu. L'herbe est verte. Le soleil est jaune. La fleur est rouge.",
    level: SchoolLevel.CP,
    category: DictationCategory.VOCABULARY,
    difficulty: Difficulty.EASY,
    description: "Apprendre les couleurs de base",
    estimatedDuration: 3,
  },
  {
    title: "Ma famille",
    text: "J'ai un papa et une maman. J'ai aussi un frère. Ma sœur s'appelle Marie.",
    level: SchoolLevel.CP,
    category: DictationCategory.VOCABULARY,
    difficulty: Difficulty.EASY,
    description: "Vocabulaire de la famille",
    estimatedDuration: 3,
  },

  // CP - Moyen
  {
    title: "Les jours de la semaine",
    text: "Lundi, mardi, mercredi, jeudi, vendredi, samedi et dimanche. Aujourd'hui, c'est lundi.",
    level: SchoolLevel.CP,
    category: DictationCategory.VOCABULARY,
    difficulty: Difficulty.MEDIUM,
    description: "Apprendre les jours de la semaine",
    estimatedDuration: 4,
  },
  {
    title: "Les nombres",
    text: "Un, deux, trois, quatre, cinq. J'ai cinq pommes dans mon panier.",
    level: SchoolLevel.CP,
    category: DictationCategory.VOCABULARY,
    difficulty: Difficulty.MEDIUM,
    description: "Nombres de un à cinq",
    estimatedDuration: 4,
  },

  // CE1 - Facile
  {
    title: "Le printemps",
    text: "Au printemps, les fleurs poussent. Les oiseaux chantent. Le soleil brille. Les arbres ont de nouvelles feuilles vertes.",
    level: SchoolLevel.CE1,
    category: DictationCategory.VOCABULARY,
    difficulty: Difficulty.EASY,
    description: "Vocabulaire du printemps",
    estimatedDuration: 5,
  },
  {
    title: "Les verbes en -er",
    text: "Je mange une pomme. Tu joues dans le jardin. Il regarde les oiseaux. Nous aimons les fleurs.",
    level: SchoolLevel.CE1,
    category: DictationCategory.CONJUGATION,
    difficulty: Difficulty.EASY,
    description: "Conjugaison des verbes du premier groupe au présent",
    estimatedDuration: 5,
  },

  // CE1 - Moyen
  {
    title: "Les animaux sauvages",
    text: "Le lion rugit dans la savane. L'éléphant barrit fort. Le singe saute de branche en branche. Le zèbre court très vite.",
    level: SchoolLevel.CE1,
    category: DictationCategory.VOCABULARY,
    difficulty: Difficulty.MEDIUM,
    description: "Vocabulaire des animaux sauvages",
    estimatedDuration: 6,
  },
  {
    title: "L'accord sujet-verbe",
    text: "Les enfants jouent dans la cour. La maîtresse lit une histoire. Les élèves écoutent attentivement. Le chat dort sur le tapis.",
    level: SchoolLevel.CE1,
    category: DictationCategory.GRAMMAR,
    difficulty: Difficulty.MEDIUM,
    description: "Accord du verbe avec le sujet",
    estimatedDuration: 6,
  },

  // CE2 - Facile
  {
    title: "Les saisons",
    text: "En hiver, il neige et il fait froid. Au printemps, les fleurs éclosent. En été, le soleil brille. En automne, les feuilles tombent.",
    level: SchoolLevel.CE2,
    category: DictationCategory.VOCABULARY,
    difficulty: Difficulty.EASY,
    description: "Vocabulaire des saisons",
    estimatedDuration: 7,
  },
  {
    title: "Les adjectifs",
    text: "Le grand arbre est vert. La petite fille est joyeuse. Les gros nuages sont gris. Les jolies fleurs sentent bon.",
    level: SchoolLevel.CE2,
    category: DictationCategory.GRAMMAR,
    difficulty: Difficulty.EASY,
    description: "Accord des adjectifs",
    estimatedDuration: 7,
  },

  // CE2 - Moyen
  {
    title: "Le passé composé",
    text: "Hier, j'ai mangé une pomme. Tu as joué au football. Il a regardé un film. Nous avons visité un musée.",
    level: SchoolLevel.CE2,
    category: DictationCategory.CONJUGATION,
    difficulty: Difficulty.MEDIUM,
    description: "Conjugaison au passé composé",
    estimatedDuration: 8,
  },
  {
    title: "Les homophones",
    text: "Il a mangé son pain. Le chien a un panier. La mer est bleue. La mère de Paul est gentille.",
    level: SchoolLevel.CE2,
    category: DictationCategory.ORTHOGRAPHY,
    difficulty: Difficulty.MEDIUM,
    description: "Distinction des homophones courants",
    estimatedDuration: 8,
  },

  // CE2 - Difficile
  {
    title: "Les accords complexes",
    text: "Les grandes maisons blanches sont belles. Les petits enfants joyeux jouent ensemble. Les jolies fleurs rouges sentent bon.",
    level: SchoolLevel.CE2,
    category: DictationCategory.GRAMMAR,
    difficulty: Difficulty.HARD,
    description: "Accords multiples (adjectifs, pluriels)",
    estimatedDuration: 9,
  },

  // CM1 - Moyen
  {
    title: "L'imparfait",
    text: "Quand j'étais petit, je jouais dans le jardin. Tu lisais des livres. Il courait dans la cour. Nous chantions des chansons.",
    level: SchoolLevel.CM1,
    category: DictationCategory.CONJUGATION,
    difficulty: Difficulty.MEDIUM,
    description: "Conjugaison à l'imparfait",
    estimatedDuration: 10,
  },
  {
    title: "Les mots invariables",
    text: "Hier, j'ai beaucoup travaillé. Aujourd'hui, je suis très content. Demain, je partirai en vacances. Cependant, il faut finir les devoirs.",
    level: SchoolLevel.CM1,
    category: DictationCategory.ORTHOGRAPHY,
    difficulty: Difficulty.MEDIUM,
    description: "Orthographe des mots invariables",
    estimatedDuration: 10,
  },

  // CM1 - Difficile
  {
    title: "Les participes passés",
    text: "Les fleurs que j'ai cueillies sont belles. Les pommes que tu as mangées étaient délicieuses. Les livres qu'il a lus sont intéressants.",
    level: SchoolLevel.CM1,
    category: DictationCategory.GRAMMAR,
    difficulty: Difficulty.HARD,
    description: "Accord du participe passé avec l'auxiliaire avoir",
    estimatedDuration: 12,
  },

  // CM2 - Moyen
  {
    title: "Le futur simple",
    text: "Demain, je partirai en voyage. Tu visiteras Paris. Il apprendra l'anglais. Nous irons au cinéma.",
    level: SchoolLevel.CM2,
    category: DictationCategory.CONJUGATION,
    difficulty: Difficulty.MEDIUM,
    description: "Conjugaison au futur simple",
    estimatedDuration: 11,
  },
  {
    title: "Les accords du participe passé",
    text: "Les lettres que j'ai écrites sont longues. Les pommes que nous avons cueillies sont mûres. Les fleurs qu'elle a plantées poussent bien.",
    level: SchoolLevel.CM2,
    category: DictationCategory.GRAMMAR,
    difficulty: Difficulty.MEDIUM,
    description: "Accord du participe passé avec COD",
    estimatedDuration: 11,
  },

  // CM2 - Difficile
  {
    title: "Les homophones grammaticaux",
    text: "Il a mangé son pain. Le chien a un panier. La mer est bleue. La mère de Paul est gentille. Il faut mettre ses chaussures. Ses amis sont arrivés.",
    level: SchoolLevel.CM2,
    category: DictationCategory.ORTHOGRAPHY,
    difficulty: Difficulty.HARD,
    description: "Distinction des homophones grammaticaux",
    estimatedDuration: 13,
  },
  {
    title: "Les accords complexes",
    text: "Les grandes maisons blanches que nous avons visitées étaient magnifiques. Les petits enfants joyeux que tu as rencontrés jouaient ensemble.",
    level: SchoolLevel.CM2,
    category: DictationCategory.GRAMMAR,
    difficulty: Difficulty.HARD,
    description: "Accords multiples et participes passés",
    estimatedDuration: 14,
  },
];

export async function seedDictations() {
  console.log("🌱 Seeding dictées...");

  for (const dictation of dictations) {
    const wordCount = dictation.text.trim().split(/\s+/).filter((w) => w.length > 0).length;

    // Chercher si la dictée existe déjà
    const existing = await prisma.dictation.findFirst({
      where: {
        title: dictation.title,
        level: dictation.level,
      },
    });

    if (existing) {
      // Mettre à jour si elle existe
      await prisma.dictation.update({
        where: { id: existing.id },
        data: {
          text: dictation.text,
          category: dictation.category,
          difficulty: dictation.difficulty,
          description: dictation.description,
          estimatedDuration: dictation.estimatedDuration,
          wordCount,
        },
      });
    } else {
      // Créer si elle n'existe pas
      await prisma.dictation.create({
        data: {
          title: dictation.title,
          text: dictation.text,
          level: dictation.level,
          category: dictation.category,
          difficulty: dictation.difficulty,
          description: dictation.description,
          estimatedDuration: dictation.estimatedDuration,
          wordCount,
        },
      });
    }
  }

  console.log(`✅ ${dictations.length} dictées créées avec succès!`);
}

// Exécuter le seed si le fichier est appelé directement
if (require.main === module) {
  seedDictations()
    .catch((error) => {
      console.error("Erreur lors du seeding:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

