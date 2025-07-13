import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Zap, Brain, Mic, MicOff, AlertCircle, WifiOff } from 'lucide-react';

interface SearchFormProps {
  input: string;
  setInput: (value: string) => void;
  mode: string;
  setMode: (value: string) => void;
  depth: string;
  setDepth: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

type SpeechState = 'idle' | 'listening' | 'processing' | 'error' | 'unsupported';

export const SearchForm: React.FC<SearchFormProps> = ({
  input,
  setInput,
  mode,
  setMode,
  depth,
  setDepth,
  isLoading,
  onSubmit,
  onKeyPress
}) => {
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [speechError, setSpeechError] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkRetryCount, setNetworkRetryCount] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkRetryCount(0);
      // Clear network-related errors when coming back online
      if (speechError.includes('network') || speechError.includes('connection')) {
        setSpeechError('');
        if (speechState === 'error') {
          setSpeechState('idle');
        }
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [speechError, speechState]);

  // Initialize Speech Recognition once
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    const initializeSpeechRecognition = () => {
      console.log('Initializing Speech Recognition...');
      
      // Check if we're in a secure context
      const isSecure = window.isSecureContext || 
                      window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';

      if (!isSecure) {
        console.warn('Not in secure context');
        setSpeechState('error');
        setSpeechError('Voice input requires HTTPS or localhost');
        return;
      }

      // Check for Speech Recognition support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.warn('Speech Recognition not supported');
        setSpeechState('unsupported');
        setSpeechError('Speech recognition not supported in this browser. Try Chrome, Edge, or Safari.');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        
        // Configure recognition
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        // Event handlers
        recognition.onstart = () => {
          console.log('Speech recognition started');
          setSpeechState('listening');
          setSpeechError('');
          
          // Set a timeout to auto-stop after 15 seconds
          timeoutRef.current = setTimeout(() => {
            console.log('Speech recognition timeout');
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (e) {
                console.warn('Error stopping recognition on timeout:', e);
              }
            }
          }, 15000);
        };

        recognition.onresult = (event: any) => {
          console.log('Speech recognition result:', event);
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          setSpeechState('processing');
          
          try {
            const transcript = event.results[0][0].transcript.trim();
            const confidence = event.results[0][0].confidence;
            
            console.log('Transcript:', transcript, 'Confidence:', confidence);
            
            if (transcript && confidence > 0.2) {
              setInput(transcript);
              setSpeechState('idle');
              setNetworkRetryCount(0); // Reset retry count on success
              
              // Auto-trigger search after a brief delay
              setTimeout(() => {
                if (transcript.length > 2) {
                  onSubmit();
                }
              }, 1000);
            } else {
              setSpeechState('error');
              setSpeechError('Speech not clear enough. Please try again.');
              setTimeout(() => {
                setSpeechState('idle');
                setSpeechError('');
              }, 3000);
            }
          } catch (error) {
            console.error('Error processing speech result:', error);
            setSpeechState('error');
            setSpeechError('Error processing speech. Please try again.');
            setTimeout(() => {
              setSpeechState('idle');
              setSpeechError('');
            }, 3000);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error, 'Event:', event);
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          // Handle network errors more gracefully
          if (event.error === 'network') {
            console.log('Network error detected, retry count:', networkRetryCount);
            
            // Check if we're actually online
            if (!navigator.onLine) {
              setSpeechState('error');
              setSpeechError('No internet connection. Please check your network and try again.');
              return;
            }
            
            // Implement retry logic for network errors
            if (networkRetryCount < 2) {
              setNetworkRetryCount(prev => prev + 1);
              setSpeechState('error');
              setSpeechError(`Network issue detected. Retrying... (${networkRetryCount + 1}/3)`);
              
              // Auto-retry after a short delay
              setTimeout(() => {
                if (recognitionRef.current && navigator.onLine) {
                  try {
                    console.log('Auto-retrying speech recognition due to network error');
                    setSpeechState('idle');
                    setSpeechError('');
                    // Don't auto-start, let user click again
                  } catch (retryError) {
                    console.error('Error during network retry:', retryError);
                  }
                }
              }, 2000);
              return;
            } else {
              // Max retries reached
              setSpeechState('error');
              setSpeechError('Speech service temporarily unavailable due to network issues. Please try typing your query instead.');
              setNetworkRetryCount(0);
              return;
            }
          }

          setSpeechState('error');
          
          let errorMessage = '';
          let shouldAutoRecover = false;
          
          switch (event.error) {
            case 'not-allowed':
            case 'permission-denied':
              errorMessage = 'Microphone access denied. Please allow microphone permissions in your browser settings and refresh the page.';
              break;
            case 'no-speech':
              errorMessage = 'No speech detected. Please speak clearly and try again.';
              shouldAutoRecover = true;
              break;
            case 'audio-capture':
              errorMessage = 'Microphone not available. Check if another app is using it or if your microphone is connected.';
              break;
            case 'service-not-allowed':
              errorMessage = 'Speech service blocked. Make sure you\'re using HTTPS and check browser settings.';
              break;
            case 'bad-grammar':
              errorMessage = 'Could not understand speech. Please try speaking more clearly.';
              shouldAutoRecover = true;
              break;
            case 'language-not-supported':
              errorMessage = 'Language not supported. Using English by default.';
              shouldAutoRecover = true;
              break;
            case 'aborted':
              // User stopped or recognition was aborted - don't show error
              setSpeechState('idle');
              return;
            default:
              errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
              shouldAutoRecover = true;
          }
          
          setSpeechError(errorMessage);
          
          // Auto-clear error for recoverable issues
          if (shouldAutoRecover) {
            setTimeout(() => {
              setSpeechState('idle');
              setSpeechError('');
            }, 4000);
          }
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          // Only reset to idle if we're not already in another state
          if (speechState === 'listening') {
            setSpeechState('idle');
          }
        };

