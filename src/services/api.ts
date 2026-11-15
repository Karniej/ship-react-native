/**
 * API client for calling server-side API routes
 *
 * These routes run on the server and can securely handle API keys.
 * On native platforms, these will call the web server (you need to deploy for production use).
 * For development, you can proxy through your local web server.
 */

// Base URL for API routes
// In production, this should be your deployed server URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Call an API route
 */
export async function callApi<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {} } = options;

  try {
    const url = `${API_BASE_URL}/api/${endpoint.replace(/^\//, "")}`;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error("[API] Request failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ============================================
// Typed API Methods
// ============================================

interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

/**
 * Check server health
 */
export async function checkHealth(): Promise<ApiResponse<HealthResponse>> {
  return callApi<HealthResponse>("health");
}

interface GenerateTextInput {
  prompt: string;
  model?: string;
}

interface GenerateTextResponse {
  text: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate text using AI
 */
export async function generateText(
  input: GenerateTextInput
): Promise<ApiResponse<GenerateTextResponse>> {
  return callApi<GenerateTextResponse>("generate", {
    method: "POST",
    body: { type: "text", ...input },
  });
}

interface GenerateImageInput {
  prompt: string;
}

interface GenerateImageResponse {
  url: string;
  revised_prompt?: string;
}

/**
 * Generate image using AI
 */
export async function generateImage(
  input: GenerateImageInput
): Promise<ApiResponse<GenerateImageResponse>> {
  return callApi<GenerateImageResponse>("generate", {
    method: "POST",
    body: { type: "image", ...input },
  });
}
