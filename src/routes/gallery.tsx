import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/PageHero";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/gallery")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Gallery | BPMF" },
      {
        name: "description",
        content:
          "Photos from BPMF conferences, workshops, iftar mahfil and member gatherings across Bangladesh.",
      },
      { property: "og:title", content: "BPMF Gallery" },
      {
        property: "og:description",
        content: "Moments from foundation events, workshops and member gatherings.",
      },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const gallery = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <PageHero
        eyebrow="Moments"
        title="Gallery"
        subtitle="Conferences, workshops and community gatherings of the foundation."
      />
      <section className="container-page py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(gallery.data ?? []).map((g) => (
            <figure key={g.id} className="overflow-hidden rounded-xl bg-card shadow-card">
              <img
                src={g.image_url}
                alt={g.title}
                loading="lazy"
                className="h-60 w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <figcaption className="px-4 py-4">
                <p className="font-semibold">{g.title}</p>
                {g.caption && <p className="mt-1 text-sm text-muted-foreground">{g.caption}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
        {gallery.isSuccess && (gallery.data ?? []).length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Photos will appear here soon.
          </p>
        )}
      </section>
    </>
  );
}
