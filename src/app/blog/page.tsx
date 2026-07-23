
import Container from "@/components/primitive/Container";
import { Metadata } from "next";

export default function Blog() {
  return (
    <Container>
      <section className="pt-32 pb-16">
        <h1 className="font-mono text-4xl font-bold mb-4">Blog</h1>
        <p className="text-white/80">Placeholder Blog</p>
      </section>
    </Container>
  );
}

export const metadata: Metadata = {
  title: "Blog | The Linux User Group",
  description:
    "Latest updates, tutorials, and news from The University of Auckland Linux User Group.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
    types: {
      "application/rss+xml": `${process.env.NEXT_PUBLIC_SITE_URL}/blog/rss.xml`,
    },
  },
};
