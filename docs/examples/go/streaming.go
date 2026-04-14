// Cloudach Go — Streaming Chat
// Requires: go get github.com/sashabaranov/go-openai
// Run: CLOUDACH_API_KEY=sk-cloudach-... go run streaming.go

package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"

	openai "github.com/sashabaranov/go-openai"
)

func main() {
	config := openai.DefaultConfig(os.Getenv("CLOUDACH_API_KEY"))
	config.BaseURL = "https://api.cloudach.com/v1"
	client := openai.NewClientWithConfig(config)

	stream, err := client.CreateChatCompletionStream(
		context.Background(),
		openai.ChatCompletionRequest{
			Model:  "llama3-8b",
			Stream: true,
			Messages: []openai.ChatCompletionMessage{
				{Role: openai.ChatMessageRoleUser, Content: "Count from 1 to 10 slowly."},
			},
		},
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	defer stream.Close()

	for {
		response, err := stream.Recv()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			fmt.Fprintf(os.Stderr, "Stream error: %v\n", err)
			os.Exit(1)
		}
		fmt.Print(response.Choices[0].Delta.Content)
	}
	fmt.Println()
}
