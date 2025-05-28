import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * @route POST /api/chat
 * @desc Send user message to Sonar API for AI-powered medical triage with iterative questioning
 * @access Public
 */
router.post('/', async (req, res) => {
  try {
    const { message, history, triageData, isFinalAssessment, needsOptions, stepNumber } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Construct the conversation history for Sonar API - ensure proper alternation
    let conversationHistory = [];
    
    // Filter out welcome messages, corrupted messages and ensure alternating pattern
    const validMessages = history.filter(msg => 
      msg.text && 
      typeof msg.text === 'string' && 
      msg.text.trim() !== '' && 
      msg.text !== '[object Object]' &&
      !msg.error &&
      !msg.text.includes("I'm your AI medical assistant") && // Exclude welcome messages
      !msg.text.includes("Hello! I'm your AI medical assistant") // Exclude welcome messages
    );

    // Build proper alternating conversation - only include user messages and actual AI responses
    let lastRole = null;
    for (const msg of validMessages) {
      const role = msg.isUser ? 'user' : 'assistant';
      
      // Skip if same role as previous (to ensure alternation)
      if (role === lastRole) {
        continue;
      }
      
      // Only add if it's a user message or a meaningful assistant response
      if (msg.isUser || (msg.text.length > 20 && !msg.text.includes("Hello!"))) {
        conversationHistory.push({
          role: role,
          content: msg.text
        });
        
        lastRole = role;
      }
    }
    
    // If we have no conversation history, start fresh - don't include any previous messages
    if (conversationHistory.length === 0 || conversationHistory[conversationHistory.length - 1].role === 'assistant') {
      conversationHistory = [];
    }
    
    // Add the new user message
    conversationHistory.push({
      role: 'user',
      content: message
    });

    let systemPrompt = '';

    if (isFinalAssessment && triageData) {
      // Final assessment with comprehensive triage data
      systemPrompt = `You are an AI medical triage assistant providing a comprehensive final assessment based on the gathered information.

**PATIENT INFORMATION GATHERED:**
${Object.entries(triageData).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

**PROVIDE A STRUCTURED FINAL ASSESSMENT:**

## 🔍 Medical Assessment Summary

**Primary Concern:** [Brief summary of main symptom/issue]

**Possible Conditions:**
1. **Most Likely:** [Primary differential diagnosis with brief explanation]
2. **Also Consider:** [Secondary possibility]
3. **Less Likely:** [Tertiary consideration if relevant]

## 🚨 Urgency Level
**[IMMEDIATE/URGENT/ROUTINE/SELF-CARE]**

## ⚡ Immediate Actions
• [Specific immediate steps to take]
• [Self-care measures that can be started now]
• [What to avoid or stop doing]

## 🏥 When to Seek Medical Care
**Seek IMMEDIATE medical attention if:**
• [Red flag symptoms - be specific]
• [Emergency warning signs]

**Schedule appointment within 24-48 hours if:**
• [Symptoms indicating need for professional evaluation]

**Routine follow-up if:**
• [Conditions for regular medical consultation]

## 🏠 Self-Care Recommendations
**For symptom relief:**
• [Specific medication recommendations if appropriate]
• [Home remedies and comfort measures]
• [Activity modifications]

**Lifestyle adjustments:**
• [Diet, exercise, rest recommendations]
• [Environmental modifications]

## 📋 Monitoring Instructions
**Track and monitor:**
• [Specific symptoms to watch]
• [How often to assess]
• [When to worry about changes]

## ⚠️ Important Notes
- This assessment is based on the information provided and is not a substitute for professional medical diagnosis
- If symptoms worsen or new concerning symptoms develop, seek medical attention promptly
- For life-threatening emergencies, call emergency services immediately

**Follow-up:** Consider scheduling a routine check-up with your healthcare provider to discuss these symptoms and your overall health.`;
    } else if (needsOptions) {
      // Interactive triage with AI-generated contextual options
      systemPrompt = `You are an AI medical triage assistant conducting a structured medical consultation. You are currently on step ${stepNumber} of the assessment.

**CONVERSATION CONTEXT:**
${triageData ? Object.entries(triageData).map(([key, value]) => `- ${key}: ${value}`).join('\n') : 'Initial consultation'}

**YOUR TASK:**
1. Ask ONE focused, contextual follow-up question based on what the patient has shared
2. Generate 3-4 relevant response options that are directly related to your question
3. Be empathetic and professional in your questioning

**ESSENTIAL AREAS TO EXPLORE (choose the most relevant one for this step):**
- **Symptom Details**: onset, duration, severity (1-10 scale), location, quality, progression
- **Associated Symptoms**: what else they're experiencing that might be related
- **Triggers/Patterns**: what makes it worse/better, timing patterns, frequency
- **Medical Context**: relevant medical history, current medications, recent changes
- **Impact Assessment**: how it affects daily activities, sleep, work, mood
- **Previous Treatments**: what they've already tried, what helped/didn't help

**RESPONSE FORMAT:**
You must respond with ONLY valid JSON in this exact structure:
{
  "question": "Your empathetic, focused follow-up question here",
  "options": [
    "Option 1 that directly relates to your question",
    "Option 2 that directly relates to your question", 
    "Option 3 that directly relates to your question",
    "Option 4 that directly relates to your question"
  ]
}

**IMPORTANT GUIDELINES:**
- Make your question conversational and empathetic, not clinical
- Ensure options are directly relevant to YOUR specific question
- Options should be mutually exclusive where possible
- Keep options concise but descriptive
- Ask about the most medically relevant information first
- RESPOND ONLY WITH VALID JSON - no additional text before or after

Based on the conversation so far, what is the most important follow-up question to ask, and what are the relevant response options?`;
    } else {
      // Regular interactive triage conversation without options
      systemPrompt = `You are an AI medical triage assistant designed to conduct structured medical consultations. Your primary goal is to gather comprehensive information through systematic questioning before providing final guidance.

**IMPORTANT INTERACTION GUIDELINES:**
- You are having a natural conversation flow - do NOT provide multiple choice options or formal question formats
- Ask ONE focused question at a time in a conversational manner
- Be empathetic and professional
- Follow up naturally based on their responses
- Gather essential medical history systematically

**ESSENTIAL INFORMATION TO GATHER:**
1. **Symptom Details**: onset, duration, severity (1-10), location, quality
2. **Associated Symptoms**: what else they're experiencing
3. **Triggers/Patterns**: what makes it worse or better
4. **Medical History**: relevant conditions, medications, allergies
5. **Impact**: how it affects daily activities
6. **Previous Treatments**: what they've already tried

**CONVERSATION FLOW:**
- Start with empathetic acknowledgment of their concern
- Ask about the most important missing information first
- Use follow-up questions that feel natural
- Avoid overwhelming them with too many questions at once
- Show that you're listening by referencing their previous answers

**TONE AND APPROACH:**
- Professional but warm and caring
- Use plain language, explain medical terms
- Show empathy for their discomfort
- Build rapport while gathering information
- Make them feel heard and understood

**WHEN TO CONCLUDE:**
After gathering sufficient information about their symptoms, associated factors, medical history, and impact on daily life, indicate that you have enough information to provide comprehensive guidance.

Ask questions in a natural, conversational way. Do not use formal multiple choice formats. Focus on one key piece of missing information at a time.`;
    }

    console.log('Sending conversation history:', JSON.stringify(conversationHistory, null, 2));

    // Make the first API call for the main response
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...conversationHistory
        ],
        max_tokens: isFinalAssessment ? 2000 : (needsOptions ? 800 : 800),
        temperature: 0.2,
        stream: false
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SONAR_API_KEY}`
        }
      }
    );

    let aiResponse = response.data.choices[0].message.content;
    let options = null;

    // Ensure aiResponse is a string
    if (typeof aiResponse !== 'string') {
      aiResponse = String(aiResponse || 'I apologize, but I encountered an issue processing your request. Please try again.');
    }

    // If we need options, try to parse JSON response or generate options separately
    if (needsOptions) {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(aiResponse);
        if (parsed.question && parsed.options && Array.isArray(parsed.options)) {
          aiResponse = parsed.question;
          options = parsed.options;
        }
      } catch (jsonError) {
        // If JSON parsing fails, generate options with a separate API call
        console.log('JSON parsing failed, generating options separately...');
        try {
          const optionsPrompt = `Based on this medical triage question: "${aiResponse}"

Generate 4 relevant, specific response options that directly relate to this question. The options should be:
- Directly relevant to the question asked
- Mutually exclusive where possible
- Concise but descriptive
- Include medical context when appropriate

Respond with ONLY a JSON array of option strings, like this:
["Option 1", "Option 2", "Option 3", "Option 4"]`;

          const optionsResponse = await axios.post(
            'https://api.perplexity.ai/chat/completions',
            {
              model: 'sonar-pro',
              messages: [
                {
                  role: 'user',
                  content: optionsPrompt
                }
              ],
              max_tokens: 300,
              temperature: 0.1,
              stream: false
            },
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SONAR_API_KEY}`
              }
            }
          );

          const optionsText = optionsResponse.data.choices[0].message.content;
          if (typeof optionsText === 'string') {
            options = JSON.parse(optionsText);
          }
        } catch (optionsError) {
          console.error('Error generating options:', optionsError);
          // Fallback to no options if generation fails
          options = null;
        }
      }
    }
    
    return res.json({ 
      response: aiResponse,
      options: options
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    
    // Handle different types of errors
    if (error.response) {
      const errorMessage = error.response.data?.error?.message || error.response.data?.error || 'Error from Sonar API';
      return res.status(error.response.status).json({ 
        error: errorMessage
      });
    } else if (error.request) {
      return res.status(503).json({ 
        error: 'No response from Sonar API, please try again later' 
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to process your request. Please try again.' 
      });
    }
  }
});

export default router;