// Cloudach Go Quickstart
// Requires: go get github.com/sashabaranov/go-openai
// Run: CLOUDACH_API_KEY=sk-cloudach-... go run quickstart.go

package main

import (
	"context"
	"fmt"
	"os"

	openai "github.com/sashabaranov/go-openai"
)

func main() {
	config := openai.DefaultConfig(os.Getenv("CLOUDACH_API_KEY"))
	config.BaseURL = "https://api.cloudach.com/v1"
	client := openai.NewClientWithConfig(config)

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: "llama3-8b",
			Messages: []openai.ChatCompletionMessage{
				{Role: openai.ChatMessageRoleSystem, Content: "You are a helpful assistant."},
				{Role: openai.ChatMessageRoleUser, Content: "What is the capital of France?"},
			},
		},
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	fmt.Println(resp.Choices[0].Message.Content)
	// → "The capital of France is Paris."
	fmt.Printf("Tokens used: %d\n", resp.Usage.TotalTokens)
}
