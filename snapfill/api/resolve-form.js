import { resolveFormFields } from '../server/form-resolver.mjs'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }
  try {
    const result = await resolveFormFields({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
      fields: request.body?.fields,
      availableKeys: request.body?.availableKeys,
    })
    return response.status(200).json(result)
  } catch (error) {
    return response.status(error.message.includes('OPENAI_API_KEY') ? 503 : 400).json({ error: error.message })
  }
}
