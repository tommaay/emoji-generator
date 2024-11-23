"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SearchBar() {
  const [prompt, setPrompt] = useState('')
  const [generatedEmoji, setGeneratedEmoji] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder for emoji generation
    setGeneratedEmoji('😊')
  }

  return (
    <div className="max-w-md mx-auto my-8">
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
        <Input
          type="text"
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full"
        />
        <Button type="submit" className="w-full">Generate Emoji</Button>
      </form>
      {generatedEmoji && (
        <div className="text-center mt-4">
          <p className="text-6xl">{generatedEmoji}</p>
        </div>
      )}
    </div>
  )
}

