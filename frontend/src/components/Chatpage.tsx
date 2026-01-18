import  { useState, useRef, useEffect } from "react";
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

interface ApiResponse {
  type: "question" | "job_description";
  message?: string;
  jd_json?: JDJson;
}

const Chatpage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "agent",
      text: "Hi! Let's build your Job Description.",
    },
  ]);

  const [input, setInput] = useState("");
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
  }, [messages]);

  // ======================
  // SEND MESSAGE
  // ======================
  const sendMessage = async () => {
  if (!input.trim()) return;
  setMessages(prev => [...prev, { sender: "user", text: input }]);
  try {
    const res = await axios.post<ApiResponse>(
      `https://sample-connection.onrender.com/agent/chat/${employeeId}/${jdSessionId}`,
      { message: input }
    );

    if (res.data.type === "question") {
      setMessages(prev => [...prev, { sender: "agent", text: res.data.message }]);
    } else if (res.data.type === "job_description") {
      setMessages(prev => [
        ...prev,
        { sender: "agent", text: "✅ Job Description Generated" },
        { sender: "jd", jdJson: res.data.jd_json },
      ]);
    }
  } catch (err) {
    console.error(err);
    setMessages(prev => [...prev, { sender: "agent", text: "❌ Something went wrong. Please try again." }]);
  }

  setInput("");
};


  // ======================
  // APPROVE JD
  // ======================
const approveJD = async () => {
  try {
    await axios.post(
      `https://sample-connection.onrender.com/agent/approve/${employeeId}/${jdSessionId}`
    );

    // Clear session ID so next JD starts fresh
    localStorage.removeItem("jdSessionId");

    // Reset state for a new JD session
    setMessages([
      {
        sender: "agent",
        text: "Hi! Let's build your Job Description.",
      },
    ]);
    const newSessionId = crypto.randomUUID();
localStorage.setItem("jdSessionId", newSessionId);

    setInput("");

    alert("✅ Job Description Approved! Start a new JD now.");
  } catch (err) {
    console.error(err);
    alert("❌ Failed to approve JD. Try again.");
  }
};


  // ======================
  // JD VIEW
  // ======================
 const renderJD = (jd: JDJson) => (
  <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
    <h2>{jd.job_title}</h2>

    <p>
      <strong>Summary:</strong> {jd.job_summary}
    </p>

    <h3>Key Responsibilities</h3>
    <ul>
      {(jd.key_responsibilities || []).map((r, i) => (
        <li key={i}>{r}</li>
      ))}
    </ul>

    <h3>Required Skills</h3>
    <ul>
      {(jd.required_skills || []).map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ul>

    <h3>Preferred Qualifications</h3>
    <ul>
      {(jd.preferred_qualifications || []).map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>

    <h3>Tools & Technologies</h3>
    <ul>
      {(jd.tools_and_technologies || []).map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>

    <h3>Work Environment</h3>
    <p>{jd.work_environment || "—"}</p>

    <h3>Reporting Structure</h3>
    <p>{jd.reporting_structure || "—"}</p>

    <h3>Impact & Contributions</h3>
    <ul>
      {(jd.impact_and_contributions || []).map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>

    <button
      onClick={approveJD}
      style={{
        marginTop: 15,
        background: "green",
        color: "white",
        padding: "10px 16px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
      }}
    >
      ✅ Approve JD
    </button>
  </div>
);


  // ======================
  // UI
  // ======================
  return (
    <div style={{ maxWidth: 800, margin: "auto" }}>
      <h1>HR AI Job Description Builder</h1>

      <div
        style={{
          height: 500,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 15,
          borderRadius: 10,
          background: "#f6f6f6",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            {msg.sender === "jd" && msg.jdJson ? (
              renderJD(msg.jdJson)
            ) : (
              <div
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                }}
              >
                <span
                  style={{
                    background:
                      msg.sender === "user" ? "#DCF8C6" : "#EAEAEA",
                    padding: "8px 12px",
                    borderRadius: 10,
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
        placeholder="Type your answer..."
        style={{ width: "100%", padding: 10, marginTop: 10 }}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />

      <button
        onClick={sendMessage}
        style={{
          width: "100%",
          marginTop: 6,
          padding: 10,
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: 6,
        }}
      >
        Send
      </button>
    </div>
  );
};

export default Chatpage;
