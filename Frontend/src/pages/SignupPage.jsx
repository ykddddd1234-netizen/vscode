import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupCode, setsignupCode] = useState('');
  const [class_number, setclass_number] = useState('');
  const [unit, setUnit] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL

  const handleSignup = async () => {
    try {
      await axios.post(`${API_URL}/signup`, {
		name,
        email,
        password,
		signupCode,
		unit,
		class_number
      });

      alert('회원가입 성공');
      navigate('/'); // 로그인 페이지로 이동

    } catch (err) {
      alert(err.response?.data?.error || '회원가입 실패');
    }
  };

  return (
		<div className="login-page">

			<div className="login-card">

				{/* Header */}
				<div className="login-header">

					<h1>회원가입</h1>

					<p>
						계정을 생성하고 출타 관리 시스템을 이용하세요.
					</p>

				</div>

				{/* 이름 */}
				<div className="form-group">

					<label>이름</label>

					<input
						type="text"
						placeholder="이름 입력"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>

				</div>

				{/* 이메일 */}
				<div className="form-group">

					<label>이메일</label>

					<input
						type="email"
						placeholder="example@email.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>

				</div>

				{/* 비밀번호 */}
				<div className="form-group">

					<label>비밀번호</label>

					<input
						type="password"
						placeholder="비밀번호 입력"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

				</div>

				{/* 보안코드 */}
				<div className="form-group">

					<label>보안코드</label>

					<input
						type="text"
						placeholder="보안코드 입력"
						value={signupCode}
						onChange={(e) =>
							setsignupCode(e.target.value)
						}
					/>

				</div>

				{/* 기수 */}
				<div className="form-group">

					<label>기수</label>

					<input
						type="text"
						placeholder="예) 1317"
						value={class_number}
						onChange={(e) =>
							setclass_number(e.target.value)
						}
					/>

				</div>

				{/* 소속 */}
				<div className="form-group">

					<label>소속</label>

					<select
						value={unit}
						onChange={(e) => setUnit(e.target.value)}
					>
						<option value="">소속 선택</option>

						<option value="81mm 소대">
							81mm 소대
						</option>

						<option value="중대본부">
							중대본부
						</option>

						<option value="전투지원소대">
							전투지원소대
						</option>

						<option value="비궁">
							비궁
						</option>

					</select>

				</div>

				{/* Buttons */}
				<div className="login-actions">

					<button
						className="signup-btn"
						onClick={() => navigate('/')}
					>
						로그인
					</button>

					<button
						className="login-btn"
						onClick={handleSignup}
					>
						회원가입
					</button>

				</div>

			</div>

		</div>
  );
}

export default SignupPage;
