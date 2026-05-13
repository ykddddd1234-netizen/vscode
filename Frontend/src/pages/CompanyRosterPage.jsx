import '../App.css';
import { useState, useEffect } from 'react';
import { getCompanyRoster } from '../api/outings';

function CompanyRosterPage() {
	const [users, setUsers] =
  		useState([])

	const [summary, setSummary] =
  		useState(null)

	const [selectedDate, setSelectedDate] =
		useState(
			new Date()
			.toISOString()
			.split("T")[0]
		)

	const fetchCompanyRoster =
		async () => {

			try {

			const token =
				localStorage.getItem("token")

			if (!token) return

			const data =
				await getCompanyRoster(token, selectedDate)

			setUsers(data.users)
			setSummary(data.summary)

			} catch (err) {

			console.error(err)

			alert("총원 명부 조회 실패")
			}
		}

	//Fetch
	useEffect(() => {

	fetchCompanyRoster()

	}, [selectedDate])

	//Page Change
	const openCompanyManagePage = () => {
	window.location.href = "/CompanyManagePage";
	};

	const handleLogout = () => {
	localStorage.removeItem("token");
	localStorage.removeItem('user');
	window.location.href = "/";
	};


  return (

    <div className="roster-page">

      {/* Header */}
      <div className="top-bar">

        <div>

          <h1>총원 명부</h1>

          <p>
            중대 총원 현황을 확인하세요.
          </p>

        </div>

        <div className="top-actions">

          <button onClick = {openCompanyManagePage}>
            처음으로
          </button>

          <button onClick = {handleLogout}>
            로그아웃
          </button>

        </div>

      </div>

      {/* Date Select */}
		<div className="roster-date-section">

		<label>
			기준 일자
		</label>

		<input
			type="date"

			value={selectedDate}

			onChange={(e) =>
			setSelectedDate(
				e.target.value
			)
			}
		/>

		</div>

		{/* Summary */}
	  <div className="roster-summary">

		<div className="summary-card">

			<h3>총원</h3>

			<strong>
			{summary?.total}
			</strong>

		</div>

		<div className="summary-card">

			<h3>현재원</h3>

			<strong>
			{summary?.current}
			</strong>

		</div>

		<div className="summary-card">

			<h3>부재</h3>

			<strong>
			{summary?.absent}
			</strong>

		</div>

		<div className="summary-card absent">

			<h3>휴가</h3>

			<strong>
			{summary?.vacation}
			</strong>

		</div>

		<div className="summary-card absent">

			<h3>면회외박</h3>

			<strong>
			{summary?.visitStay}
			</strong>

		</div>

		<div className="summary-card absent">

			<h3>외진</h3>

			<strong>
			{summary?.hospital}
			</strong>

		</div>

		<div className="summary-card absent">

			<h3>파견</h3>

			<strong>
			{summary?.dispatch}
			</strong>

		</div>

	  </div>

      {/* Table */}
      <div className="roster-table-wrapper">

        <table className="roster-table">

          <thead>

            <tr>

              <th>이름</th>

              <th>소속</th>

              <th>기수</th>

              <th>상태</th>

            </tr>

          </thead>

          <tbody>

			{users.map((user) => (

				<tr key={user.id}>

				<td>{user.name}</td>

				<td>{user.unit}</td>

				<td>
					{user.class_number}기
				</td>

				<td>{user.status}</td>

				</tr>

			))}

          </tbody>

        </table>

      </div>

      {/* Bottom Button */}
      <div className="roster-bottom">

        <button className="print-btn">

          총원 명부 출력

        </button>

      </div>

    </div>
  )
}

export default CompanyRosterPage
