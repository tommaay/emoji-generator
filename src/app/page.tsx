import { SearchBar } from "@/components/search-bar";
import { ImageGrid } from "@/components/images-grid";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { useAuth } from "@clerk/nextjs";
import { imageLikes } from "@/db/schema";

export default async function Page() {
  const { userId } = useAuth();
  if (!userId) return [];

  const images = await db.query.images.findMany({
    orderBy: (images, { desc }) => [desc(images.created_at)],
  });

  const userLikedImages = await db.query.imageLikes.findMany({
    where: eq(imageLikes.user_id, userId),
    columns: {
      image_id: true,
    },
  });

  const imagesWithLikes = images.map((image) => ({
    ...image,
    isLiked: userLikedImages.some((like) => like.image_id === image.id),
  }));

  return (
    <main className="container mx-auto px-4 py-8">
      <SearchBar />
      <ImageGrid images={imagesWithLikes} />
    </main>
  );
}
