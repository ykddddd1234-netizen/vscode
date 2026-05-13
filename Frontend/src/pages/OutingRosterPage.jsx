import '../App.css';
import { useState, useEffect, Fragment } from 'react';
import { getOutingRoster } from '../api/outings';

function OutingRosterPage() {

  const [groups, setGroups] =
    useState([])

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    )

  const fetchOutingRoster =
    async () => {

      try {

        const token =
          localStorage.getItem("token")

        if (!token) return

        const data =
          await getOutingRoster(
            token,
            selectedDate
          )

        setGroups(data)

      } catch (err) {

        console.error(err)

        alert("외출 명부 조회 실패")
      }
    }

  // Fetch
  useEffect(() => {

    fetchOutingRoster()

  }, [selectedDate])

  // Page Change
  const openCompanyManagePage = () => {

    window.location.href =
      "/CompanyManagePage";
  };

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "/";
  };

	//Modal
	const [selectedMember, setSelectedMember] =
  	useState(null)

  return (

    <div className="roster-page">

      {/* Header */}
      <div className="top-bar">

        <div>

          <h1>외출 내역</h1>

          <p>
            기준 일자 외출 현황을 확인하세요.
          </p>

        </div>

        <div className="top-actions">

          <button
            onClick={
              openCompanyManagePage
            }
          >
            처음으로
          </button>

          <button
            onClick={handleLogout}
          >
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

      {/* Table */}
      <div className="roster-table-wrapper">

        <table className="roster-table">

          <thead>

            <tr>

              <th>이름</th>

              <th>소속</th>

              <th>출발/복귀 수단</th>

              <th>출타 종류</th>

            </tr>

          </thead>

					<tbody>

						{groups.map((group) => (

							<Fragment
								key={group.outing_id}
							>

								{group.members.map(
									(member, index) => (

									<tr

										key={
											`${group.outing_id}-${index}`
										}

										className="clickable-row"

										onClick={() =>
											setSelectedMember(member)
										}
									>

										<td>
											{member.name}
										</td>

										<td>
											{member.unit}
										</td>

										<td>
											{member.transport}
										</td>

										<td>
											{member.reason}
										</td>

									</tr>

								))}

								<tr className="outing-divider">

									<td colSpan="4"></td>

								</tr>

							</Fragment>

						))}

					</tbody>

        </table>

      </div>

      {/* Bottom Button */}
      <div className="roster-bottom">

        <button className="print-btn">

          외출 명부 출력

        </button>

      </div>



			{/*Modal*/}
			{selectedMember && (

				<div className="modal-overlay">

					<div className="schedule-modal">

						<h2>외출 일정</h2>

						<p>
							{selectedMember.schedule}
						</p>

						<button
							onClick={() =>
								setSelectedMember(null)
							}
						>
							닫기
						</button>

					</div>

				</div>

			)}

    </div>
  )
}

export default OutingRosterPage
