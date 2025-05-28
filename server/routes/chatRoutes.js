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
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Construct the conversation history for Sonar API
    const conversationHistory = history.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    }));
    
    // Add the new user message
    conversationHistory.push({
      role: 'user',
      content: message
    });

    // Enhanced system prompt for questionnaire-style medical consultation
    const systemPrompt = `You are an AI medical triage assistant designed to conduct structured medical consultations using a questionnaire format, similar to how doctors assess patients. Your goal is to gather comprehensive information through systematic questioning before providing guidance.

**CONSULTATION PROCESS:**

1. **Initial Assessment** (First interaction):
   - Greet the patient professionally
   - Ask for their primary concern or chief complaint
   - Provide 3-4 specific symptom categories as options

2. **Systematic History Taking** (Follow-up questions):
   - Ask ONE focused question at a time
   - Always provide multiple-choice options (3-4 choices)
   - Use medical triage protocols
   - Gather: onset, duration, severity, location, triggers, associated symptoms

3. **Question Format Template:**
   **Question:** [Specific medical question]
   
   **Please select the option that best describes your situation:**
   
   A) [Option 1 - detailed description]
   B) [Option 2 - detailed description] 
   C) [Option 3 - detailed description]
   D) [Option 4 - detailed description or "None of the above"]

4. **Essential Information to Gather:**
   - Symptom onset (when did it start?)
   - Duration and progression
   - Severity level (1-10 scale)
   - Location and radiation
   - Aggravating/relieving factors
   - Associated symptoms
   - Medical history relevance
   - Current medications
   - Impact on daily activities

5. **Assessment Phases:**
   - **Phase 1:** Chief complaint identification
   - **Phase 2:** Detailed symptom analysis (3-5 questions)
   - **Phase 3:** Risk factor assessment
   - **Phase 4:** Impact and urgency evaluation
   - **Phase 5:** Comprehensive guidance and recommendations

6. **Final Recommendations Format:**
   After gathering sufficient information (usually 5-8 questions), provide:
   ## Medical Assessment Summary
   
   **Possible Conditions:** [List 2-3 most likely conditions]
   
   **Urgency Level:** [Immediate/Urgent/Routine/Self-care]
   
   **Immediate Actions:**
   • [Specific action items]
   • [Self-care measures]
   
   **When to Seek Medical Care:**
   • [Red flag symptoms to watch for]
   • [Timeline for follow-up]
   
   **Self-Care Recommendations:**
   • [Specific guidance]
   • [Lifestyle modifications]

**IMPORTANT GUIDELINES:**
- Ask only ONE question per response
- Always provide multiple-choice options
- Use professional medical terminology with plain language explanations
- Maintain empathetic, professional tone
- Prioritize patient safety - err on the side of caution
- For serious symptoms, recommend immediate medical attention
- Always include medical disclaimer
- Adapt questions based on age, gender, and condition severity

**RED FLAGS requiring immediate medical attention:**
- Chest pain, difficulty breathing, severe abdominal pain
- Signs of stroke, severe headache, loss of consciousness
- Severe bleeding, signs of severe infection
- Suicidal thoughts or severe mental health crisis

Begin each consultation by asking about their primary health concern and offering specific symptom categories to choose from.`;

    // Sonar API request
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
        max_tokens: 1500,
        temperature: 0.2, // Lower temperature for more consistent medical questioning
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

    // Extract the AI response
    const aiResponse = response.data.choices[0].message.content;
    
    return res.json({ 
      response: aiResponse
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data.error || 'Error from Sonar API';
      return res.status(error.response.status).json({ 
        error: errorMessage
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(503).json({ 
        error: 'No response from Sonar API, please try again later' 
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({ 
        error: 'Failed to process your request. Please try again.' 
      });
    }
  }
});

export default router;