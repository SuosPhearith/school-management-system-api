import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// initialize Prisma Client

const prisma = new PrismaClient();

async function main() {
  // create two dummy articles

  const user1 = await prisma.user.upsert({
    where: { email: 'suosphearith@admin.com' },

    update: {},

    create: {
      name: 'Suos Phearith',
      email: 'suosphearith@admin.com',
      password: await bcrypt.hash('12345678', 10),
      role: 'admin',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'vendara@principal.com' },

    update: {},

    create: {
      name: 'Ven Dara',
      email: 'vendara@principal.com',
      password: await bcrypt.hash('12345678', 10),
      role: 'principal',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'vannchansethy@teacher.com' },

    update: {},

    create: {
      name: 'Vann Chansethy',
      email: 'vannchansethy@teacher.com',
      password: await bcrypt.hash('12345678', 10),
      role: 'teacher',
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'sombunheng@student.com' },

    update: {},

    create: {
      name: 'Som Bunheng',
      email: 'sombunheng@student.com',
      password: await bcrypt.hash('12345678', 10),
      role: 'student',
    },
  });

  console.log({ user1, user2, user3, user4 });
}

// execute the main function

main()
  .catch((e) => {
    console.error(e);

    process.exit(1);
  })

  .finally(async () => {
    // close Prisma Client at the end

    await prisma.$disconnect();
  });
