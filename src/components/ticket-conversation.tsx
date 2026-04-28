"use client";

import { useTransition, useRef, useState, useEffect } from "react";
import { createTicketMessage } from "@/src/app/actions/operational";
import SafeDate from "@/src/components/safe-date";

interface Message {
  id: string;
  text: string | null;
  role: string;
  senderName: string;
  createdAt: Date;
  attachment?: {
    id: string;
    url: string;
    fileName: string;
    fileType: string | null;
  } | null;
}

interface Props {
  entityId: string;
  initialMessages: any[];
  currentUserRole: string;
  currentUserName: string;
  submitAction: (id: string, prevState: any, formData: FormData) => Promise<any>;
}

export default function TicketConversation({ entityId, initialMessages, currentUserRole, currentUserName, submitAction }: Props) {
  const [isPending, startTransition] = useTransition();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, initialMessages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("role", currentUserRole);
    formData.append("senderName", currentUserName);

    const tempText = formData.get("text") as string;
    if (!tempText && !(formData.get("files") as File)?.size) return;

    startTransition(async () => {
      try {
        const result = await submitAction(entityId, null, formData);
        if (result.success) {
          formRef.current?.reset();
          setSelectedFileName(null);
        } else if (result.error) {
          setError(result.error);
        }
      } catch (err) {
        setError("Errore durante l'invio del messaggio.");
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFileName(file ? file.name : null);
  };

  return (
    <div className="flex flex-col h-[500px] border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30">
      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {initialMessages.length === 0 && (
          <div className="flex justify-center items-center h-full text-gray-400 text-xs">
            Nessun messaggio. Inizia la conversazione.
          </div>
        )}
        {initialMessages.map((msg) => {
          const isMe = msg.role === currentUserRole;
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                isMe ? 'bg-black text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                <p className="text-[10px] font-bold opacity-60 mb-1">{msg.senderName}</p>
                {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                
                {msg.attachment && (
                  <div className={`mt-2 p-2 rounded-xl border ${isMe ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                    {msg.attachment.fileType?.startsWith('image/') ? (
                      <a href={msg.attachment.url} target="_blank" rel="noreferrer">
                        <img src={msg.attachment.url} alt="Allegato" className="max-h-40 rounded-lg object-contain" />
                      </a>
                    ) : (
                      <a 
                        href={msg.attachment.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 text-[10px] font-bold uppercase truncate"
                      >
                        <span>📎</span> {msg.attachment.fileName}
                      </a>
                    )}
                  </div>
                )}
                
                <p className={`text-[9px] mt-1 text-right opacity-50`}>
                  <SafeDate date={msg.createdAt} format={{ hour: '2-digit', minute: '2-digit' }} />
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        className="p-3 bg-white border-t border-gray-100 space-y-2"
      >
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold animate-in fade-in slide-in-from-top-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {selectedFileName && (
          <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-bold animate-in fade-in slide-in-from-bottom-2 ${
            isPending ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700'
          }`}>
            <span className="truncate">
              {isPending ? '📤 Inviando: ' : '📎 '}
              {selectedFileName}
            </span>
            {!isPending && (
              <button 
                type="button" 
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  setSelectedFileName(null);
                }}
                className="ml-2 hover:text-blue-900"
              >
                ✕
              </button>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0"
          >
            <span className="text-xl">📎</span>
            <input 
              ref={fileInputRef}
              type="file" 
              name="files" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </button>
          
          <input
            autoComplete="off"
            type="text"
            name="text"
            placeholder="Scrivi un messaggio..."
            className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-black transition-all outline-none"
          />
          
          <button
            type="submit"
            disabled={isPending}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-all shadow-md shadow-gray-200 disabled:opacity-50"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="text-lg">↗️</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
