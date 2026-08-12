import { use } from "react";
import type { Metadata } from "next";
import { seedEvents, seedVenues } from "@/lib/seed-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = seedEvents.find((e) => e.slug === slug);
  if (!event) {
    return { title: "Concert Not Found" };
  }
  const venue = seedVenues.find((v) => v.id === event.venueId);
  const price = Math.min(...event.ticketCategories.map((c) => c.price));
  return {
    title: `${event.title} - Tickets`,
    description: `${event.description} Get your tickets from ${price.toLocaleString(
      "id-ID"
    )} IDR at TIXCONCERT.`,
    alternates: { canonical: `/concert/${event.slug}` },
    openGraph: {
      title: `${event.title} | TIXCONCERT`,
      description: event.description,
      images: [{ url: event.poster, width: 900, height: 1200 }],
      type: "website",
    },
  };
}

export default function ConcertDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const event = seedEvents.find((e) => e.slug === slug);

  if (event) {
    const venue = seedVenues.find((v) => v.id === event.venueId);
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      name: event.title,
      startDate: `${event.date}T${event.time}`,
      description: event.description,
      image: event.poster,
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "Place",
        name: venue?.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: venue?.address,
          addressLocality: venue?.city,
          addressCountry: "ID",
        },
      },
      offers: {
        "@type": "Offer",
        price: Math.min(...event.ticketCategories.map((c) => c.price)),
        priceCurrency: "IDR",
        availability: "https://schema.org/InStock",
        url: `https://tixconcert.com/concert/${event.slug}`,
      },
    };
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </>
    );
  }
  return children;
}
