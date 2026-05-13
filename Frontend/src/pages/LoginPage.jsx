import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import '../App.css';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const API_URL = import.meta.env.VITE_API_URL

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, {
        email,
        password
      });

      // Download Token
      localStorage.setItem('token', res.data.token);
			localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('로그인 성공');
      navigate('/calendar');

    } catch (err) {
       console.error(err.response?.data || err.message);
	   alert(err.response?.data?.error || '로그인 실패');
    }
  };

  return (
	<div className="login-page">

		<div className="login-card">

			{/* Header */}
			<div className="login-header">

				<h1>출타 관리 시스템</h1>

				<p>
					계정 정보를 입력하여 로그인하세요.
				</p>

			</div>

			{/* Email */}
			<div className="form-group">

				<label>이메일</label>

				<input
					type="email"
					placeholder="example@email.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

			</div>

			{/* Password */}
			<div className="form-group">

				<label>비밀번호</label>

				<input
					type="password"
					placeholder="비밀번호 입력"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>

			</div>

			{/* Buttons */}
			<div className="login-actions">

				<button
					className="signup-btn"
					onClick={() => navigate('/signup')}
				>
					회원가입
				</button>

				<button
					className="login-btn"
					onClick={handleLogin}
				>
					로그인
				</button>

			</div>

		</div>

	</div>
  );
}

export default LoginPage;
