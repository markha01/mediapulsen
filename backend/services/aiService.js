const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildSinglePrompt(summary) {
  return `You are an expert media analyst helping a publisher understand which content drives subscriber conversions.

Analyze this article performance data and return actionable insights.

DATA SUMMARY:
${JSON.stringify(summary, null, 2)}

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "insights": [
    {
      "type": "pattern|timing|format|warning",
      "headline": "Short impactful finding",
      "detail": "One or two sentences explaining the finding with specific numbers",
      "metric": { "value": 2.8, "unit": "x" }
    }
  ],
  "recommendations": [
    {
      "action": "publish_more|publish_less|timing|format",
      "reason": "Short action label",
      "rationale": "Why this recommendation, with data backing",
      "confidence": "high|medium|low"
    }
  ],
  "summary_headline": "Single most important finding in one sentence"
}

Rules:
- Generate 3–6 insights and 2–4 recommendations
- Use specific numbers from the data
- Focus on conversion rate, not raw views
- Be direct and actionable for a non-technical publisher
- metric.value should be a number, metric.unit a short string (e.g. "x", "%", "s", "articles")
- Round ALL numbers to a maximum of 2 decimal places, both in text fields and in metric.value`;
}

function buildComparePrompt(summaryA, summaryB, nameA, nameB) {
  return `You are an expert media analyst. Compare two content datasets for a publisher.

DATASET A (${nameA}):
${JSON.stringify(summaryA, null, 2)}

DATASET B (${nameB}):
${JSON.stringify(summaryB, null, 2)}

Return ONLY valid JSON (no markdown, no explanation):
{
  "insights": [
    {
      "type": "pattern|timing|format|warning",
      "headline": "Key difference found",
      "detail": "Specific comparison with numbers",
      "metric": { "value": 35, "unit": "%" }
    }
  ],
  "recommendations": [
    {
      "action": "publish_more|publish_less|timing|format",
      "reason": "Short action label",
      "rationale": "Based on comparison data",
      "confidence": "high|medium|low"
    }
  ],
  "summary_headline": "Most important difference between the two periods",
  "delta": {
    "conversion_rate_change": 0.0,
    "conversion_rate_change_pct": 0.0,
    "views_change_pct": 0.0,
    "avg_time_on_page_change_pct": 0.0,
    "better_dataset": "A|B|equal"
  }
}

Focus on what changed between periods and what the publisher should do differently.
Round ALL numbers to a maximum of 2 decimal places, both in text fields and in numeric JSON fields.`;
}

function roundNumericFields(parsed) {
  if (parsed.insights) {
    parsed.insights.forEach(i => {
      if (i.metric && typeof i.metric.value === 'number') {
        i.metric.value = Math.round(i.metric.value * 100) / 100;
      }
    });
  }
  if (parsed.delta) {
    Object.keys(parsed.delta).forEach(k => {
      if (typeof parsed.delta[k] === 'number') {
        parsed.delta[k] = Math.round(parsed.delta[k] * 100) / 100;
      }
    });
  }
  return parsed;
}

async function generateInsights(summary) {
  const prompt = buildSinglePrompt(summary);

  const result = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 1024,
  });
  const rawText = result.choices[0].message.content;

  try {
    const cleaned = rawText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
    return { parsed: roundNumericFields(JSON.parse(cleaned)), raw: rawText };
  } catch (e) {
    console.error('Failed to parse Groq response:', rawText);
    throw new Error('AI response was not valid JSON');
  }
}

async function generateComparison(summaryA, summaryB, nameA, nameB) {
  const prompt = buildComparePrompt(summaryA, summaryB, nameA, nameB);

  const result = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 1024,
  });
  const rawText = result.choices[0].message.content;

  try {
    const cleaned = rawText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
    return { parsed: roundNumericFields(JSON.parse(cleaned)), raw: rawText };
  } catch (e) {
    console.error('Failed to parse Groq comparison response:', rawText);
    throw new Error('AI response was not valid JSON');
  }
}

module.exports = { generateInsights, generateComparison };
