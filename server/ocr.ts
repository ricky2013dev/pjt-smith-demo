import Tesseract from 'tesseract.js';

export interface ExtractedInsuranceData {
  firstName: string;
  middleName?: string;
  lastName: string;
  provider: string;
  policyNumber: string;
  groupNumber: string;
  subscriberId: string;
}

export interface OCRResult {
  extractedData: ExtractedInsuranceData;
  confidence: {
    overall: number;
    fields: { [key: string]: number };
  };
}

interface ExtractionPatterns {
  name: RegExp;
  policyNumber: RegExp;
  groupNumber: RegExp;
  subscriberId: RegExp;
  provider: RegExp;
}

const extractionPatterns: ExtractionPatterns = {
  // Name patterns - look for "Member Name", "Patient Name", "Subscriber Name", etc.
  // More flexible: allows for various formats and capitalization
  name: /(?:Member|Patient|Subscriber|Enrollee|Employee|Cardholder)(?:\s*Name)?[:\s]+([A-Z][A-Za-z]+(?:[-'][A-Za-z]+)?)\s+([A-Z]\.?\s?)?([A-Z][A-Za-z]+(?:[-'][A-Za-z]+)?)/i,

  // Policy number - more flexible matching
  policyNumber: /(?:Policy|Member|ID|Certificate|Card)(?:\s*(?:Number|ID|#))?[:\s#]*([A-Z0-9]{6,20})/i,

  // Group number - more flexible
  groupNumber: /Group(?:\s*(?:Number|ID|#))?[:\s#]*([A-Z0-9]{3,20})/i,

  // Subscriber ID / Dental ID - more flexible
  subscriberId: /(?:Subscriber|Dental|Member)(?:\s*(?:ID|Number|#))?[:\s#]*([A-Z0-9]{6,20})/i,

  // Provider name - expanded list and more flexible matching
  provider: /(?:cigna|blue\s*cross|bcbs|aetna|united\s*health(?:care)?|delta\s*dental|humana|metlife|guardian|anthem|kaiser|wellpoint)/i,
};

function validateField(value: string | undefined, minLength: number = 2, maxLength: number = 50): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

function calculateConfidence(extractedFields: Partial<ExtractedInsuranceData>): { overall: number; fields: { [key: string]: number } } {
  const fieldConfidences: { [key: string]: number } = {
    firstName: extractedFields.firstName ? 100 : 0,
    lastName: extractedFields.lastName ? 100 : 0,
    provider: extractedFields.provider ? 100 : 0,
    policyNumber: extractedFields.policyNumber ? 100 : 0,
    groupNumber: extractedFields.groupNumber ? 80 : 0, // Optional field
    subscriberId: extractedFields.subscriberId ? 100 : 0,
  };

  const values = Object.values(fieldConfidences);
  const overall = values.reduce((sum, val) => sum + val, 0) / values.length;

  return {
    overall: Math.round(overall),
    fields: fieldConfidences
  };
}

export async function processInsuranceCard(imageBuffer: Buffer): Promise<OCRResult> {
  console.log('Starting OCR processing...');

  try {
    // Create Tesseract worker
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    // Configure Tesseract for optimal insurance card reading
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .-:#',
    });

    // Perform OCR
    const { data: { text } } = await worker.recognize(imageBuffer);
    console.log('OCR Text extracted (first 500 chars):', text.substring(0, 500));

    // Terminate worker
    await worker.terminate();

    // Extract structured data using regex patterns
    const extractedData: Partial<ExtractedInsuranceData> = {};

    // Extract name
    const nameMatch = text.match(extractionPatterns.name);
    if (nameMatch) {
      extractedData.firstName = nameMatch[1]?.trim();
      extractedData.middleName = nameMatch[2]?.trim().replace('.', '') || '';
      extractedData.lastName = nameMatch[3]?.trim();
      console.log('Name extracted:', { firstName: extractedData.firstName, middleName: extractedData.middleName, lastName: extractedData.lastName });
    } else {
      console.warn('Could not extract name from card - will use placeholder');
    }

    // Extract policy number
    const policyMatch = text.match(extractionPatterns.policyNumber);
    if (policyMatch && validateField(policyMatch[1], 6, 20)) {
      extractedData.policyNumber = policyMatch[1].trim();
      console.log('Policy number extracted:', extractedData.policyNumber);
    } else {
      console.warn('Could not extract policy number');
    }

    // Extract group number
    const groupMatch = text.match(extractionPatterns.groupNumber);
    if (groupMatch && validateField(groupMatch[1], 3, 20)) {
      extractedData.groupNumber = groupMatch[1].trim();
      console.log('Group number extracted:', extractedData.groupNumber);
    } else {
      console.warn('Could not extract group number');
    }

    // Extract subscriber ID (fallback to policy number if not found)
    const subscriberMatch = text.match(extractionPatterns.subscriberId);
    if (subscriberMatch && validateField(subscriberMatch[1], 6, 20)) {
      extractedData.subscriberId = subscriberMatch[1].trim();
      console.log('Subscriber ID extracted:', extractedData.subscriberId);
    } else if (extractedData.policyNumber) {
      // Fallback: use policy number as subscriber ID
      extractedData.subscriberId = extractedData.policyNumber;
      console.log('Using policy number as subscriber ID:', extractedData.subscriberId);
    }

    // Extract provider - more flexible extraction
    const providerMatch = text.match(extractionPatterns.provider);
    if (providerMatch) {
      // Normalize provider name
      const providerName = providerMatch[0].trim();
      const providerMap: { [key: string]: string } = {
        'cigna': 'Cigna',
        'blue cross': 'Blue Cross',
        'bcbs': 'Blue Cross Blue Shield',
        'aetna': 'Aetna',
        'united health': 'UnitedHealthcare',
        'united healthcare': 'UnitedHealthcare',
        'delta dental': 'Delta Dental',
        'humana': 'Humana',
        'metlife': 'MetLife',
        'guardian': 'Guardian',
        'anthem': 'Anthem',
        'kaiser': 'Kaiser Permanente',
        'wellpoint': 'WellPoint'
      };

      const normalizedProvider = Object.entries(providerMap).find(([key]) =>
        providerName.toLowerCase().includes(key)
      )?.[1] || providerName;

      extractedData.provider = normalizedProvider;
      console.log('Provider extracted:', extractedData.provider);
    } else {
      console.warn('Could not extract provider - checking full text for provider keywords');
      // Fallback: search anywhere in text for common providers
      const textLower = text.toLowerCase();
      if (textLower.includes('cigna')) extractedData.provider = 'Cigna';
      else if (textLower.includes('blue cross') || textLower.includes('bcbs')) extractedData.provider = 'Blue Cross Blue Shield';
      else if (textLower.includes('aetna')) extractedData.provider = 'Aetna';
      else if (textLower.includes('united')) extractedData.provider = 'UnitedHealthcare';
      else if (textLower.includes('delta')) extractedData.provider = 'Delta Dental';
      else if (textLower.includes('humana')) extractedData.provider = 'Humana';
      else if (textLower.includes('metlife')) extractedData.provider = 'MetLife';
      else if (textLower.includes('guardian')) extractedData.provider = 'Guardian';
      else if (textLower.includes('anthem')) extractedData.provider = 'Anthem';

      if (extractedData.provider) {
        console.log('Provider found in fallback search:', extractedData.provider);
      }
    }

    // Calculate confidence scores
    const confidence = calculateConfidence(extractedData);

    console.log('Extraction confidence:', confidence);

    // Use placeholders for missing required fields instead of throwing errors
    if (!extractedData.firstName || !extractedData.lastName) {
      console.warn('Missing patient name - using placeholder. Please update manually.');
      extractedData.firstName = extractedData.firstName || 'Unknown';
      extractedData.lastName = extractedData.lastName || 'Patient';
    }
    if (!extractedData.provider) {
      console.warn('Missing provider - using placeholder. Please update manually.');
      extractedData.provider = 'Unknown Provider';
    }
    if (!extractedData.policyNumber) {
      console.warn('Missing policy number - using placeholder. Please update manually.');
      extractedData.policyNumber = 'UNKNOWN';
    }

    // Return result with defaults for optional fields
    const result: OCRResult = {
      extractedData: {
        firstName: extractedData.firstName,
        middleName: extractedData.middleName || '',
        lastName: extractedData.lastName,
        provider: extractedData.provider,
        policyNumber: extractedData.policyNumber,
        groupNumber: extractedData.groupNumber || '',
        subscriberId: extractedData.subscriberId || extractedData.policyNumber,
      },
      confidence
    };

    console.log('OCR extraction complete:', {
      name: `${result.extractedData.firstName} ${result.extractedData.lastName}`,
      provider: result.extractedData.provider,
      confidence: confidence.overall
    });

    return result;

  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error(`Failed to process insurance card: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
