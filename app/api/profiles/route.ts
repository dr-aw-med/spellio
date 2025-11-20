import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { CreateChildProfileInput } from '@/types/user';
import { z } from 'zod';

const createProfileSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Le nom est trop long'),
  avatar: z.string().nullable().optional(),
  schoolLevel: z.enum(['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6EME', '5EME', '4EME', '3EME']),
});

// GET /api/profiles - Récupérer tous les profils enfants de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Accès refusé. Réservé aux parents.' },
        { status: 403 }
      );
    }

    const profiles = await prisma.childProfile.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Erreur lors de la récupération des profils:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/profiles - Créer un nouveau profil enfant
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Accès refusé. Réservé aux parents.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createProfileSchema.parse(body);

    // Vérifier le nombre maximum de profils (par exemple, 5 par parent)
    const existingProfiles = await prisma.childProfile.count({
      where: {
        userId: session.user.id,
      },
    });

    if (existingProfiles >= 5) {
      return NextResponse.json(
        { error: 'Nombre maximum de profils atteint (5)' },
        { status: 400 }
      );
    }

    const profile = await prisma.childProfile.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        avatar: validatedData.avatar || null,
        schoolLevel: validatedData.schoolLevel,
        isActive: true,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création du profil:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

