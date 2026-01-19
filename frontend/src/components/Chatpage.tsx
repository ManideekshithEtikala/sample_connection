import { useState, useRef, useEffect } from "react";
import axios from "axios";

type Sender = "agent" | "user" | "jd";

interface JDJson {
  job_title: string;
  job_summary: string;
  key_responsibilities: string[];
  required_skills: string[];
  preferred_qualifications: string[];
  tools_and_technologies: string[];
  work_environment: string;
  reporting_structure: string;
  impact_and_contributions?: string[];
}

interface Message {
  sender: Sender;
  text?: string;
  jdJson?: JDJson;
}

interface QA {
  question: string;
  answer: string;
}

export default function Chatpage() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "agent", text: "Hi! Let's build your Job Description." }
  ]);
  const [input, setInput] = useState("");
  const [qaList, setQaList] = useState<QA[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedJD, setGeneratedJD] = useState<JDJson | null>(null);

  const employeeId =
    localStorage.getItem("employeeId") ||
    (() => {
      const id = crypto.randomUUID();
      localStorage.setItem("employeeId", id);
      return id;
    })();

  const jdSessionId =
    localStorage.getItem("jdSessionId") ||
    (() => {
      const id = crypto.randomUUID();
      localStorage.setItem("jdSessionId", id);
      return id;
    })();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setMessages(prev => [...prev, { sender: "user", text: input }]);

    const updatedQA = currentQuestion
      ? [...qaList, { question: currentQuestion, answer: input }]
      : qaList;

    setQaList(updatedQA);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `https://sample-connection.onrender.com/agent/chat/${employeeId}/${jdSessionId}`,
        {
          message: input,
          qa: updatedQA
        }
      );

      const data = res.data;

      // Next question
      if (data.type === "question") {
        setCurrentQuestion(data.message);
        setMessages(prev => [...prev, { sender: "agent", text: data.message }]);
      }

      // Final JD
      else if (data.type === "job_description") {
        setGeneratedJD(data.jd_json);
        setCurrentQuestion(null);
        setMessages(prev => [
          ...prev,
          { sender: "agent", text: "✅ Job Description generated. Please review." },
          { sender: "jd", jdJson: data.jd_json }
        ]);
      }
    } catch (err: unknown) {
      console.error("API error:", err);
      setMessages(prev => [
        ...prev,
        { sender: "agent", text: "❌ Backend error. Try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const approveJD = async () => {
    if (!generatedJD) return;

    await axios.post(
      `https://sample-connection.onrender.com/agent/approve/${employeeId}/${jdSessionId}`,
      { jd_json: generatedJD }
    );

    localStorage.setItem("jdSessionId", crypto.randomUUID());

    setMessages([{ sender: "agent", text: "Hi! Let's build your Job Description." }]);
    setQaList([]);
    setGeneratedJD(null);
    setCurrentQuestion(null);
  };

  const renderJD = (jd: JDJson) => (
    <div style={{ background: "#fff", padding: 15, borderRadius: 8, border: "1px solid #ddd" }}>
      <h2 style={{ margin: "0 0 10px 0" }}>{jd.job_title}</h2>
      <p><b>Summary:</b> {jd.job_summary}</p>

      <h4>Responsibilities</h4>
      <ul>{jd.key_responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>

      <h4>Skills</h4>
      <ul>{jd.required_skills.map((s, i) => <li key={i}>{s}</li>)}</ul>

      <h4>Tools</h4>
      <ul>{jd.tools_and_technologies.map((t, i) => <li key={i}>{t}</li>)}</ul>

      <p><b>Work Type:</b> {jd.work_environment}</p>
      <p><b>Reports To:</b> {jd.reporting_structure}</p>

      <button
        onClick={approveJD}
        style={{
          marginTop: 15,
          background: "green",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        ✅ Approve JD
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>HR AI JD Builder</h1>

      <div style={{
        height: 500,
        overflowY: "auto",
        background: "#f6f6f6",
        padding: 15,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column"
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            {msg.sender === "jd" && msg.jdJson
              ? renderJD(msg.jdJson)
              : (
                <div style={{
                  textAlign: msg.sender === "user" ? "right" : "left"
                }}>
                  <span style={{
                    display: "inline-block",
                    background: msg.sender === "user" ? "#DCF8C6" : "#EAEAEA",
                    padding: "8px 12px",
                    borderRadius: 12,
                    maxWidth: "70%",
                    wordWrap: "break-word"
                  }}>
                    {msg.text}
                  </span>
                </div>
              )}
          </div>
        ))}

        {loading && (
          <div style={{ fontStyle: "italic", color: "#555", marginBottom: 5 }}>
            Agent is typing...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          ref={inputRef}
          value={input}
          placeholder={currentQuestion || "Type your answer..."}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          disabled={loading}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            outline: "none"
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            marginLeft: 5,
            padding: "10px 15px",
            borderRadius: 8,
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
