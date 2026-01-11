import { useState } from 'react'
import axios from 'axios'

const App = () => {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')

  // async submit using axios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await axios.post('https://sample-connection.onrender.com/employee', {
        name: name,
        age: parseInt(age || '0'),
        Gender: gender,
      })

      setName('')
      setAge('')
      setGender('')
    } catch (err) {
      console.error(err)

    }
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
