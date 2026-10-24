export interface PassportExtractionResult {
  full_name: string;
  name: string;
  passport_no: string;
  dob: string;
  issue_date: string;
  expiry: string;
  passport_expiry: string;
  nationality: string;
  gender: string;
  father_name: string;
  cnic: string;
  place_of_birth: string;
  mrz: string;
  raw_text?: string;
}

/**
 * Fetch list of models from Gemini API and order them by priority:
 * 1. gemini-2.0-flash
 * 2. gemini-1.5-flash-latest
 * 3. gemini-1.5-flash
 * 4. Any other model supporting generateContent
 */
async function getAvailableModels(apiKey: string): Promise<string[]> {
  const preferredPriority = [
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
  ];

  try {
    // First call ListModels API with v1
    let res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    if (!res.ok) {
      // Fallback to v1beta for model listing if v1 returns non-200
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    }

    if (res.ok) {
      const data = await res.json();
      const modelsList: Array<{ name: string; supportedGenerationMethods?: string[] }> = data?.models || [];

      const contentModels = modelsList
        .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m) => m.name.replace(/^models\//, ''));

      if (contentModels.length > 0) {
        const prioritized: string[] = [];

        // 1. Add matching preferred models in order
        for (const preferred of preferredPriority) {
          const match = contentModels.find(
            (m) => m.toLowerCase() === preferred.toLowerCase()
          );
          if (match && !prioritized.includes(match)) {
            prioritized.push(match);
          }
        }

        // 2. Add other flash models
        for (const m of contentModels) {
          if (m.toLowerCase().includes('flash') && !prioritized.includes(m)) {
            prioritized.push(m);
          }
        }

        // 3. Add any other models supporting generateContent
        for (const m of contentModels) {
          if (!prioritized.includes(m)) {
            prioritized.push(m);
          }
        }

        if (prioritized.length > 0) {
          return prioritized;
        }
      }
    }
  } catch (err) {
    console.warn('ListModels call warning, using default priority list:', err);
  }

  return preferredPriority;
}

export async function extractPassportFromImage(imageInput: string): Promise<PassportExtractionResult> {
  if (!imageInput || typeof imageInput !== 'string') {
    throw new Error('پاسپورٹ کی تصویر موصول نہیں ہوئی (Image not provided)');
  }

  // Detect MIME type and clean Base64 data
  let mimeType = 'image/jpeg';
  const mimeMatch = imageInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  if (mimeMatch) {
    mimeType = mimeMatch[1];
  }
  const cleanBase64 = imageInput.replace(/^data:[^;]+;base64,/, '').trim();

  if (!cleanBase64) {
    throw new Error('تصویر کا ڈیٹا درست نہیں ہے (Invalid image base64 data)');
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured (GEMINI_API_KEY env var missing)');
  }

  const prompt = `You are a high-accuracy Passport OCR and MRZ (Machine Readable Zone) extraction engine.
Analyze the provided passport image carefully.
Extract the following details from both visual inspection and the 2-line or 3-line MRZ at the bottom:
1. full_name: Full name as printed on passport (Surname / Given names).
2. passport_no: Passport number (e.g. PK1234567 or alphanumeric).
3. dob: Date of birth in DD-MM-YYYY format.
4. issue_date: Date of issue in DD-MM-YYYY format.
5. expiry: Date of expiry in DD-MM-YYYY format.
6. nationality: Country/Nationality (e.g. PAK, PAKISTAN, SAU, etc.).
7. gender: Gender (M or F).
8. father_name: Father or Spouse name if visible.
9. cnic: National ID number / CNIC if visible.
10. place_of_birth: City/Place of birth if visible.
11. mrz: The exact MRZ text lines if visible.

Return ONLY a valid JSON object with this exact structure:
{
  "full_name": "string",
  "name": "string",
  "passport_no": "string",
  "dob": "string",
  "issue_date": "string",
  "expiry": "string",
  "passport_expiry": "string",
  "nationality": "string",
  "gender": "string",
  "father_name": "string",
  "cnic": "string",
  "place_of_birth": "string",
  "mrz": "string"
}

Rules:
- Ensure 'name' is identical to 'full_name'.
- Ensure 'passport_expiry' is identical to 'expiry'.
- If a field is not visible or cannot be determined, set it to an empty string "".
- NEVER return demo, mock, or hallucinated person names.
- Return raw JSON only, no markdown backticks, no explanatory text.`;

  // Get auto-detected and prioritized models
  const candidateModels = await getAvailableModels(apiKey);

  let candidateText = '';
  let lastErrorMsg = '';

  const requestPayload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  };

  // Try models with automatic fallback
  for (const modelName of candidateModels) {
    // Primary attempt: API version v1
    const apiVersions = ['v1', 'v1beta'];

    for (const apiVer of apiVersions) {
      const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${modelName}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        if (response.ok) {
          const resJson = await response.json();
          const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            candidateText = text;
            break;
          }
        } else {
          const errText = await response.text();
          lastErrorMsg = `Model ${modelName} (${apiVer}): ${response.status} - ${errText}`;
          console.warn(`Gemini attempt failed for ${modelName} (${apiVer}):`, errText);
        }
      } catch (reqErr: any) {
        lastErrorMsg = `Model ${modelName} (${apiVer}): ${reqErr?.message || reqErr}`;
        console.warn(`Fetch error for ${modelName} (${apiVer}):`, reqErr);
      }
    }

    if (candidateText) {
      break;
    }
  }

  if (!candidateText) {
    throw new Error(`تصویر سے کوئی ڈیٹا حاصل نہیں ہو سکا (Extraction failed across available models: ${lastErrorMsg})`);
  }

  let parsed: any = {};
  try {
    const cleanJson = candidateText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    parsed = JSON.parse(cleanJson);
  } catch (parseErr) {
    const jsonMatch = candidateText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('پاسپورٹ ڈیٹا فارمیٹ درست نہیں تھا');
    }
  }

  const fullName = (parsed.full_name || parsed.name || '').trim().toUpperCase();
  const expiry = (parsed.expiry || parsed.passport_expiry || '').trim();

  return {
    full_name: fullName,
    name: fullName,
    passport_no: (parsed.passport_no || '').trim().toUpperCase(),
    dob: (parsed.dob || parsed.date_of_birth || '').trim(),
    issue_date: (parsed.issue_date || '').trim(),
    expiry: expiry,
    passport_expiry: expiry,
    nationality: (parsed.nationality || '').trim().toUpperCase(),
    gender: (parsed.gender || parsed.sex || '').trim().toUpperCase(),
    father_name: (parsed.father_name || '').trim().toUpperCase(),
    cnic: (parsed.cnic || '').trim(),
    place_of_birth: (parsed.place_of_birth || '').trim().toUpperCase(),
    mrz: (parsed.mrz || '').trim(),
    raw_text: candidateText,
  };
}
