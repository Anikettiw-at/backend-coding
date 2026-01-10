// const { GoogleGenAI } = require("@google/genai");




// const solveDoubt = async(req , res)=>{


//     try{

//         const {messages,title,description,testCases,startCode} = req.body;
//         const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
       
//         async function main() {
//         const response = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents: messages,
//         config: {
//         systemInstruction: `
// You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

// ## CURRENT PROBLEM CONTEXT:
// [PROBLEM_TITLE]: ${title}
// [PROBLEM_DESCRIPTION]: ${description}
// [EXAMPLES]: ${testCases}
// [startCode]: ${startCode}


// ## YOUR CAPABILITIES:
// 1. **Hint Provider**: Give step-by-step hints without revealing the complete solution
// 2. **Code Reviewer**: Debug and fix code submissions with explanations
// 3. **Solution Guide**: Provide optimal solutions with detailed explanations
// 4. **Complexity Analyzer**: Explain time and space complexity trade-offs
// 5. **Approach Suggester**: Recommend different algorithmic approaches (brute force, optimized, etc.)
// 6. **Test Case Helper**: Help create additional test cases for edge case validation

// ## INTERACTION GUIDELINES:

// ### When user asks for HINTS:
// - Break down the problem into smaller sub-problems
// - Ask guiding questions to help them think through the solution
// - Provide algorithmic intuition without giving away the complete approach
// - Suggest relevant data structures or techniques to consider

// ### When user submits CODE for review:
// - Identify bugs and logic errors with clear explanations
// - Suggest improvements for readability and efficiency
// - Explain why certain approaches work or don't work
// - Provide corrected code with line-by-line explanations when needed

// ### When user asks for OPTIMAL SOLUTION:
// - Start with a brief approach explanation
// - Provide clean, well-commented code
// - Explain the algorithm step-by-step
// - Include time and space complexity analysis
// - Mention alternative approaches if applicable

// ### When user asks for DIFFERENT APPROACHES:
// - List multiple solution strategies (if applicable)
// - Compare trade-offs between approaches
// - Explain when to use each approach
// - Provide complexity analysis for each

// ## RESPONSE FORMAT:
// - Use clear, concise explanations
// - Format code with proper syntax highlighting
// - Use examples to illustrate concepts
// - Break complex explanations into digestible parts
// - Always relate back to the current problem context
// - Always response in the Language in which user is comfortable or given the context

// ## STRICT LIMITATIONS:
// - ONLY discuss topics related to the current DSA problem
// - DO NOT help with non-DSA topics (web development, databases, etc.)
// - DO NOT provide solutions to different problems
// - If asked about unrelated topics, politely redirect: "I can only help with the current DSA problem. What specific aspect of this problem would you like assistance with?"

// ## TEACHING PHILOSOPHY:
// - Encourage understanding over memorization
// - Guide users to discover solutions rather than just providing answers
// - Explain the "why" behind algorithmic choices
// - Help build problem-solving intuition
// - Promote best coding practices

// Remember: Your goal is to help users learn and understand DSA concepts through the lens of the current problem, not just to provide quick answers.
// `},
//     });
     
//     res.status(201).json({
//         message:response.text
//     });
//     console.log(response.text);
//     }

//     main();
      
//     }
//     catch(err){
//         res.status(500).json({
//             message: "Internal server error"
//         });
//     }
// }

// module.exports = solveDoubt;



const { GoogleGenerativeAI } = require("@google/generative-ai");

const solveDoubt = async (req, res) => {
    try {
        const { messages, title, description, testCases, startCode } = req.body;

        if (!process.env.GEMINI_KEY) {
            throw new Error("GEMINI_KEY is missing in .env file");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            systemInstruction: `
You are an expert DSA tutor.
Context:
Title: ${title || "N/A"}
Description: ${description || "N/A"}
Examples: ${JSON.stringify(testCases) || "N/A"}
Start Code: ${startCode || "N/A"}
`
        });

        let chatHistory = [];
        let lastUserMessage = "";

        // Logic to handle messages
        if (Array.isArray(messages) && messages.length > 0) {
            
            // 1. Format messages for Gemini
            let formattedMessages = messages.map(msg => ({
                role: (msg.role === 'ai' || msg.role === 'model' || msg.role === 'assistant') ? 'model' : 'user',
                parts: [{ text: typeof msg.content === 'string' ? msg.content : (msg.parts?.[0]?.text || "") }]
            }));

            // 2. Separate the last new message (User input)
            const lastMsgObj = formattedMessages.pop(); 
            
            if (lastMsgObj && lastMsgObj.role === 'user') {
                lastUserMessage = lastMsgObj.parts[0].text;
            } else {
                // Agar last message user ka nahi hai, toh fallback
                lastUserMessage = "Explain this problem further.";
            }

            // -----------------------------------------------------------
            // --- FIX: Remove leading 'model' messages from history ---
            // -----------------------------------------------------------
            // History MUST start with 'user'. Agar pehla msg model ka hai, usse hata do.
            while (formattedMessages.length > 0 && formattedMessages[0].role === 'model') {
                formattedMessages.shift(); // Pehla element remove karo
            }

            chatHistory = formattedMessages;
        } 
        else if (typeof messages === "string") {
            lastUserMessage = messages;
        }
        else {
            lastUserMessage = "Help me with this problem.";
        }

        // Start Chat with clean history
        const chat = model.startChat({
            history: chatHistory,
        });

        const result = await chat.sendMessage(lastUserMessage);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({
            message: text
        });

    } catch (err) {
        console.log("---------------- ERROR LOG ----------------");
        console.error("Error Message:", err.message);
        // console.error("Full Error:", err); 
        console.log("-------------------------------------------");

        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

module.exports = solveDoubt;