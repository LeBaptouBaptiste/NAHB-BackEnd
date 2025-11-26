"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ollamaClient = exports.OllamaClient = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Client for interacting with Ollama API
 */
class OllamaClient {
    client;
    baseUrl;
    defaultModel;
    constructor(baseUrl, defaultModel) {
        this.baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.defaultModel = defaultModel || process.env.OLLAMA_MODEL || 'llama3.2:3b';
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 300000, // 5 minutes for long generations
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Generate text using Ollama
     */
    async generate(prompt, options) {
        const request = {
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
            const response = await this.client.post('/api/generate', request);
            return response.data.response;
        }
        catch (error) {
            console.error('Ollama generation error:', error.message);
            throw new Error(`Failed to generate with Ollama: ${error.message}`);
        }
    }
    /**
     * Check if Ollama service is available
     */
    async healthCheck() {
        try {
            await this.client.get('/');
            return true;
        }
        catch (error) {
            console.error('Ollama health check failed:', error);
            return false;
        }
    }
    /**
     * List available models
     */
    async listModels() {
        try {
            const response = await this.client.get('/api/tags');
            return response.data.models?.map((m) => m.name) || [];
        }
        catch (error) {
            console.error('Failed to list models:', error);
            return [];
        }
    }
    /**
     * Generate text with streaming support
     */
    async generateStream(prompt, onChunk, options) {
        const request = {
            model: options?.model || this.defaultModel,
            prompt,
            stream: true,
            options: {
                temperature: options?.temperature ?? 0.7,
            },
        };
        try {
            const response = await this.client.post('/api/generate', request, {
                responseType: 'stream',
            });
            return new Promise((resolve, reject) => {
                response.data.on('data', (chunk) => {
                    try {
                        const lines = chunk.toString().split('\n').filter(line => line.trim());
                        for (const line of lines) {
                            const data = JSON.parse(line);
                            if (data.response) {
                                onChunk(data.response);
                            }
                            if (data.done) {
                                resolve();
                            }
                        }
                    }
                    catch (error) {
                        // Ignore parsing errors for incomplete chunks
                    }
                });
                response.data.on('error', reject);
                response.data.on('end', resolve);
            });
        }
        catch (error) {
            console.error('Ollama streaming error:', error.message);
            throw new Error(`Failed to stream with Ollama: ${error.message}`);
        }
    }
}
exports.OllamaClient = OllamaClient;
// Export singleton instance
exports.ollamaClient = new OllamaClient();
//# sourceMappingURL=ollamaClient.js.map