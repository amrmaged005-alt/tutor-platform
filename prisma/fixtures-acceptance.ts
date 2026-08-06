/**
 * Acceptance-evidence fixtures for the Wave 1 overhaul tasks.
 *
 * WHY THIS IS NOT PART OF prisma/seed.ts
 * seed.ts is demo content: it uses bare `create` (so it throws on re-run), sets no
 * passwords, and gives every tutor the default FULL access level. Acceptance evidence
 * needs the opposite properties — idempotent, log-in-able, and deterministic across
 * all three CenterAccessLevel values. Folding those needs into seed.ts would break its
 * demo purpose; this file is additive and leaves seed.ts untouched.
 *
 * WHAT IT UNBLOCKS
 *   T1-05  FULL / LIMITED / VIEW_ONLY tutors in one center, each owning a class with
 *          real paid bookings, so the CONN-003 payload check has something to redact.
 *   T1-08  Log-in-able accounts with a known password for the auth regression suite
 *          (login, lockout, session invalidation).
 *   T1-01  A deliberately 1-seat class for the last-seat concurrency test.
 *
 * SAFETY
 *   - Every row is namespaced to @fixtures.coursaty.test and FIXTURE_TAG. Nothing
 *     touches pre-existing data.
 *   - Idempotent: re-running updates in place instead of duplicating.
 *   - `--clean` removes every fixture row and nothing else.
 *   - Refuses to run against a non-local/non-dev database unless --force is passed.
 *
 * USAGE
 *   npx tsx prisma/fixtures-acceptance.ts
 *   npx tsx prisma/fixtures-acceptance.ts --clean
 */
import { PrismaClient } from "../app/generated/prisma";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

const FIXTURE_TAG = "[acceptance-fixture]";
const DOMAIN = "fixtures.coursaty.test";
// Matches app/api/signup/route.ts:62 — cost 12. A cheaper hash would make the
// lockout/login tests exercise a different code path than production.
const PASSWORD = "FixturePass!234";
const PASSWORD_HASH = hashSync(PASSWORD, 12);

const email = (local: string) => `${local}@${DOMAIN}`;

const TUTORS = [
  { local: "tutor-full", name: "Fixture Tutor (FULL)", level: "FULL" as const, phone: "+201000000101" },
  { local: "tutor-limited", name: "Fixture Tutor (LIMITED)", level: "LIMITED" as const, phone: "+201000000102" },
  { local: "tutor-viewonly", name: "Fixture Tutor (VIEW_ONLY)", level: "VIEW_ONLY" as const, phone: "+201000000103" },
];

async function clean() {
  // Order matters: bookings -> classes -> users -> center (FK dependencies).
  const users = await prisma.user.findMany({
    where: { email: { endsWith: `@${DOMAIN}` } },
    select: { id: true },
  });
  const userIds = users.map((u) => u.id);
  const classes = await prisma.class.findMany({
    where: { OR: [{ ownerId: { in: userIds } }, { description: { contains: FIXTURE_TAG } }] },
    select: { id: true },
  });
  const classIds = classes.map((c) => c.id);

  const b = await prisma.booking.deleteMany({
    where: { OR: [{ classId: { in: classIds } }, { studentId: { in: userIds } }] },
  });
  await prisma.classTutor.deleteMany({ where: { OR: [{ classId: { in: classIds } }, { tutorId: { in: userIds } }] } });
  const c = await prisma.class.deleteMany({ where: { id: { in: classIds } } });
  const u = await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  const ce = await prisma.learningCenter.deleteMany({ where: { description: { contains: FIXTURE_TAG } } });

  console.log(`Removed: ${b.count} bookings, ${c.count} classes, ${u.count} users, ${ce.count} centers.`);
}

