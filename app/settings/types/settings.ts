export interface SettingsFormData {
  name: string
  mobileNumber: string
  topics: string
}

export interface TopicSelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export interface ApiResponse {
  success: boolean
  message?: string
  error?: string
} 