import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const subject     = searchParams.get("subject") || "";
    const curriculum  = searchParams.get("curriculum") || "";
    const gradeLevel  = searchParams.get("gradeLevel") || "";
    const format      = searchParams.get("format") || "";
    const location    = searchParams.get("location") || "";
    const search      = searchParams.get("search") || ""; // tutor/center name or class title
    const minPrice    = searchParams.get("minPrice") || "";
    const maxPrice    = searchParams.get("maxPrice") || "";
    const sortBy      = searchParams.get("sortBy") || "newest";

    // Build the Prisma filter object dynamically
    const where: any = {};

    // Subject filter (exact match from dropdown)
    if (subject) {
      where.subject = subject;
    }

    // Curriculum filter
    if (curriculum) {
      where.curriculum = curriculum;
    }

    // Grade level filter (partial text match)
    if (gradeLevel) {
      where.gradeLevel = {
        contains: gradeLevel,
        mode: "insensitive",
      };
    }

    // Format filter (IN_PERSON, ONLINE, HYBRID)
    if (format) {
      where.format = format;
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
      where.priceEgp = {};
      if (minPrice) where.priceEgp.gte = Number(minPrice);
      if (maxPrice) where.priceEgp.lte = Number(maxPrice);
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
    let orderBy: any = { createdAt: "desc" }; // newest first (default)
    if (sortBy === "price_asc")  orderBy = { priceEgp: "asc" };
    if (sortBy === "price_desc") orderBy = { priceEgp: "desc" };
    if (sortBy === "popular")    orderBy = { bookings: { _count: "desc" } };

    const classes = await prisma.class.findMany({
      where,
      orderBy,
      include: {
        tutors: { include: { tutor: true } },
        center: true,
        owner: true,
        _count: { select: { bookings: true } },
      },
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
