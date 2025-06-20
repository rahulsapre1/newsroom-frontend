"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { TopicSelector } from "./topic-selector"
import { SettingsLoading } from "./loading"

const API_BASE_URL = "http://localhost:8080"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobileNumber: z.string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(10, "Mobile number must not exceed 10 digits")
    .regex(/^\d+$/, "Mobile number must contain only digits"),
  topics: z.string().min(1, "At least one topic is required"),
})

type FormData = z.infer<typeof formSchema>

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mobileNumber: "",
      topics: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      console.log("Submitting form with data:", data)
      
      // Convert topics string to array
      const topicsArray = data.topics.split(",").map(topic => topic.trim()).filter(Boolean)
      
      // Create/update user with all details
      console.log("Creating/updating user...")
      const userResponse = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          mobile_number: data.mobileNumber,
          name: data.name,
          topics_of_interest: topicsArray
        }),
      })

      console.log("User API Response status:", userResponse.status)
      let userResponseData
      try {
        userResponseData = await userResponse.json()
        console.log("User API Response data:", userResponseData)
      } catch {
        console.log("Failed to parse user response as JSON:", await userResponse.text())
        throw new Error("Invalid response from server")
      }

      if (!userResponse.ok) {
        throw new Error(userResponseData.error || "Failed to update user details")
      }

      toast.success("Settings updated successfully")
    } catch (error) {
      console.error("Full error details:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <SettingsLoading />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mobileNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your 10-digit mobile number" 
                  type="tel"
                  maxLength={10}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="topics"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TopicSelector
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.topics?.message}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </Form>
  )
} 