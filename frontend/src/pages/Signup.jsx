import { useState } from 'react';
import api from '../api';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', is_mentor: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post('/signup', form);
    alert(`User ${res.data.name} registered successfully!`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" type="email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <label>
        <input type="checkbox" onChange={e => setForm({ ...form, is_mentor: e.target.checked })} />
        I am a mentor
      </label>
      <button type="submit">Signup</button>
    </form>
  );
}
