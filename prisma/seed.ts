import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Create a learning center
  const center = await prisma.learningCenter.create({
    data: {
      name: "Elite Academy",
      description: "Top-rated tutoring center in Nasr City.",
      city: "Cairo",
      location: "Nasr City, Cairo",
      phone: "01098765432",
      email: "info@eliteacademy.com",
    },
  });

  // Create a tutor belonging to the center
  const tutor1 = await prisma.user.create({
    data: {
      id: "ahmed",
      fullName: "Ahmed Hassan",
      email: "ahmed@coursaty.com",
      phone: "01012345678",
      role: "TUTOR",
      subjects: ["Physics", "Math"],
      bio: "10 years experience teaching Thanaweya Amma.",
      centerId: center.id,
    },
  });

  // Create an independent tutor
  const tutor2 = await prisma.user.create({
    data: {
      fullName: "Sara Mahmoud",
      email: "sara@coursaty.com",
      phone: "01112345678",
      role: "TUTOR",
      subjects: ["Chemistry"],
      bio: "Chemistry specialist.",
    },
  });

  // Create a student
  await prisma.user.create({
    data: {
      id: "student1",
      fullName: "Omar Ali",
      email: "omar@student.com",
      phone: "01212345678",
      role: "STUDENT",
    },
  });

  // Center-owned physics class
  await prisma.class.create({
    data: {
      title: "Physics – Mechanics & Waves",
      subject: "Physics",
      description: "Covers mechanics and waves for Thanaweya Amma.",
      city: "Cairo",
      location: "Nasr City, Cairo",
      priceEgp: 300,
      capacity: 10,
      isOnline: false,
      schedule: "Saturday & Monday, 5:00 PM",
      centerId: center.id,
      tutors: {
        create: [{ tutorId: tutor1.id }],
      },
      materials: {
        create: [
          { title: "Chapter 1 – Newton's Laws", url: "https://example.com/newton.pdf", isLocked: true },
          { title: "Chapter 2 – Wave Motion", url: "https://example.com/waves.pdf", isLocked: true },
        ],
      },
    },
  });

  // Independent tutor chemistry class
  await prisma.class.create({
    data: {
      title: "Chemistry – Organic & Inorganic",
      subject: "Chemistry",
      description: "Full syllabus with past paper walkthroughs.",
      city: "Cairo",
      location: "Maadi, Cairo",
      priceEgp: 275,
      capacity: 12,
      isOnline: false,
      schedule: "Wednesday & Friday, 3:00 PM",
      ownerId: tutor2.id,
      tutors: {
        create: [{ tutorId: tutor2.id }],
      },
    },
  });

  // Center-owned math class
  await prisma.class.create({
    data: {
      title: "Math – Calculus & Algebra",
      subject: "Math",
      description: "Calculus and algebra for secondary students.",
      city: "Cairo",
      location: "Nasr City, Cairo",
      priceEgp: 250,
      capacity: 15,
      isOnline: false,
      schedule: "Tuesday & Thursday, 4:00 PM",
      centerId: center.id,
      tutors: {
        create: [{ tutorId: tutor1.id }],
      },
    },
  });

  console.log("✅ Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());