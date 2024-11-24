"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateImage } from "@/app/actions/image";
import { toast } from "@/hooks/use-toast";
import type { Profile } from "@/db/schema";

interface SearchBarProps {
  user?: Profile;
}

export function SearchBar({ user }: SearchBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");

  const shouldDisableSubmit = user?.credits === 0 || prompt.trim().length === 0 || isGenerating;

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt",
      });
      return;
    }

    try {
      setIsGenerating(true);
      const result = await generateImage({ prompt: prompt.trim() });

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to generate image",
        });
        return;
      }

      // Clear the input and refresh the grid
      setPrompt("");
      setGeneratedImage(result?.data?.imageUrl || "");
      router.refresh();
      toast({
        title: "Success",
        description: "Image generated successfully!",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while generating the image",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
        <Input
          type="text"
          placeholder="Describe your image... (e.g., 'A happy cat playing guitar')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full"
          disabled={isGenerating}
          maxLength={1000}
        />
        <Button type="submit" className="w-full" disabled={shouldDisableSubmit}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Image"
          )}
        </Button>
      </form>

      {isGenerating && (
        <div className="text-center mt-6 text-sm text-muted-foreground">
          This might take a few seconds...
        </div>
      )}
      {generatedImage && (
        <div className="text-center mt-4">
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${generatedImage}`}
            alt="Generated image"
            className="w-full h-auto rounded-lg"
            width={500}
            height={500}
          />
        </div>
      )}
    </div>
  );
}

// Function to convert ReadableStream to Blob
const streamToBlob = async (stream: ReadableStream): Promise<Blob> => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let done: boolean;

  while (({ done } = await reader.read())) {
    if (done) break;
    const { value } = await reader.read();
    chunks.push(value);
  }

  return new Blob(chunks);
};
