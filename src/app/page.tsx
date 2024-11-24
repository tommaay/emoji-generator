import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { SearchBar } from "@/components/search-bar";
import { ImageGrid } from "@/components/images-grid";
import { db } from "@/db";
import { imageLikes } from "@/db/schema";
import { getProfile } from "@/app/actions/auth";

export default async function Page() {
  const userResponse = await getProfile();
  if (!userResponse.success) return [];

  const { user } = userResponse.data!;

  const images = await db.query.images.findMany({
    orderBy: (images, { desc }) => [desc(images.created_at)],
  });

  const userLikedImages = await db.query.imageLikes.findMany({
    where: eq(imageLikes.user_id, user.user_id),
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
      <SearchBar user={user} />
      <ImageGrid images={imagesWithLikes} />
    </main>
  );
}
