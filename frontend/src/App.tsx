import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

/* ================= TYPES ================= */

type Sender = "agent" | "user" | "jd";

interface Message {
  sender: Sender;
  text?: string;
  jdJson?: JDJson;
}

interface JDJson {
  inferred_job_title: string;
  seniority: string;
  job_title: string;
  job_summary: string;
  key_responsibilities: string[];
  required_skills: string[];
  preferred_qualifications: string[];
  tools_and_technologies: string[];
  work_environment: string;
  reporting_structure: string;
  achievements: string;
  leadership: string;
  projects?: {
    title: string;
    description: string;
    technologies: string[];
  }[];
}

interface ApiResponse {
  type: "question" | "job_description";
  message?: string;
  jd_json?: JDJson;
}

/* ================= APP ================= */

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "agent",
      text: "Hi! Let's build your job description. What's your current role?",
    },
  ]);

  const [input, setInput] = useState("");
  const [employeeId] = useState("emp123");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    try {
      const res = await axios.post<ApiResponse>(
        `http://localhost:8000/agent/chat/${employeeId}`,
        { message: input }
      );

      if (res.data.type === "question") {
        setMessages((prev) => [
          ...prev,
          { sender: "agent", text: res.data.message },
        ]);
      }

      if (res.data.type === "job_description" && res.data.jd_json) {
        setMessages((prev) => [
          ...prev,
          { sender: "agent", text: "✅ Job Description Generated" },
          { sender: "jd", jdJson: res.data.jd_json },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "agent", text: "❌ Server error. Please try again." },
      ]);
    }

    setInput("");
  };

  /* ================= DOWNLOAD FORMAT ================= */
  const formatJDForDownload = (jd: JDJson): string => {
    return `
JOB TITLE
${jd.job_title} (${jd.seniority})

JOB SUMMARY
${jd.job_summary}

KEY RESPONSIBILITIES
${jd.key_responsibilities.map((r) => `- ${r}`).join("\n")}

REQUIRED SKILLS
${jd.required_skills.map((s) => `- ${s}`).join("\n")}

TOOLS & TECHNOLOGIES
${jd.tools_and_technologies.map((t) => `- ${t}`).join("\n")}

WORK ENVIRONMENT
${jd.work_environment}

REPORTING STRUCTURE
${jd.reporting_structure}

ACHIEVEMENTS
${jd.achievements}

LEADERSHIP
${jd.leadership}
`;
  };

  const downloadJD = (jd: JDJson) => {
    const blob = new Blob([formatJDForDownload(jd)], {
      type: "text/plain",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Job_Description.txt";
    link.click();
  };

  /* ================= RENDER JD ================= */
  const renderJD = (jd: JDJson) => (
    <div>
      <h2>{jd.job_title} ({jd.seniority})</h2>
      <p><strong>Summary:</strong> {jd.job_summary}</p>

      <h3>Key Responsibilities</h3>
      <ul>{jd.key_responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>

      <h3>Required Skills</h3>
      <ul>{jd.required_skills.map((s, i) => <li key={i}>{s}</li>)}</ul>

      <h3>Tools & Technologies</h3>
      <ul>{jd.tools_and_technologies.map((t, i) => <li key={i}>{t}</li>)}</ul>

      <h3>Work Environment</h3>
      <p>{jd.work_environment}</p>

      <h3>Reporting Structure</h3>
      <p>{jd.reporting_structure}</p>

      <h3>Achievements</h3>
      <p>{jd.achievements}</p>

      <h3>Leadership</h3>
      <p>{jd.leadership}</p>
    </div>
  );

  /* ================= UI ================= */
  return (
    <div style={{ fontFamily: "Arial", maxWidth: "800px", margin: "auto",color: "#333" }}>
      <h1 style={{ textAlign: "center" }}>HR AI Chat</h1>

      <div
        style={{
          height: "500px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "10px",
          background: "#f4f4f4",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "1rem" }}>
            {msg.sender === "jd" && msg.jdJson ? (
              <div style={{ background: "#fff3cd", padding: "1rem", borderRadius: "8px" }}>
                {renderJD(msg.jdJson)}
                <button
                  onClick={() => downloadJD(msg.jdJson!)}
                  style={{ marginTop: "1rem" }}
                >
                  ⬇ Download JD
                </button>
              </div>
            ) : (
              <div
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.6rem 1rem",
                    borderRadius: "12px",
                    background:
                      msg.sender === "user" ? "#DCF8C6" : "#EAEAEA",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type your answer..."
        style={{ width: "100%", padding: "0.7rem", marginTop: "1rem" }}
      />

      <button
        onClick={sendMessage}
        style={{
          width: "100%",
          padding: "0.7rem",
          marginTop: "0.5rem",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
        }}
      >
        Send
      </button>
    </div>
  );
};

export default App;
