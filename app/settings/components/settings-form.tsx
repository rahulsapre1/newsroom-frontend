"use client"

import { useState, useEffect } from "react"
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

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set')
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
console.log('API URL:', API_BASE_URL) // Log the API URL for debugging

const formSchema = z.object({
  mobileNumber: z.string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(10, "Mobile number must not exceed 10 digits")
    .regex(/^\d+$/, "Mobile number must contain only digits"),
  topics: z.string().min(1, "At least one topic is required"),
})

type FormData = z.infer<typeof formSchema>

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiUrl, setApiUrl] = useState<string>('')

  // Log API URL when component mounts
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL
    console.log('Current API URL:', url)
    setApiUrl(url || '')
  }, [])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobileNumber: "",
      topics: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      console.log("Submitting form with data:", data)
      
      if (!apiUrl) {
        throw new Error("API URL is not configured. Please check your environment variables.")
      }

      // Convert topics string to array
      const topicsArray = data.topics.split(",").map(topic => topic.trim()).filter(Boolean)
      
      const requestBody = {
        mobile_number: data.mobileNumber,
        topics_of_interest: topicsArray
      }
      
      // Create/update user with all details
      const endpoint = `${apiUrl}/api/v1/users`
      console.log("Creating/updating user with request:", {
        url: endpoint,
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: requestBody
      })
      
      try {
        // First try an OPTIONS request
        console.log("Sending OPTIONS request to check CORS...")
        const optionsResponse = await fetch(endpoint, {
          method: "OPTIONS",
          headers: {
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,accept",
            "Origin": window.location.origin
          }
        })
        console.log("OPTIONS response:", {
          status: optionsResponse.status,
          headers: Object.fromEntries(optionsResponse.headers.entries())
        })

        // Then send the actual POST request
        console.log("Sending POST request...")
        const userResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(requestBody),
        })

        console.log("POST response:", {
          status: userResponse.status,
          headers: Object.fromEntries(userResponse.headers.entries())
        })
        
        if (!userResponse.ok) {
          const errorData = await userResponse.json().catch(() => null)
          console.error("Error response data:", errorData)
          const errorMessage = errorData?.detail || errorData?.message || `Server error: ${userResponse.status}`
          throw new Error(errorMessage)
        }

        const responseData = await userResponse.json()
        console.log("Success response:", responseData)
        toast.success("Settings updated successfully")

      } catch (fetchError: any) {
        console.error("Fetch error details:", {
          name: fetchError.name,
          message: fetchError.message,
          cause: fetchError.cause
        })
        
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          throw new Error(`Unable to connect to ${apiUrl}. Please check your internet connection and API URL.`)
        }
        throw fetchError
      }

    } catch (error) {
      console.error("Form submission error:", error)
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
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