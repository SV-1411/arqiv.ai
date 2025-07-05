import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { SavedResearchPage } from './components/SavedResearchPage';
import { supabase } from './lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { ImageResult } from './types';

function App() {
  const [pageTitle, setPageTitle] = useState('ThinkVault');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('Person');
  const [depth, setDepth] = useState('Detailed Research');
  const [wikiImage, setWikiImage] = useState('');
  const [images, setImages] = useState<ImageResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state and set up listener
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth state...');
        
        // Set a timeout to ensure loading state doesn't get stuck
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('⚠️ Auth initialization timeout, proceeding without auth');
            setAuthLoading(false);
          }
        }, 5000); // 5 second timeout
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Clear timeout since we got a response
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          // Continue without auth
          if (mounted) {
            setUser(null);
            setAuthLoading(false);
          }
          return;
        }
        
        console.log('✅ Initial session:', session?.user?.email || 'No user');
        
        if (mounted) {
          setUser(session?.user ?? null);
          setAuthLoading(false);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (mounted) {
          setUser(null);
          setAuthLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (!mounted) return;
        
        const newUser = session?.user ?? null;
        setUser(newUser);
        
        // Ensure auth loading is false when auth state changes
        setAuthLoading(false);
      }
    );

    // Initialize auth
    initializeAuth();

    // Cleanup
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const fetchWikiSummary = async (topic: string) => {
    try {
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
      
      if (!response.ok) {
        return { extract: null, thumbnail: null };
      }
      
      const data = await response.json();
      return {
        extract: data.extract || null,
        thumbnail: data.thumbnail?.source || null
      };
    } catch (error) {
      console.error('Wikipedia API error:', error);
      return { extract: null, thumbnail: null };
    }
  };

  const fetchWikimediaImages = async (query: string): Promise<ImageResult[]> => {
    try {
      // Search for images on Wikimedia Commons
      const searchResponse = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=3&origin=*`
      );
      
      if (!searchResponse.ok) return [];
      
      const searchData = await searchResponse.json();
      const images: ImageResult[] = [];
      
      for (const item of searchData.query?.search || []) {
        try {
          // Get image info
          const imageResponse = await fetch(
            `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(item.title)}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&origin=*`
          );
          
          if (!imageResponse.ok) continue;
          
          const imageData = await imageResponse.json();
          const page = Object.values(imageData.query?.pages || {})[0] as any;
          
          if (page?.imageinfo?.[0]) {
            const imageInfo = page.imageinfo[0];
            images.push({
              url: imageInfo.thumburl || imageInfo.url,
              alt: imageInfo.extmetadata?.ImageDescription?.value || `Wikimedia image for ${query}`,
              source: 'Wikimedia Commons',
              credit: `Image from Wikimedia Commons`
            });
          }
        } catch (error) {
          console.warn('Error fetching individual Wikimedia image:', error);
        }
      }
      
      return images.slice(0, 2);
    } catch (error) {
      console.error('Wikimedia Commons API error:', error);
      return [];
    }
  };

  const fetchNewsImages = async (query: string): Promise<ImageResult[]> => {
    try {
      // Using NewsAPI for news-related images (requires API key in production)
      // For demo purposes, we'll simulate news image structure
      console.log('News images would be fetched for:', query);
      
      // In production, you would use:
      // const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=YOUR_API_KEY&pageSize=3`);
      
      return []; // Return empty for now - would need API key
    } catch (error) {
      console.error('News API error:', error);
      return [];
    }
  };

  const fetchResearchImages = async (topic: string): Promise<ImageResult[]> => {
    const allImages: ImageResult[] = [];
    
    try {
      // Fetch from research-grade sources
      const wikimediaImages = await fetchWikimediaImages(topic);
      
      // Add Wikipedia image if available
      if (wikiImage) {
        allImages.push({
          url: wikiImage,
          alt: `Wikipedia image for ${topic}`,
          source: 'Wikipedia',
          credit: 'Image from Wikipedia'
        });
      }
      
      // Combine all research images, limiting to 4 total
      allImages.push(...wikimediaImages);
      
      return allImages.slice(0, 4);
    } catch (error) {
      console.error('Error fetching research images:', error);
      return wikiImage ? [{
        url: wikiImage,
        alt: `Wikipedia image for ${topic}`,
        source: 'Wikipedia',
        credit: 'Image from Wikipedia'
      }] : [];
    }
  };

  const getRandomPromptVariations = () => {
    const toneVariations = [
      "Explain this from a unique angle, covering different time periods and perspectives every time. Avoid repetition. Surprise the reader with fresh insights and lesser-known details.",
      "Approach this topic from an unexpected perspective, weaving together multiple historical eras and viewpoints. Focus on surprising connections and overlooked aspects that most people don't know.",
      "Present this information through a fresh lens, exploring various time periods and cultural contexts. Emphasize rare facts, alternative viewpoints, and fascinating details that aren't commonly discussed.",
      "Take an innovative approach to this subject, connecting different historical periods and diverse perspectives. Highlight unusual angles, hidden stories, and intriguing details that offer new understanding.",
      "Examine this topic from multiple dimensions across different eras, revealing surprising insights and lesser-known connections. Focus on unique aspects that challenge conventional understanding."
    ];

    const structureVariations = [
      "chronological journey through different eras",
      "thematic exploration across time periods",
      "comparative analysis between different historical contexts",
      "narrative that weaves together multiple perspectives",
      "investigative approach revealing hidden connections"
    ];

    const emphasisVariations = [
      "cultural impact and societal changes",
      "technological and scientific developments",
      "political and economic influences",
      "human stories and personal experiences",
      "global connections and cross-cultural exchanges"
    ];

    return {
      tone: toneVariations[Math.floor(Math.random() * toneVariations.length)],
      structure: structureVariations[Math.floor(Math.random() * structureVariations.length)],
      emphasis: emphasisVariations[Math.floor(Math.random() * emphasisVariations.length)]
    };
  };

  const generatePrompt = (question: string, wikiData: any, mode: string, depth: string, isRegeneration: boolean = false) => {
    const wikiExtract = wikiData.extract;
    const searchContext = null; // Prepared for future web search integration
    
    const variations = getRandomPromptVariations();
    const randomSeed = Math.floor(Math.random() * 1000);
    
    const basePrompt = `You are a knowledge analyst and OSINT assistant trained to provide structured, research-grade information retrieval and presentation.

${variations.tone}

RESEARCH QUERY: "${question}"
RESEARCH CATEGORY: "${mode}"
DEPTH LEVEL: "${depth}"
APPROACH: Focus on ${variations.structure} with emphasis on ${variations.emphasis}
VARIATION SEED: ${randomSeed} ${isRegeneration ? '(REGENERATED - Use different examples, facts, and perspectives than previous responses)' : ''}

--- WIKIPEDIA CONTEXT ---
${wikiExtract || 'No Wikipedia summary found for this topic'}

--- SEARCH CONTEXT ---
${searchContext || 'No additional web search data available'}

INSTRUCTIONS:
Follow this exact structure for your response, but vary your examples, facts, and perspectives:

📌 **Summary**
Write a 2-3 line abstract that captures the core essence from a ${variations.structure} perspective.

📂 **Detailed Information**
Organize content under clear subheadings, varying your focus based on the approach:
- **Origin/Background** - Historical context and beginnings across different eras
- **Evolution Through Time** - How this topic changed across different periods
- **Key Figures & Events** - Important people and milestones from various time periods
- **Cultural & Global Impact** - Influence across different societies and regions
- **Modern Relevance** - Contemporary connections and ongoing significance
- **Cross-Period Connections** - Surprising links between different eras

Use bullet points and emphasize:
- **Bold** for names, places, and important terms
- **Bold dates** for temporal references
- *Italics* for concepts, titles, or emphasis
- Clear hierarchical structure with subheadings

📊 **Key Facts & Figures**
- Present quantifiable data from different time periods
- Include comparative statistics across eras
- Highlight surprising numerical insights

🔗 **Sources & Citations**
- Reference Wikipedia data when used
- Mention the reliability and completeness of available information
- Note any gaps or limitations in the data

🧠 **Analysis Notes**
- Confidence Level: High/Medium/Low based on source quality
- Data Completeness: Comprehensive/Partial/Limited
- Historical Context: How understanding has evolved over time
- Any ambiguities or clarifications needed

📌 **Related Topics to Explore**
Suggest 2-4 related subjects for further research from different time periods or perspectives

🧠 **Curious to Explore More?**
At the end, suggest 3-5 related topics for deeper research that align with this subject but from different angles or time periods. These should be specific, intriguing topics that would naturally interest someone researching the main subject. Format as a bulleted list with brief descriptions where helpful.

SPECIAL HANDLING:
- If the topic is vague or ambiguous, explore multiple interpretations across different contexts
- If information is limited, suggest alternative queries and related topics from different eras
- Present multiple perspectives objectively, especially for controversial topics
- Always prioritize factual accuracy over speculation
- Vary your examples and focus areas to avoid repetitive responses

DEPTH-SPECIFIC ADJUSTMENTS:
${depth === 'Quick Idea' ? '- Keep sections concise, focus on essential facts from key time periods' : ''}
${depth === 'Detailed Research' ? '- Provide comprehensive coverage across multiple historical contexts' : ''}
${depth === 'Investigator Mode' ? '- Include lesser-known facts, cultural variants, and cross-temporal analysis' : ''}
${depth === 'Everything' ? '- Combine all approaches with maximum detail and multi-era research suggestions' : ''}

FORMAT REQUIREMENTS:
- Use proper markdown formatting
- Maintain clear visual hierarchy
- Ensure readability and professional presentation
- Structure information logically from general to specific
- Vary your presentation style while maintaining structure

Respond with the structured analysis following this exact format. Do not include conversational elements like "Here's what I found" - begin directly with the 📌 Summary section.`;

    return basePrompt;
  };

  const generateSuggestions = async (topic: string, mode: string) => {
    setIsLoadingSuggestions(true);
    
    try {
      const suggestionPrompt = `Based on the research topic "${topic}" (category: ${mode}), generate exactly 5 related, curious, and specific research topics that would genuinely interest someone exploring this subject.

Requirements:
- Each suggestion should be a specific, intriguing topic (not generic)
- Mix different time periods, perspectives, and angles
- Include surprising connections or lesser-known aspects
- Make them sound like real research queries someone would actually search for
- Vary between people, events, concepts, and places related to the main topic
- Keep each suggestion under 60 characters for button display

Format: Return only the 5 suggestions, one per line, no numbering or bullets.

Examples of good suggestions:
- "Why did Tesla fear pearls?"
- "The Pope who put a dead body on trial"
- "How coffee beans started a revolution"
- "The woman who fooled Napoleon"
- "Why purple was illegal to wear"

Generate 5 similar curious topics related to "${topic}":`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [{ role: "user", content: suggestionPrompt }],
          temperature: 0.8,
          max_tokens: 300
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const suggestionsText = data.choices[0].message.content.trim();
        const suggestionsList = suggestionsText
          .split('\n')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0 && !s.match(/^\d+\.?\s/)) // Remove numbered items
          .slice(0, 5);
        
        setSuggestions(suggestionsList);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback suggestions based on mode
      const fallbackSuggestions = {
        'Person': ['The spy who never existed', 'Why Einstein refused surgery', 'The artist who painted with blood'],
        'Event': ['The war that lasted 38 minutes', 'When time zones caused chaos', 'The treaty signed in a bathroom'],
        'Year': ['The year winter never came', 'When calendars lost 11 days', 'The year of six popes'],
        'Concept': ['Why we shake hands', 'The origin of OK', 'How zero was invented'],
        'Location': ['The city that moves every year', 'Islands that appear and vanish', 'The country inside a country']
      };
      
      setSuggestions(fallbackSuggestions[mode as keyof typeof fallbackSuggestions] || fallbackSuggestions['Concept']);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const askGPT = async (question: string, isRegeneration: boolean = false) => {
    if (!question.trim()) return;
    
    if (isRegeneration) {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
      setResult('');
      setWikiImage('');
      setImages([]);
      setSuggestions([]);
    }
    
    try {
      // Fetch Wikipedia summary first
      const wikiData = await fetchWikiSummary(question);
      
      // Store the image if available
      if (wikiData.thumbnail) {
        setWikiImage(wikiData.thumbnail);
      }
      
      // Fetch research-grade images
      const fetchedImages = await fetchResearchImages(question);
      setImages(fetchedImages);
      
      const prompt = generatePrompt(question, wikiData, mode, depth, isRegeneration);
      
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        setResult('API key is not configured. Please set VITE_OPENROUTER_API_KEY in your .env file.');
        setIsLoading(false);
        setIsRegenerating(false);
        return;
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: isRegeneration ? 0.9 : 0.7, // Higher temperature for regeneration
          max_tokens: 2500
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setResult(data.choices[0].message.content);
        
        // Generate suggestions after getting the main result
        if (!isRegeneration) {
          await generateSuggestions(question, mode);
        }
      } else {
        setResult('Sorry, there was an error processing your request. Please try again.');
      }
      
    } catch (error) {
      console.error('API Error:', error);
      setResult('Sorry, there was an error processing your request. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  const handleAskAI = (question: string) => {
    if (isLoading || isRegenerating || !question.trim()) return;
    setPageTitle(`${question} - ThinkVault`);
    askGPT(question);
  };

  const handleRegenerateAnswer = () => {
    if (!input.trim()) {
      alert('No topic to regenerate. Please enter a research topic first.');
      return;
    }
    
    askGPT(input, true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleAskAI(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskAI(input);
    }
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#2a1a2a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00bfff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading AI Research Hub...</p>
          <p className="text-gray-500 text-sm mt-2">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#2a1a2a] text-white">
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <Header user={user} isAuthLoading={authLoading} />

      <main className="relative container mx-auto px-4 py-8 max-w-5xl pt-24">
        <Routes>
          <Route path="/" element={
            <HomePage 
              input={input}
              setInput={setInput}
              mode={mode}
              setMode={setMode}
              depth={depth}
              setDepth={setDepth}
              isLoading={isLoading}
              onSubmit={handleAskAI}
              onKeyPress={handleKeyPress}
              result={result}
              isRegenerating={isRegenerating}
              wikiImage={wikiImage}
              images={images}
              suggestions={suggestions}
              isLoadingSuggestions={isLoadingSuggestions}
              onRegenerate={handleRegenerateAnswer}
              onSuggestionClick={handleSuggestionClick}
              user={user}
            />
          } />
          <Route path="/saved" element={<SavedResearchPage user={user} onSuggestionClick={handleSuggestionClick} />} />
        </Routes>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
            <span className="text-sm font-medium">AI Research Hub</span>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
          </div>
          <p className="text-sm">
            Powered by advanced AI • Enhanced with OSINT methodology • Built for researchers
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;