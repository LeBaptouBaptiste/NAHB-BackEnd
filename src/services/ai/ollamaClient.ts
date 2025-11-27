import axios, { AxiosInstance } from "axios";
import { OllamaGenerateRequest, OllamaGenerateResponse } from "./types";

/**
 * Client for interacting with Ollama API
 */
export class OllamaClient {
	private client: AxiosInstance;
	private baseUrl: string;
	private defaultModel: string;

	constructor(baseUrl?: string, defaultModel?: string) {
		this.baseUrl =
			baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
		this.defaultModel =
			defaultModel || process.env.OLLAMA_MODEL || "llama3.2:3b";

		this.client = axios.create({
			baseURL: this.baseUrl,
			timeout: 300000, // 5 minutes for long generations
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Generate text using Ollama
	 */
	async generate(
		prompt: string,
		options?: {
			model?: string;
			temperature?: number;
			top_p?: number;
			top_k?: number;
			num_predict?: number;
		}
	): Promise<string> {
		const request: OllamaGenerateRequest = {
			model: options?.model || this.defaultModel,
			prompt,
			stream: false,
			options: {
				temperature: options?.temperature ?? 0.7,
				top_p: options?.top_p ?? 0.9,
				top_k: options?.top_k ?? 40,
				num_predict: options?.num_predict ?? 2000,
			},
		};

		try {
			const response = await this.client.post<OllamaGenerateResponse>(
				"/api/generate",
				request
			);
			return response.data.response;
		} catch (error: any) {
			console.error("Ollama generation error:", error.message);
			throw new Error(`Failed to generate with Ollama: ${error.message}`);
		}
	}

	/**
	 * Check if Ollama service is available
	 */
	async healthCheck(): Promise<boolean> {
		try {
			await this.client.get("/");
			return true;
		} catch (error) {
			console.error("Ollama health check failed:", error);
			return false;
		}
	}

	/**
	 * List available models
	 */
	async listModels(): Promise<string[]> {
		try {
			const response = await this.client.get("/api/tags");
			return response.data.models?.map((m: any) => m.name) || [];
		} catch (error) {
			console.error("Failed to list models:", error);
			return [];
		}
	}

	/**
	 * Generate text with streaming support
	 */
	async generateStream(
		prompt: string,
		onChunk: (chunk: string) => void,
		options?: {
			model?: string;
			temperature?: number;
		}
	): Promise<void> {
		const request: OllamaGenerateRequest = {
			model: options?.model || this.defaultModel,
			prompt,
			stream: true,
			options: {
				temperature: options?.temperature ?? 0.7,
			},
		};

		try {
			const response = await this.client.post("/api/generate", request, {
				responseType: "stream",
			});

			return new Promise((resolve, reject) => {
				response.data.on("data", (chunk: Buffer) => {
					try {
						const lines = chunk
							.toString()
							.split("\n")
							.filter((line) => line.trim());
						for (const line of lines) {
							const data = JSON.parse(line);
							if (data.response) {
								onChunk(data.response);
							}
							if (data.done) {
								resolve();
							}
						}
					} catch (error) {
						// Ignore parsing errors for incomplete chunks
					}
				});

				response.data.on("error", reject);
				response.data.on("end", resolve);
			});
		} catch (error: any) {
			console.error("Ollama streaming error:", error.message);
			throw new Error(`Failed to stream with Ollama: ${error.message}`);
		}
	}
}

// Export singleton instance
export const ollamaClient = new OllamaClient();