        recognitionRef.current = recognition;
        setSpeechState('idle');
        isInitializedRef.current = true;
        console.log('Speech recognition initialized successfully');
        
      } catch (error) {
        console.error('Speech recognition initialization error:', error);
        setSpeechState('error');
        setSpeechError('Failed to initialize speech recognition. Please refresh the page and try again.');
      }
    };

    initializeSpeechRecognition();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.warn('Error cleaning up recognition:', e);
        }
      }
    };
  }, []); // Empty dependency array - only run once

  const handleMicClick = async () => {
    console.log('Mic clicked, current state:', speechState, 'Online:', isOnline);
    
    if (!isOnline) {
      setSpeechState('error');
      setSpeechError('No internet connection. Please check your network and try again.');
      return;
    }

    if (speechState === 'listening') {
      // Stop listening
      console.log('Stopping speech recognition');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Error stopping recognition:', e);
        }
      }
      setSpeechState('idle');
      return;
    }

    if (speechState === 'error' || speechState === 'unsupported') {
      // Don't start if in error state, unless it's a network error and we're online
      if (speechState === 'error' && speechError.includes('network') && isOnline) {
        // Allow retry for network errors when back online
        setSpeechState('idle');
        setSpeechError('');
        setNetworkRetryCount(0);
      } else {
        return;
      }
    }

    if (!recognitionRef.current) {
      setSpeechState('error');
      setSpeechError('Speech recognition not available. Please refresh the page.');
      return;
    }

    try {
      // Request microphone permission first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          console.log('Requesting microphone permission');
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop the stream immediately - we just needed permission
          stream.getTracks().forEach(track => track.stop());
          console.log('Microphone permission granted');
        } catch (permissionError) {
          console.error('Microphone permission error:', permissionError);
          setSpeechState('error');
          setSpeechError('Microphone permission denied. Please allow microphone access in your browser settings.');
          return;
        }
      }

      // Start recognition
      console.log('Starting speech recognition');
      recognitionRef.current.start();
      
    } catch (error: any) {
      console.error('Error starting speech recognition:', error);
      setSpeechState('error');
      
      if (error.name === 'InvalidStateError') {
        setSpeechError('Speech recognition is already active. Please wait a moment and try again.');
        // Auto-recover from this state
        setTimeout(() => {
          setSpeechState('idle');
          setSpeechError('');
        }, 2000);
      } else {
        setSpeechError('Could not start voice recognition. Please try again.');
      }
    }
  };

  const getMicIcon = () => {
    switch (speechState) {
      case 'listening':
        return <MicOff className="w-5 h-5" />;
      case 'processing':
        return <Mic className="w-5 h-5 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'unsupported':
        return <Mic className="w-5 h-5 opacity-50" />;
      default:
        return <Mic className="w-5 h-5" />;
    }
  };

  const getMicButtonClass = () => {
    const baseClass = "p-2 rounded-full transition-all duration-300 ";
    
    switch (speechState) {
      case 'listening':
        return baseClass + "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50 hover:bg-red-600";
      case 'processing':
        return baseClass + "bg-accent-500 text-white animate-pulse";
      case 'error':
        // Allow clicking if it's a network error and we're back online
        const isNetworkErrorAndOnline = speechError.includes('network') && isOnline;
        return baseClass + (isNetworkErrorAndOnline 
          ? "bg-yellow-500 bg-opacity-20 text-yellow-400 cursor-pointer hover:bg-opacity-30" 
          : "bg-red-500 bg-opacity-20 text-red-400 cursor-help hover:bg-opacity-30");
      case 'unsupported':
        return baseClass + "bg-gray-500 bg-opacity-20 text-gray-500 cursor-not-allowed";
      default:
        return baseClass + "bg-accent-500 bg-opacity-20 text-accent-500 hover:bg-opacity-30 hover:scale-110 cursor-pointer";
    }
  };

  const getMicTooltip = () => {
    switch (speechState) {
      case 'listening':
        return 'Click to stop listening';
      case 'processing':
        return 'Processing speech...';
      case 'error':
        if (speechError.includes('network') && isOnline) {
          return 'Network issue resolved - click to try again';
        }
        return speechError;
      case 'unsupported':
        return 'Voice input not supported in this browser';
      default:
        return isOnline ? 'Click to start voice input' : 'No internet connection';
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Mode and Depth Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Search Mode */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="searchMode" className="text-gray-300 font-medium text-lg flex items-center">
            <Search className="w-5 h-5 mr-2 text-[#c89b3c]" />
            Research Category
          </label>
          <div className="relative">
            <select
              id="searchMode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-6 py-4 bg-[#2a2a2a] border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#c89b3c] focus:border-transparent transition-all duration-300 text-lg appearance-none cursor-pointer hover:bg-[#333333]"
              disabled={isLoading}
            >
              <option value="Person">👤 Person</option>
              <option value="Event">📅 Historical Event</option>
              <option value="Year">🗓️ Specific Year</option>
              <option value="Concept">💡 Concept/Idea</option>
              <option value="Location">🌍 Place/Location</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Research Depth */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="researchDepth" className="text-gray-300 font-medium text-lg flex items-center">
            <Zap className="w-5 h-5 mr-2 text-purple-400" />
            Research Depth
          </label>
          <div className="relative">
            <select
              id="researchDepth"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              className="w-full px-6 py-4 bg-[#2a2a2a] border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-lg appearance-none cursor-pointer hover:bg-[#333333]"
              disabled={isLoading}
            >
              <option value="Quick Idea">⚡ Quick Overview</option>
              <option value="Detailed Research">📚 Detailed Analysis</option>
              <option value="Investigator Mode">🕵️ Deep Investigation</option>
              <option value="Everything">🧩 Comprehensive Report</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Input Box with Voice Input */}
      <div className="relative">
        <input
          id="inputBox"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Enter your research topic... (e.g., 'Napoleon Bonaparte', 'World War II', '1969')"
          className="w-full px-6 py-5 pr-24 bg-[#2a2a2a] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c89b3c] focus:border-transparent transition-all duration-300 text-lg hover:bg-[#333333]"
          disabled={isLoading}
        />
        
        {/* Icons Container */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
          {/* Network Status Indicator */}
          {!isOnline && (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          
          {/* Voice Input Button */}
          <button
            onClick={handleMicClick}
            disabled={isLoading || speechState === 'unsupported'}
            className={getMicButtonClass()}
            title={getMicTooltip()}
          >
            {getMicIcon()}
          </button>
          
          {/* Search Icon */}
          <Search className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      {/* Voice Input Status */}
      {speechState === 'listening' && (
        <div className="flex items-center justify-center space-x-3 py-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-red-400 text-sm font-medium">🎙️ Listening... Speak clearly</span>
        </div>
      )}

      {speechState === 'processing' && (
        <div className="flex items-center justify-center space-x-3 py-2">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-400 text-sm font-medium">Processing speech...</span>
        </div>
      )}

      {/* Error Message */}
      {speechState === 'error' && speechError && (
        <div className="text-center">
          <div className={`border rounded-lg p-4 max-w-md mx-auto ${
            speechError.includes('network') && isOnline
              ? 'bg-yellow-500 bg-opacity-10 border-yellow-500 border-opacity-20'
              : 'bg-red-500 bg-opacity-10 border-red-500 border-opacity-20'
          }`}>
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className={`w-5 h-5 mr-2 ${
                speechError.includes('network') && isOnline ? 'text-yellow-400' : 'text-red-400'
              }`} />
              <span className={`font-medium ${
                speechError.includes('network') && isOnline ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {speechError.includes('network') && isOnline ? 'Network Issue Resolved' : 'Voice Input Error'}
              </span>
            </div>
            <p className={`text-sm ${
              speechError.includes('network') && isOnline ? 'text-yellow-300' : 'text-red-300'
            }`}>
              {speechError.includes('network') && isOnline 
                ? 'Connection restored. Click the microphone to try voice input again.'
                : speechError
              }
            </p>
            
            {/* Troubleshooting tips */}
            {(speechError.includes('network') || speechError.includes('service')) && !isOnline && (
              <div className="mt-3 text-gray-400 text-xs">
                <p className="font-medium mb-1">Troubleshooting:</p>
                <ul className="list-disc list-inside text-left space-y-1">
                  <li>Check internet connection</li>
                  <li>Disable VPN/proxy temporarily</li>
                  <li>Try refreshing the page</li>
                  <li>Use typed input as alternative</li>
                </ul>
              </div>
            )}
            
            {speechError.includes('permission') && (
              <div className="mt-3 text-gray-400 text-xs">
                <p>Allow microphone access in your browser settings and refresh the page.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {speechState === 'unsupported' && (
        <div className="text-center">
          <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-yellow-400 text-sm">
              ⚠️ Voice input not supported in this browser. Try Chrome, Edge, or Safari.
            </p>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <button
          id="askButton"
          onClick={onSubmit}
          disabled={isLoading || !input.trim()}
          className="px-10 py-4 bg-gradient-to-r from-[#c89b3c] to-[#a77d2e] text-white font-semibold rounded-2xl hover:from-[#d4a84d] hover:to-[#8d6426] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg min-w-[200px]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Researching...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Brain className="w-5 h-5 mr-2" />
              Start Research
            </span>
          )}
        </button>
      </div>
    </div>
  );
};