const DEFAULT_MODEL = 'gpt-5.6-terra'

function mappingSchema(availableKeys) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      mappings: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            fieldIndex: { type: 'integer' },
            profileKey: { type: 'string', enum: availableKeys },
          },
          required: ['fieldIndex', 'profileKey'],
        },
      },
    },
    required: ['mappings'],
  }
}

function responseText(body) {
  if (typeof body.output_text === 'string') return body.output_text

  const message = Array.isArray(body.output)
    ? body.output.find((item) => item?.type === 'message' && Array.isArray(item.content))
    : undefined
  const text = message?.content.find((item) => item?.type === 'output_text')?.text

  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('OpenAI returned no structured form mapping.')
  }
  return text
}

export async function resolveFormFields({ apiKey, model = DEFAULT_MODEL, fields, availableKeys }) {
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.')
  if (!Array.isArray(fields) || !Array.isArray(availableKeys)) throw new Error('Invalid form mapping request.')

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: 'Map destination form controls to the listed local profile keys. Use only a clear semantic match. Never create values, never map password fields, and omit unclear controls. Return only the requested JSON.',
        },
        {
          role: 'user',
          content: JSON.stringify({ fields, availableProfileKeys: availableKeys }),
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'form_field_mapping',
          strict: true,
          schema: mappingSchema(availableKeys.filter((key) => key !== 'password')),
        },
      },
    }),
  })

  if (!response.ok) throw new Error(`OpenAI request failed (${response.status}).`)
  const body = await response.json()
  const result = JSON.parse(responseText(body))
  return {
    mappings: result.mappings.filter((mapping) => Number.isInteger(mapping.fieldIndex) && availableKeys.includes(mapping.profileKey) && mapping.profileKey !== 'password'),
  }
}
