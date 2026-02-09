import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Bot, User, 
  Globe, Trash2, Download, RefreshCw
} from "lucide-react";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "नमस्ते! Welcome to the Citizen Assistance Chatbot. I can help you with:\n\n• Driving License queries\n• Vehicle Registration (RC)\n• Traffic Challan payments\n• Grievance registration\n\nHow can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chatbot/chat`, {
        message: inputMessage,
        session_id: sessionId,
        language: language
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
        intent: response.data.intent
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSessionId(response.data.session_id);

      // Text-to-Speech (if not muted)
      if (!isMuted && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.data.response);
        utterance.lang = language === 'hindi' ? 'hi-IN' : 
                        language === 'marathi' ? 'mr-IN' :
                        language === 'tamil' ? 'ta-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info("Recording started... Speak now");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Processing your voice...");
    }
  };

  const handleVoiceInput = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.wav');
    formData.append('language', language);

    try {
      const response = await axios.post(`${API}/stt/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.transcription) {
        setInputMessage(response.data.transcription);
        toast.success(`Transcribed: "${response.data.transcription}"`);
      }
    } catch (error) {
      console.error("Error transcribing:", error);
      toast.error("Failed to transcribe audio");
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared. How can I assist you today?",
      timestamp: new Date()
    }]);
    setSessionId(null);
    toast.success("Chat history cleared");
  };

  const quickResponses = [
    "Check DL status",
    "RC renewal process",
    "Pay traffic challan",
    "Register grievance",
    "Nearest RTO location"
  ];

  return (
    <div className="h-[calc(100vh-8rem)]" data-testid="chatbot-page">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Main Chat Area */}
        <Card className="lg:col-span-3 bg-white shadow-lg flex flex-col h-full">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gray-900">Citizen Assist Bot</CardTitle>
                  <p className="text-sm text-gray-500">Multilingual AI Assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32" data-testid="language-select">
                    <Globe className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">हिंदी</SelectItem>
                    <SelectItem value="marathi">मराठी</SelectItem>
                    <SelectItem value="tamil">தமிழ்</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  data-testid="mute-btn"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={clearChat}
                  data-testid="clear-chat-btn"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${index}`}
                >
                  <div
                    className={`max-w-[80%] p-4 ${
                      message.role === 'user'
                        ? 'chat-bubble-user'
                        : 'chat-bubble-assistant'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.intent && (
                      <Badge className="mt-2 bg-violet-100 text-violet-700">
                        {message.intent}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="chat-bubble-assistant p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                className={isRecording ? 'recording-pulse' : ''}
                data-testid="voice-btn"
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Input
                data-testid="chat-input"
                placeholder="Type your message or use voice..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                data-testid="send-btn"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-violet-500 to-pink-500"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickResponses.map((response, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => setInputMessage(response)}
                  data-testid={`quick-action-${index}`}
                >
                  {response}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Language Info */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 text-lg">Supported Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">English</span>
                  <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">हिंदी (Hindi)</span>
                  <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">मराठी (Marathi)</span>
                  <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">தமிழ் (Tamil)</span>
                  <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 border-violet-200">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Tips</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Click the microphone to speak</li>
                <li>• Use quick actions for common queries</li>
                <li>• Switch languages anytime</li>
                <li>• Responses are read aloud (toggle mute)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
