import { useState } from 'react'

const App= () =>{
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  // const AppUrl = "https://sample-connection.onrender.com"
  const handleSubmit = () => {
    fetch("http://127.0.0.1:8000/employee", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: name,
    age: parseInt(age),
    gender: gender,
  })
});

  }

  return (
    <div className="app-container">
      <h1>User Data</h1>
      <form className="user-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Age
          <input type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} required />
        </label>

        <label>
          Gender
          <select value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default App
