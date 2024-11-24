import { SearchBar } from "@/components/search-bar";
import { EmojiGrid } from "@/components/emojis-grid";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <SearchBar />
        <EmojiGrid />
      </div>
    </main>
  );
}
