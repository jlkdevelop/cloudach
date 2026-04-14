-- Migration 006: Add Llama 3.1, Command R+, and DBRX to model catalog
-- Run after 005_admin.sql.

INSERT INTO model_catalog (model_id, display_name, description, param_count, context_len, hf_repo, tags)
VALUES
  ('llama31-8b',
   'Llama 3.1 8B Instruct',
   'Meta''s upgraded 8B model with 128K context and improved instruction following over Llama 3.',
   '8B',
   131072,
   'meta-llama/Meta-Llama-3.1-8B-Instruct',
   ARRAY['chat','code','fast','long-context']),

  ('llama31-70b',
   'Llama 3.1 70B Instruct',
   'Meta''s frontier open model with 128K context. Matches or exceeds GPT-4o on many benchmarks.',
   '70B',
   131072,
   'meta-llama/Meta-Llama-3.1-70B-Instruct',
   ARRAY['chat','code','powerful','long-context']),

  ('command-r-plus',
   'Command R+',
   'Cohere''s flagship 104B model optimised for RAG, tool use, and multi-step agents with 128K context.',
   '104B',
   131072,
   'CohereForAI/c4ai-command-r-plus',
   ARRAY['chat','rag','agents','long-context']),

  ('dbrx',
   'DBRX Instruct',
   'Databricks'' open 132B MoE model (36B active params). Outperforms LLaMA 2 70B and Mistral on coding and reasoning.',
   '132B',
   32768,
   'databricks/dbrx-instruct',
   ARRAY['chat','code','powerful'])
ON CONFLICT (model_id) DO NOTHING;

-- Pricing (per-million tokens, USD) based on compute tier
INSERT INTO model_pricing (model_id, input_price_per_million, output_price_per_million)
VALUES
  ('llama31-8b',      0.10, 0.12),
  ('llama31-70b',     0.75, 0.95),
  ('command-r-plus',  1.20, 1.50),
  ('dbrx',            1.10, 1.40)
ON CONFLICT (model_id) DO NOTHING;
