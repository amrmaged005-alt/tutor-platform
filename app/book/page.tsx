import type { Metadata } from "next";
import BookClient from "./BookClient";

export const metadata: Metadata = {
  title: "Coursaty - An Interactive Story",
  description:
    "Discover Coursaty through an interactive book experience. Find verified tutors for Math, Physics, IGCSE, and more across Egypt.",
};

export default function BookPage() {
  return <BookClient />;
}