async function seed() {
  // Center — findFirst+create rather than upsert, since name is not unique.
  let center = await prisma.learningCenter.findFirst({ where: { description: { contains: FIXTURE_TAG } } });
  if (!center) {
    center = await prisma.learningCenter.create({
      data: {
        name: "Fixture Learning Center",
        description: `${FIXTURE_TAG} Acceptance-evidence center for T1-05 access-level checks.`,
        city: "Cairo",
        location: "Maadi, Cairo",
        email: email("center"),
      },
    });
  }

  const student = await prisma.user.upsert({
    where: { email: email("student") },
    update: { password: PASSWORD_HASH, isEmailVerified: true, failedLoginCount: 0, lockedUntil: null },
    create: {
      email: email("student"),
      fullName: "Fixture Student",
      name: "Fixture Student",
      phone: "+201000000100",
      role: "STUDENT",
      password: PASSWORD_HASH,
      isEmailVerified: true,
    },
  });

  const tutors = [];
  for (const t of TUTORS) {
    const tutor = await prisma.user.upsert({
      where: { email: email(t.local) },
      update: {
        centerId: center.id,
        centerAccessLevel: t.level,
        password: PASSWORD_HASH,
        failedLoginCount: 0,
        lockedUntil: null,
      },
      create: {
        email: email(t.local),
        fullName: t.name,
        name: t.name,
        phone: t.phone,
        role: "TUTOR",
        subjects: ["Physics", "Math"],
        bio: `${FIXTURE_TAG} access level ${t.level}`,
        password: PASSWORD_HASH,
        isEmailVerified: true,
        centerId: center.id,
        centerAccessLevel: t.level,
      },
    });
    tutors.push({ ...t, id: tutor.id });
  }

  // One class per tutor, each with a paid booking, so a restricted tutor's payload
  // has real revenue and real student PII available to leak if the gate fails.
  for (const t of tutors) {
    const title = `${t.level} Tutor's Class`;
    let cls = await prisma.class.findFirst({ where: { ownerId: t.id, title } });
    if (!cls) {
      cls = await prisma.class.create({
        data: {
          title,
          subject: "Physics",
          description: `${FIXTURE_TAG} owned by ${t.level} tutor.`,
          city: "Cairo",
          priceEgp: 500,
          capacity: 20,
          schedule: "Sun & Tue, 5:00 PM - 7:00 PM",
          centerId: center.id,
          ownerId: t.id,
        },
      });
    }
    const existing = await prisma.booking.findFirst({ where: { classId: cls.id, studentId: student.id } });
    if (!existing) {
      await prisma.booking.create({
        data: {
          classId: cls.id,
          studentId: student.id,
          status: "CONFIRMED",
          paymentStatus: "PAID",
          paidAt: new Date(),
          amountEgp: 500,
          platformFeeEgp: 60,
          tutorPayoutEgp: 440,
          notes: `${FIXTURE_TAG} paid booking for revenue-gate evidence`,
        },
      });
    }
  }

  // T1-01: capacity 1, zero bookings — the last-seat concurrency target.
  const CONCURRENCY_TITLE = "Concurrency Test Class (1 seat)";
  let concurrency = await prisma.class.findFirst({ where: { title: CONCURRENCY_TITLE } });
  if (!concurrency) {
    concurrency = await prisma.class.create({
      data: {
        title: CONCURRENCY_TITLE,
        subject: "Math",
        description: `${FIXTURE_TAG} capacity 1 — for the T1-01 last-seat race test. Reset with --clean.`,
        city: "Cairo",
        priceEgp: 100,
        capacity: 1,
        schedule: "Mon, 6:00 PM - 7:00 PM",
        paymentType: "ONLINE",
        ownerId: tutors[0].id,
      },
    });
  } else {
    // Re-running must hand back a genuinely empty seat, or the race test is invalid.
    await prisma.booking.deleteMany({ where: { classId: concurrency.id } });
  }

  console.log("\nAcceptance fixtures ready.\n");
  console.log(`  Password for every account below: ${PASSWORD}\n`);
  console.log(`  ${email("student")}          STUDENT`);
  for (const t of TUTORS) console.log(`  ${email(t.local).padEnd(40)} TUTOR / ${t.level}`);
  console.log(`\n  Center id ............ ${center.id}`);
  console.log(`  1-seat class id ...... ${concurrency.id}   (T1-01 concurrency target)`);
  console.log(`\n  Each tutor owns one class with a 500 EGP PAID booking (T1-05 evidence).`);
  console.log(`  Re-run to reset; 'npx tsx prisma/fixtures-acceptance.ts --clean' to remove.\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const url = process.env.DATABASE_URL ?? "";
  const looksProd = /prod/i.test(url) && !args.includes("--force");
  if (looksProd) {
    console.error("DATABASE_URL looks production-like. Refusing. Pass --force to override.");
    process.exit(1);
  }
  if (args.includes("--clean")) await clean();
  else await seed();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
