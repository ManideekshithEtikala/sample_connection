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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ===============================
  // SEND MESSAGE
  // ===============================
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
        `http://127.0.0.1:8000/agent/chat/${employeeId}/${jdSessionId}`,
        {
          message: input,
          qa: updatedQA
        }
      );

      const data = res.data;

      console.log("Backend response:", data);

      // ===============================
      // NEXT QUESTION
      // ===============================
      if (data.type === "question") {
        setCurrentQuestion(data.message);

        setMessages(prev => [
          ...prev,
          { sender: "agent", text: data.message }
        ]);
      }

      // ===============================
      // FINAL JD
      // ===============================
      else if (data.type === "job_description") {
        setGeneratedJD(data.jd_json);
        setCurrentQuestion(null);

        setMessages(prev => [
          ...prev,
          {
            sender: "agent",
            text: "✅ Job Description generated. Please review."
          },
          {
            sender: "jd",
            jdJson: data.jd_json
          }
        ]);
      }
    } catch (err: any) {
      console.error("API error:", err);
      setMessages(prev => [
        ...prev,
        { sender: "agent", text: "❌ Backend error. Try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // APPROVE JD
  // ===============================
  const approveJD = async () => {
    if (!generatedJD) return;

    await axios.post(
      `http://127.0.0.1:8000/agent/approve/${employeeId}/${jdSessionId}`,
      { jd_json: generatedJD }
    );

    localStorage.setItem("jdSessionId", crypto.randomUUID());

    setMessages([
      { sender: "agent", text: "Hi! Let's build your Job Description." }
    ]);

    setQaList([]);
    setGeneratedJD(null);
    setCurrentQuestion(null);
  };

  // ===============================
  // RENDER JD
  // ===============================
  const renderJD = (jd: JDJson) => (
    <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
      <h2>{jd.job_title}</h2>
      <p><b>Summary:</b> {jd.job_summary}</p>

      <h3>Responsibilities</h3>
      <ul>{jd.key_responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>

      <h3>Skills</h3>
      <ul>{jd.required_skills.map((s, i) => <li key={i}>{s}</li>)}</ul>

      <h3>Tools</h3>
      <ul>{jd.tools_and_technologies.map((t, i) => <li key={i}>{t}</li>)}</ul>

      <h3>Work Type</h3>
      <p>{jd.work_environment}</p>

      <h3>Reports To</h3>
      <p>{jd.reporting_structure}</p>

      <button
        onClick={approveJD}
        style={{
          marginTop: 20,
          background: "green",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: 6
        }}
      >
        ✅ Approve JD
      </button>
    </div>
  );

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ maxWidth: 800, margin: "auto" }}>
      <h1>HR AI JD Builder</h1>

      <div style={{
        height: 500,
        overflowY: "auto",
        background: "#f6f6f6",
        padding: 15,
        borderRadius: 10
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            {msg.sender === "jd" && msg.jdJson
              ? renderJD(msg.jdJson)
              : (
                <div style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
                  <span style={{
                    background: msg.sender === "user" ? "#DCF8C6" : "#EAEAEA",
                    padding: "8px 12px",
                    borderRadius: 10
                  }}>
                    {msg.text}
                  </span>
                </div>
              )}
          </div>
        ))}

        {loading && (
          <div style={{ fontStyle: "italic" }}>
            Agent is typing...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <input
        value={input}
        placeholder={currentQuestion || "Type your answer..."}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendMessage()}
        disabled={loading}
        style={{ width: "100%", padding: 10, marginTop: 10 }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 6,
          padding: 10,
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: 6
        }}
      >
        Send
      </button>
    </div>
  );
}
