"use client";

import { useState } from "react";
import { Download, Heart } from "lucide-react";
import Image from "next/image";
import { toggleLike } from "@/app/actions/image";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Image {
  id: string;
  image_url: string;
  prompt: string;
  likes_count: number;
  isLiked?: boolean;
  loading?: boolean;
}

interface ImageGridProps {
  images: Image[];
}

export function ImageGrid({ images }: ImageGridProps) {
  const handleLike = async (imageId: string) => {
    try {
      const result = await toggleLike({ imageId });

      if (result.success) {
        toast({
          title: result.data?.liked ? "Liked!" : "Unliked!",
          description: result.data?.liked ? "You liked the image." : "You unliked the image.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to toggle like",
      });
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image-${prompt.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download image",
      });
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
      {images.map((image) => (
        <div
          key={image.id}
          className="group relative bg-card text-card-foreground rounded-lg p-4 text-center transition-all duration-300 hover:shadow-lg aspect-square"
        >
          {image.loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : image.image_url ? (
            <div className="relative w-full h-full">
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${image.image_url}`}
                alt={`AI generated image for "${image.prompt}"`}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-red-500">
              Failed to load
            </div>
          )}

          {!image.loading && image.image_url && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => handleDownload(image.image_url, image.prompt)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <Download className="text-white h-6 w-6" />
              </button>

              <button
                onClick={() => handleLike(image.id)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <Heart
                  className={cn(
                    "h-6 w-6",
                    image.isLiked ? "fill-red-500 text-red-500" : "text-white"
                  )}
                />
              </button>
            </div>
          )}

          {image.likes_count > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-sm px-2 py-1 rounded-full">
              {image.likes_count} ❤️
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
