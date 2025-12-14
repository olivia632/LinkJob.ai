import { GoogleGenAI, Type } from "@google/genai";
import { Job } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const extractJobDetails = async (text: string): Promise<Partial<Job>> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Extract job details from the following job description text.
    Return a JSON object with: title, company, location (if found).
    If a field is not found, use an empty string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { text: prompt },
        { text: text }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return {};
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error extracting job details:", error);
    return {};
  }
};

export const analyzeJobMatch = async (baseResume: string, jobDescription: string): Promise<{score: number, analysis: string}> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  const prompt = `
    Analyze the fit between the Candidate's Resume and the Job Description.
    1. Calculate a match score between 0 and 100 based on skills, experience, and requirements.
    2. Provide a brief analysis (max 3 sentences) highlighting the biggest strengths and any missing critical skills.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { text: prompt },
        { text: `--- RESUME ---\n${baseResume}` },
        { text: `--- JOB DESCRIPTION ---\n${jobDescription}` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER },
                analysis: { type: Type.STRING }
            }
        }
      }
    });

    const jsonText = response.text;
    return jsonText ? JSON.parse(jsonText) : { score: 0, analysis: "Could not analyze match." };
  } catch (error) {
    console.error("Error analyzing match:", error);
    return { score: 0, analysis: "Error during analysis." };
  }
};

export const tailorResume = async (baseResume: string, jobDescription: string, instructions?: string): Promise<string> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash"; 

  const prompt = `
    You are an expert career coach and resume writer. 
    I will provide you with a BASE RESUME and a JOB DESCRIPTION.
    
    Your task is to rewrite the BASE RESUME to tailor it specifically for the JOB DESCRIPTION.
    
    ${instructions ? `USER INSTRUCTIONS: ${instructions}` : ''}
    
    Rules:
    1. Maintain the truthfulness of the base resume (do not invent experience).
    2. Rephrase bullet points to emphasize skills and keywords found in the job description.
    3. Adjust the "Summary" or "Profile" section to directly address the role.
    4. Return the output in clean, professional Markdown format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { text: prompt },
        { text: `--- BASE RESUME ---\n${baseResume}` },
        { text: `--- JOB DESCRIPTION ---\n${jobDescription}` }
      ]
    });

    return response.text || "Failed to generate resume.";
  } catch (error) {
    console.error("Error tailoring resume:", error);
    throw error;
  }
};

export const generateCoverLetter = async (baseResume: string, jobDescription: string, instructions?: string): Promise<string> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  const prompt = `
    Write a compelling, professional cover letter for the following JOB DESCRIPTION based on the candidate's BASE RESUME.
    
    ${instructions ? `USER INSTRUCTIONS: ${instructions}` : ''}

    The tone should be professional, enthusiastic, and confident.
    Highlight specific achievements from the resume that map to the job requirements.
    Return the output in Markdown format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { text: prompt },
        { text: `--- BASE RESUME ---\n${baseResume}` },
        { text: `--- JOB DESCRIPTION ---\n${jobDescription}` }
      ]
    });

    return response.text || "Failed to generate cover letter.";
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw error;
  }
};