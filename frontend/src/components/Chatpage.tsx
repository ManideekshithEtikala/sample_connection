import { useState, useRef, useEffect } from "react";
import axios from "axios";

type Sender = "agent" | "user" | "jd";

interface Project {
  project_name: string;
  description: string;
  technologies_used: string[];
  role: string;
  duration: string;
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
  projects?: Project[];
}

interface Message {
  sender: Sender;
  text?: string;
  jdJson?: JDJson;
}

interface QA {
  field: string;
  answer: any;
}

export default function Chatpage() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "agent", text: "Hi! Let's build your Job Description." }
  ]);

  const [input, setInput] = useState("");
  const [qaList, setQaList] = useState<QA[]>([]);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [inputType, setInputType] = useState<"string" | "array">("string");
  const [loading, setLoading] = useState(false);
  const [generatedJD, setGeneratedJD] = useState<JDJson | null>(null);

  const employeeId =
    localStorage.getItem("employeeId") ??
    (() => {
      const id = crypto.randomUUID();
      localStorage.setItem("employeeId", id);
      return id;
    })();

  const jdSessionId =
    localStorage.getItem("jdSessionId") ??
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
    if (!input.trim() || loading) return;

    setMessages(prev => [...prev, { sender: "user", text: input }]);

    let parsed: any = input;

    if (inputType === "array") {
      parsed = input.split(",").map(v => v.trim()).filter(Boolean);
    }

    const updatedQA =
      currentField !== null
        ? [...qaList, { field: currentField, answer: parsed }]
        : qaList;

    setQaList(updatedQA);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `https://sample-connection.onrender.com/agent/chat/${employeeId}/${jdSessionId}`,
        { qa: updatedQA }
      );

      const data = res.data;

      if (data.type === "question") {
        setCurrentField(data.field);
        setInputType(data.input_type);

        setMessages(prev => [
          ...prev,
          { sender: "agent", text: data.question }
        ]);
      }

      if (data.type === "job_description") {
        setGeneratedJD(data.jd_json);

        setMessages(prev => [
          ...prev,
          { sender: "agent", text: "✅ Job Description Generated" },
          { sender: "jd", jdJson: data.jd_json }
        ]);
      }

    } catch {
      setMessages(prev => [
        ...prev,
        { sender: "agent", text: "❌ Backend error" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // APPROVE JD
  // ======================
  const approveJD = async () => {
    if (!generatedJD) return;

    try {
      await axios.post(
        `https://sample-connection.onrender.com/agent/approve/${employeeId}/${jdSessionId}`
      );

      setMessages(prev => [
        ...prev,
        { sender: "agent", text: "✅ JD approved and saved successfully." }
      ]);

      // reset for next JD
      localStorage.setItem("jdSessionId", crypto.randomUUID());
      setQaList([]);
      setGeneratedJD(null);
      setCurrentField(null);

    } catch {
      setMessages(prev => [
        ...prev,
        { sender: "agent", text: "❌ Approval failed." }
      ]);
    }
  };

  // ======================
  // UI
  // ======================
  return (
    <div style={{ maxWidth: 800, margin: "30px auto" }}>
      <h2 style={{ textAlign: "center" }}>AI Job Description Builder</h2>

      <div style={{ height: 520, overflowY: "auto", background: "#f5f5f5", padding: 15 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10, textAlign: m.sender === "user" ? "right" : "left" }}>
            {m.sender === "jd" && m.jdJson ? (
              <div>
                <pre>{JSON.stringify(m.jdJson, null, 2)}</pre>

                <button
                  onClick={approveJD}
                  style={{
                    marginTop: 10,
                    background: "green",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  ✅ Approve JD
                </button>
              </div>
            ) : (
              <span>{m.text}</span>
            )}
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type here..."
          style={{ flex: 1, padding: 10 }}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
