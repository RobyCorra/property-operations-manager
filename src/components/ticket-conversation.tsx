"use client";

import { useTransition, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTicketMessage } from "@/src/app/actions/operational";
import SafeDate from "@/src/components/safe-date";
import { upload } from "@vercel/blob/client";

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
  heightClass?: string;
}

export default function TicketConversation({ entityId, initialMessages, currentUserRole, currentUserName, submitAction, heightClass = "h-[500px]" }: Props) {
  const [isPending, startTransition] = useTransition();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    const file = formData.get("files") as File | null;
    if (!tempText && !file?.size) return;

    if (file && file.size > 0) {
      setIsUploading(true);
      try {
        const blob = await upload(
          `uploads/tickets/${entityId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
          file,
          { access: "public", handleUploadUrl: "/api/blob-upload" }
        );
        formData.delete("files");
        formData.append("blobUrl", blob.url);
        formData.append("blobFilename", file.name);
        formData.append("blobMimeType", file.type || "application/octet-stream");
        formData.append("blobSize", String(file.size));
      } catch {
        setError("Errore durante il caricamento del file. Riprova.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    startTransition(async () => {
      try {
        const result = await submitAction(entityId, null, formData);
        if (result.success) {
          formRef.current?.reset();
          setSelectedFileName(null);
          router.refresh();
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
    <div className={`flex flex-col ${heightClass} border border-gray-100 rounded-2xl bg-gray-50/30`}>
      {/* Messages List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth min-h-0"
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
            isUploading ? 'bg-blue-100 text-blue-600' : isPending ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700'
          }`}>
            <span className="truncate">
              {isUploading ? '📤 Caricamento: ' : isPending ? '📤 Inviando: ' : '📎 '}
              {selectedFileName}
            </span>
            {!isPending && !isUploading && (
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
            disabled={isPending || isUploading}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 active:scale-95 transition-all shadow-md shadow-gray-200 disabled:opacity-50 shrink-0"
          >
            {isPending || isUploading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-px">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
