import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyC6D7ZKbwI2vm5-6KpuUdmSgSbirZ-qlbQ';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function categorizePost(description: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Categorize the following complaint into one of these categories. Return ONLY the category name, nothing else:
    - Infrastructure
    - Public Utilities
    - Urban Maintenance
    - Public Safety & Law Enforcement
    - Emergency Services
    - Traffic & Transportation
    - Environmental Issues
    - Civic Administration
    - Public Health & Hygiene
    - Community & Social Issues

Complaint: "${description}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const category = response.text().trim();
    
    // Ensure the returned category matches exactly with one of our options
    const validCategories = [
      'Infrastructure',
      'Public Utilities',
      'Urban Maintenance',
      'Public Safety & Law Enforcement',
      'Emergency Services',
      'Traffic & Transportation',
      'Environmental Issues',
      'Civic Administration',
      'Public Health & Hygiene',
      'Community & Social Issues'
    ];

    // Find a case-insensitive match
    const matchedCategory = validCategories.find(
      cat => cat.toLowerCase() === category.toLowerCase()
    );

    return matchedCategory || 'Other';
  } catch (error) {
    console.error('Error categorizing post:', error);
    throw new Error('Failed to categorize post. Please select a category manually.');
  }
}
