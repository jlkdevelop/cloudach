/**
 * Cloudach Batch Inference — Node.js Example
 *
 * Demonstrates:
 *   1. Submitting a batch of chat completion requests
 *   2. Polling for completion
 *   3. Downloading and parsing JSONL results
 *
 * Run:
 *   export CLOUDACH_API_KEY=sk-cloudach-...
 *   node batch.js
 */

const BASE_URL = "https://api.cloudach.com/v1";

const HEADERS = {
  Authorization: `Bearer ${process.env.CLOUDACH_API_KEY}`,
  "Content-Type": "application/json",
};

async function apiFetch(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(data.error?.message ?? res.statusText);
  }
  return res;
}

async function submitBatch(model, requests, completionWindow = "24h") {
  const res = await apiFetch("/batches", {
    method: "POST",
    body: { model, requests, completion_window: completionWindow },
  });
  return res.json();
}

async function getBatch(batchId) {
  const res = await apiFetch(`/batches/${batchId}`);
  return res.json();
}

async function pollUntilDone(batchId, intervalMs = 30_000) {
  while (true) {
    const batch = await getBatch(batchId);
    const { status, progress_pct, completed_count, request_count, failed_count, error } = batch;
    process.stdout.write(
      `  [${status}] ${progress_pct ?? 0}% — ${completed_count}/${request_count} complete` +
        (failed_count ? `, ${failed_count} failed` : "") +
        "\n"
    );

    if (status === "completed") return batch;
    if (["failed", "cancelled", "expired"].includes(status)) {
      throw new Error(`Batch ended with status '${status}'. Error: ${JSON.stringify(error)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

async function downloadResults(batchId) {
  const res = await apiFetch(`/batches/${batchId}/results`);
  const text = await res.text();
  return text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

// --- Main ---

// Example: sentiment classification on product reviews
const reviews = [
  "Absolutely love this product — works perfectly and arrived early!",
  "Completely broke after two days. Very disappointed.",
  "It's okay, does what it says but nothing special.",
  "Best purchase I've made this year. Highly recommended.",
  "Packaging was damaged and the item smelled strange.",
];

const requests = reviews.map((review, i) => ({
  custom_id: `review-${String(i).padStart(4, "0")}`,
  messages: [
    {
      role: "system",
      content:
        "You are a sentiment classifier. Reply with exactly one word: positive, negative, or neutral.",
    },
    { role: "user", content: review },
  ],
}));

// --- Step 1: Submit ---
console.log(`Submitting batch of ${requests.length} requests...`);
const batch = await submitBatch("llama3-8b", requests, "24h");
const batchId = batch.id;
console.log(`  Batch ID: ${batchId}`);
console.log(`  Estimated cost: $${batch.cost_estimate_usd.toFixed(6)}`);
console.log(`  Estimated completion: ${batch.estimated_completion}`);

// --- Step 2: Poll ---
console.log("\nPolling for completion (30s interval)...");
await pollUntilDone(batchId, 30_000);

// --- Step 3: Download results ---
console.log("\nDownloading results...");
const results = await downloadResults(batchId);
const resultsById = Object.fromEntries(results.map((r) => [r.custom_id, r]));

console.log("\n--- Sentiment Results ---");
reviews.forEach((review, i) => {
  const customId = `review-${String(i).padStart(4, "0")}`;
  const row = resultsById[customId];
  let sentiment;
  if (!row) {
    sentiment = "MISSING";
  } else if (row.error) {
    sentiment = `ERROR: ${row.error.message}`;
  } else {
    sentiment = row.response.choices[0].message.content.trim();
  }
  console.log(`  ${customId}: ${sentiment.padEnd(10)} — ${review.slice(0, 60)}`);
});
