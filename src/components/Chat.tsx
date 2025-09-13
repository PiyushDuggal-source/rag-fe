import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { uploadDocument, askQuestion } from "../services";

const Chat = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([]);
  const [lastContext, setLastContext] = useState<any[]>([]);
  const [showContext, setShowContext] = useState(false);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFile(e.target.files?.[0] || null);
      setUploadError("");
    },
    []
  );

  const handleUpload = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!file) return;
      setUploading(true);
      setUploadError("");
      try {
        await uploadDocument(file);
        setUploaded(true);
      } catch (err: any) {
        setUploadError(err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [file]
  );

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      setChatLoading(true);
      setChatError("");
      setMessages((msgs) => [...msgs, { role: "user", text: input }]);
      try {
        const res = await askQuestion(input);
        setMessages((msgs) => [...msgs, { role: "bot", text: res.answer }]);
        setLastContext(res.context || []);
        setShowContext(false);
        setInput("");
      } catch (err: any) {
        setChatError(err.message || "Chat failed");
      } finally {
        setChatLoading(false);
      }
    },
    [input]
  );

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const renderedMessages = useMemo(
    () =>
      messages.map((msg, idx) => (
        <div
          key={idx}
          className={`mb-2 p-2 rounded ${
            msg.role === "user"
              ? "bg-blue-50 text-blue-900"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          <span className="font-semibold">
            {msg.role === "user" ? "You" : "Bot"}:
          </span>{" "}
          {msg.text}
        </div>
      )),
    [messages]
  );

  if (!uploaded) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow">
        <h2 className="text-xl font-bold mb-6 text-center">
          Upload a Document
        </h2>
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            accept=".txt,.pdf,.md,.docx"
            onChange={handleFileChange}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={uploading || !file}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
        {uploadError && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
            {uploadError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-center">
        Chat About Your Document
      </h2>
      <div className="flex-1 mb-4 overflow-y-auto max-h-96">
        {renderedMessages}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <input
          type="text"
          className="border p-2 rounded flex-1"
          placeholder="Ask something about the document..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={chatLoading}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={chatLoading || !input.trim()}
        >
          {chatLoading ? "Sending..." : "Send"}
        </button>
      </form>
      {chatError && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {chatError}
        </div>
      )}
      {lastContext.length > 0 && (
        <div className="mt-4">
          <button
            className="text-sm text-blue-600 underline mb-2"
            onClick={() => setShowContext((v) => !v)}
            type="button"
          >
            {showContext ? "Hide" : "Show"} Context Chunks
          </button>
          {showContext && (
            <div className="bg-gray-50 border rounded p-2">
              <div className="font-semibold mb-2">Context Chunks Used:</div>
              <ul className="list-disc pl-4">
                {lastContext.map((chunk, idx) => (
                  <li key={idx} className="mb-1 text-xs">
                    {chunk.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
