"use client";

import { useState } from "react";
import { Download, Heart } from "lucide-react";
import Image from "next/image";

const emojisMockData = [
  "😊",
  "🎉",
  "🚀",
  "🌈",
  "🍕",
  "🐱",
  "🌺",
  "🎸",
  "🏆",
  "🍦",
  "🌙",
  "🦄",
];

interface EmojiGridProps {
  emojis?: {
    url: string;
    alt: string;
    id: string;
    loading?: boolean;
  }[];
}

export function EmojiGrid({ emojis = [] }: EmojiGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
      {emojis.map((emoji, index) => (
        <div
          key={index}
          className="group relative bg-card text-card-foreground rounded-lg p-4 text-center cursor-pointer transition-all duration-300 hover:shadow-lg aspect-square"
        >
          {emoji.loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : emoji.url ? (
            <div className="relative w-full h-full">
              <Image
                src={emoji.url}
                alt={`AI generated emoji ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-red-500">
              Failed to load
            </div>
          )}
          {!emoji.loading && emoji.url && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Download className="text-white h-6 w-6" />
              <Heart className="text-white h-6 w-6" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
