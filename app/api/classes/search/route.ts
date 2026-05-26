import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { ClassFormat, Curriculum, type Prisma } from "../../../generated/prisma";

const PUBLIC_SEARCH_CACHE = {
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const subject     = searchParams.get("subject") || "";
    const curriculum  = searchParams.get("curriculum") || "";
    const gradeLevel  = searchParams.get("gradeLevel") || "";
    const format      = searchParams.get("format") || "";
    const location    = searchParams.get("location") || "";
    const search      = searchParams.get("search") || "";
    const minPrice    = searchParams.get("minPrice") || "";
    const maxPrice    = searchParams.get("maxPrice") || "";
    const sortBy      = searchParams.get("sortBy") || "newest";
    const page        = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit       = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 12)));
    const skip        = (page - 1) * limit;

    // Build the Prisma filter object dynamically
    const where: Prisma.ClassWhereInput = {};

    // Subject filter (exact match from dropdown)
    if (subject) {
      where.subject = subject;
    }

    // Curriculum filter
    if (Object.values(Curriculum).includes(curriculum as Curriculum)) {
      where.curriculum = curriculum as Curriculum;
    }

    // Grade level filter (partial text match)
    if (gradeLevel) {
      where.gradeLevel = {
        contains: gradeLevel,
        mode: "insensitive",
      };
    }

    // Format filter (IN_PERSON, ONLINE, HYBRID)
    if (Object.values(ClassFormat).includes(format as ClassFormat)) {
      where.format = format as ClassFormat;
    }

    // Location filter (partial match)
    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      const priceFilter: Prisma.IntFilter = {};
      if (minPrice) priceFilter.gte = Number(minPrice);
      if (maxPrice) priceFilter.lte = Number(maxPrice);
      where.priceEgp = priceFilter;
    }

    // Text search: match class title, OR tutor name, OR center name
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          owner: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          center: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Sort options
    let orderBy: Prisma.ClassOrderByWithRelationInput = { createdAt: "desc" }; // newest first (default)
    if (sortBy === "price_asc")  orderBy = { priceEgp: "asc" };
    if (sortBy === "price_desc") orderBy = { priceEgp: "desc" };
    if (sortBy === "popular")    orderBy = { bookings: { _count: "desc" } };

    const [items, total] = await Promise.all([
      prisma.class.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          tutors: { include: { tutor: true } },
          center: true,
          owner: true,
          _count: { select: { bookings: true } },
        },
      }),
      prisma.class.count({ where }),
    ]);

    return NextResponse.json(
      { items, total, hasMore: skip + items.length < total },
      { headers: PUBLIC_SEARCH_CACHE }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
