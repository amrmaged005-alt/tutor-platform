import type { ClassFilterState } from "./ClassFilters";
import type { ClassCardData } from "./ClassCard";

export const DEFAULT_CLASS_FILTERS: ClassFilterState = {
  q: "",
  subject: "",
  curriculum: "",
  type: "",
  minPrice: "",
  maxPrice: "",
  city: "",
  minRating: "",
  sort: "newest",
};

function matchesText(cls: ClassCardData, query: string) {
  const haystack = [cls.title, cls.subject, cls.description, cls.city, cls.location, cls.owner?.fullName, cls.owner?.name, cls.center?.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function getActiveClassFilterCount(filters: ClassFilterState) {
  return Object.entries(filters).filter(([key, value]) => key !== "sort" && Boolean(value)).length;
}

export function filterClasses(classes: ClassCardData[], state: ClassFilterState) {
  const result = classes.filter((cls) => {
    const price = cls.priceEgp ?? 0;
    const rating = cls.avgRating ?? 0;
    if (state.q && !matchesText(cls, state.q)) return false;
    if (state.subject && cls.subject !== state.subject) return false;
    if (state.curriculum && cls.curriculum !== state.curriculum) return false;
    if (state.type === "online" && cls.format !== "ONLINE") return false;
    if (state.type === "inperson" && cls.format !== "IN_PERSON") return false;
    if (state.city && !(cls.city ?? "").toLowerCase().includes(state.city.toLowerCase())) return false;
    if (state.minPrice && price < Number(state.minPrice)) return false;
    if (state.maxPrice && price > Number(state.maxPrice)) return false;
    if (state.minRating && rating < Number(state.minRating)) return false;
    return true;
  });

  return [...result].sort((a, b) => {
    if (state.sort === "price_asc") return (a.priceEgp ?? 0) - (b.priceEgp ?? 0);
    if (state.sort === "price_desc") return (b.priceEgp ?? 0) - (a.priceEgp ?? 0);
    if (state.sort === "popular") return (b.bookingsCount ?? 0) - (a.bookingsCount ?? 0);
    if (state.sort === "rating") return (b.avgRating ?? 0) - (a.avgRating ?? 0);
    return 0;
  });
}
