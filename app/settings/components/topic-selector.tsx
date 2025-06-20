"use client"

import { TopicSelectorProps } from "../types/settings"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function TopicSelector({
  value,
  onChange,
  error,
  disabled = false
}: TopicSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Format topics: trim spaces, remove empty entries, remove duplicates
    const formattedTopics = e.target.value
      .split(',')
      .map(topic => topic.trim())
      .filter(Boolean)
      .filter((topic, index, self) => self.indexOf(topic) === index)
      .join(', ')
    
    onChange(formattedTopics)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="topics">Topics of Interest</Label>
      <Textarea
        id="topics"
        placeholder="Enter topics separated by commas (e.g., technology, sports, politics)"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 