import '../App.css';
import { useState, useEffect } from 'react';
import { createDispatchOuting } from '../api/outings';
import {getUsers} from '../api/outings';
import {updateUser} from '../api/outings';
import {createUser} from '../api/outings';
import {getPatientCount} from '../api/outings';
import {getDispatchCount} from '../api/outings';
import {getCurrentOutingCount} from '../api/outings';
import {getPendingOutingCount} from '../api/outings';
import {deleteUser} from '../api/outings';

function CompanyManagePage() {

	//To CalendarPage1
	const openAttendanceStatus = () => {
	window.location.href = "/calendar";
	};

	//logout
	const handleLogout = () => {
	localStorage.removeItem("token");
	localStorage.removeItem('user');
	window.location.href = "/";
	};

	//Pending Count
	const [pendingOutingCount, setPendingOutingCount] =
		useState(0)

	const loadPendingOutingCount =
		async () => {

			try {

			const data =
				await getPendingOutingCount()

			setPendingOutingCount(data.count)

			} catch (err) {

			console.error(err)
			}
		}

	//Dispatch Count
	const [dispatchCount, setDispatchCount] =
  		useState(0)

	const loadDispatchCount = async () => {

		try {

			const data =
			await getDispatchCount()

			setDispatchCount(data.count)

		} catch (err) {

			console.error(err)
		}
		}

	//Current Outing Count
	const [currentOutingCount, setCurrentOutingCount] =
		useState(0)

	const loadCurrentOutingCount =
		async () => {

			try {

			const data =
				await getCurrentOutingCount()

			setCurrentOutingCount(data.count)

			} catch (err) {

			console.error(err)
			}
		}

	//Patient Count
	const [patientCount, setPatientCount] =
  		useState(0)

	const loadPatientCount = async () => {

		try {

			const data =
			await getPatientCount()

			setPatientCount(data.count)

		} catch (err) {

			console.error(err)
		}
		}

	//User Fetch
	const [users, setUsers] = useState([])
	const fetchUsers = async () => {

	try {

		const token =
		localStorage.getItem("token")

		if (!token) return

		const res =
		await getUsers(token)

		setUsers(res.data)

	} catch (err) {

		console.error(err)

		alert("중대원 조회 실패")
	}
	}


//First Fetch
useEffect(() => {{
	loadDispatchCount(),
	loadCurrentOutingCount(),
	loadPatientCount(),
	loadPendingOutingCount(),
	fetchUsers()

}}, [])


	//Dispatch Modal
	const [isDispatchOpen, setIsDispatchOpen] =
  useState(false)

	const [dispatchReason, setDispatchReason] =
		useState("")

	const [dispatchStartDate, setDispatchStartDate] =
		useState("")

	const [dispatchEndDate, setDispatchEndDate] =
		useState("")

	const [dispatchMemo, setDispatchMemo] =
		useState("")

	const [dispatchName, setDispatchName] =
  	useState("")

	const handleDispatchSubmit = async () => {

		if (
			!dispatchReason ||
			!dispatchStartDate ||
			!dispatchEndDate ||
			!dispatchMemo
		) {
			alert("모든 항목을 입력해주세요.")
			return
		}

		try {

			await createDispatchOuting({

				name: dispatchName,

				reason: dispatchReason,

				start_date: dispatchStartDate,

				end_date: dispatchEndDate,

				memo: dispatchMemo
			})

			alert("파견 사항이 등록되었습니다.")

			setIsDispatchOpen(false)

			setDispatchName("")
			setDispatchReason("")
			setDispatchStartDate("")
			setDispatchEndDate("")
			setDispatchMemo("")
			loadDispatchCount()

		} catch (err) {

			console.error(err)

			alert("파견 등록 실패")
		}
	}

	//Company Member Management Modal
	const [selectedUser, setSelectedUser] =
  useState(null)

	const openPersonnelModal = async () => {

		try {

			const data = await getUsers()

			setUsers(data)

			setIsPersonnelOpen(true)

		} catch (err) {

			console.error(err)

			alert("중대원 조회 실패")
		}
	}

	//First Modal
	const [isPersonnelOpen, setIsPersonnelOpen] =
  useState(false)

	const openEditModal = (user) => {

		setSelectedUser(user)

		setEditName(user.name)

		setEditUnit(user.unit)

		setEditClassNumber(user.class_number)

		setIsEditUserOpen(true)

		setEditIsPatient(
			user.is_patient
		)

		setEditPatientReason(
			user.patient_reason || ""
		)

	}

	//Delete User
	const handleDeleteUser =
		async (id) => {

			const ok = window.confirm(
			'정말 삭제하시겠습니까?'
			)

			if (!ok) return

			try {

			const token =
				localStorage.getItem("token")

			await deleteUser(token, id)

			fetchUsers()

			} catch (err) {

			console.error(err)

			alert("삭제 실패")
			}
		}


	//Correction Modal
	const [isEditUserOpen, setIsEditUserOpen] =
  useState(false)

	const [editName, setEditName] =
		useState("")

	const [editUnit, setEditUnit] =
		useState("")

	const [editClassNumber, setEditClassNumber] =
		useState("")

	const [editIsPatient, setEditIsPatient] =
		useState("")

	const [editPatientReason,setEditPatientReason ] =
		useState("")

	const handleUpdateUser = async () => {

		if (
			!editName ||
			!editUnit ||
			!editClassNumber ||
			!editIsPatient ||
			!editPatientReason
		) {
			alert("모든 항목을 입력해주세요.")
			return
		}

		try {

			await updateUser({

				id: selectedUser.id,

				name: editName,

				unit: editUnit,

				class_number: editClassNumber,

				is_patient: editIsPatient,

				patient_reason: editPatientReason
			})

			alert("수정 완료")

			setIsEditUserOpen(false)

			setSelectedUser(null)

			openPersonnelModal()

			await loadPatientCount()

		} catch (err) {

			console.error(err)

			alert("수정 실패")
		}
	}

	//Add User Modal
	const [isAddUserOpen, setIsAddUserOpen] =
  useState(false)

	const [newUserName, setNewUserName] =
		useState("")

	const [newUserUnit, setNewUserUnit] =
		useState("")

	const [
		newUserClassNumber,
		setNewUserClassNumber
	] = useState("")

	const resetAddUserForm = () => {

		setNewUserName("")

		setNewUserUnit("")

		setNewUserClassNumber("")

	}

	const handleAddUser = async () => {

		if (
			!newUserName ||
			!newUserUnit ||
			!newUserClassNumber
		) {
			alert("모든 항목을 입력해주세요.")
			return
		}

		try {

			await createUser({

				name: newUserName,

				unit: newUserUnit,

				class_number: newUserClassNumber
			})

			alert("전입신병 추가 완료")

			setIsAddUserOpen(false)

			resetAddUserForm()

			openPersonnelModal()

		} catch (err) {

			console.error(err)

			alert("추가 실패")
		}
	}

	//Page Change
	const openCompanyRoster = () => {
	window.location.href = "/company-roster";
	};

	const openOutingRoster= () => {
	window.location.href = "/outing-roster";
	};

	const openScheduleManage= () => {
	window.location.href = "/outing-manage";
	};

	const openGuardRoom= () => {
	window.location.href = "/guardroom";
	};


  return (

    <div className="manage-page">

      {/* Header */}
      <div className="top-bar">

        <div>
          <h1>중대 관리</h1>

          <p>
            병력 현황 및 행정 업무를 관리하세요.
          </p>
        </div>

        <div className="top-actions">

          <button onClick = {openAttendanceStatus}>
            출타 현황
          </button>

          <button onClick = {handleLogout}>
            로그아웃
          </button>

        </div>

      </div>

      {/* Top Summary Cards */}
      <div className="summary-grid">

		<div className="summary-card">

		<h3>출타 승인 대기</h3>

		<strong>
			{pendingOutingCount}건
		</strong>

		</div>

		<div className="summary-card">

		<h3>
			현재 출타
			(휴가, 외출, 면회외박, 외진)
		</h3>

		<strong>
			{currentOutingCount}명
		</strong>

		</div>

		<div className="summary-card">

		<h3>파견 인원</h3>

		<strong>
			{dispatchCount}명
		</strong>

		</div>

		<div className="summary-card">

		<h3>환자</h3>

		<strong>
			{patientCount}명
		</strong>

		</div>

      </div>

      {/* Main Menu */}
      <div className="manage-grid">

        {/* 병력 관리 */}
        <div className="manage-card">

          <div className="manage-card-header">
            <h2>병력 관리</h2>
            <p>중대원 신상 및 상태 관리</p>
          </div>

          <div className="manage-menu-list">

{/* Company Member Management */}
<button onClick={openPersonnelModal}>
  중대원 신상 관리
</button>

{/* 중대원 관리 모달 */}
{isPersonnelOpen && (

  <div
    className="modal"
    onClick={() => {

      setIsPersonnelOpen(false)

    }}
  >

    <div
      className="modal-content personnel-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <div className="personnel-header">

        <h3>중대원 신상 관리</h3>

        <button
          onClick={() => setIsAddUserOpen(true)}
        >
          전입신병 추가
        </button>

      </div>

      <div className="personnel-list">

        {users.map((user) => (

		<div
			key={user.id}
			className="personnel-item soldier-card"
			onClick={() => openEditModal(user)}
		>

			<button
			className="delete-user-btn"

			onClick={(e) => {

				e.stopPropagation()

				handleDeleteUser(user.id)

			}}
			>
			×
			</button>

			<div>
			<strong>{user.name}</strong>
			</div>

			<div className="personnel-info">

			<span>{user.unit}</span>

			<span>
				{user.class_number}기
			</span>

			{Number(user.is_patient) === 1 && (
				<>
				<span className="patient-badge">
					환자
				</span>

				<span className="patient-reason">
					{user.patient_reason}
				</span>
				</>
			)}

    </div>

  </div>

))}

      </div>

    </div>

  </div>

)}

{/* 수정 모달 */}
{isEditUserOpen && selectedUser && (

  <div
    className="modal"
    onClick={() => {

      setIsEditUserOpen(false)

      setSelectedUser(null)

    }}
  >

    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
    >

      <h3>중대원 정보 수정</h3>

      <div className="form-group">

        <label>이름</label>

        <input
          value={editName}
          onChange={(e) =>
            setEditName(e.target.value)
          }
        />

      </div>

      <div className="form-group">

        <label>소속</label>

        <select
          value={editUnit}
          onChange={(e) =>
            setEditUnit(e.target.value)
          }
        >
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

      <div className="form-group">

        <label>기수</label>

        <input
          type="number"
          value={editClassNumber}
          onChange={(e) =>
            setEditClassNumber(e.target.value)
          }
        />

      </div>

	  <div className="form-group">

		<label>환자 상태</label>

		<select
			value={editIsPatient}
			onChange={(e) =>
			setEditIsPatient(e.target.value)
			}
		>

			<option value="0">
			정상
			</option>

			<option value="1">
			환자
			</option>

		</select>

		</div>

		{Number(editIsPatient) === 1 && (

			<div className="form-group">

				<label>환자 사유</label>

				<input
				value={editPatientReason}
				onChange={(e) =>
					setEditPatientReason(e.target.value)
				}
				/>

			</div>

			)}

      <div className="modal-actions">

        <button onClick={handleUpdateUser}>
          저장
        </button>

        <button
          onClick={() => {

            setIsEditUserOpen(false)

            setSelectedUser(null)

          }}
        >
          닫기
        </button>

      </div>

    </div>

  </div>

)}

{/* 전입신병 추가 모달 */}
{isAddUserOpen && (

  <div
    className="modal"
    onClick={() => {

      setIsAddUserOpen(false)

      resetAddUserForm()

    }}
  >

    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
    >

      <h3>전입신병 추가</h3>

      <div className="form-group">

        <label>이름</label>

        <input
          value={newUserName}
          onChange={(e) =>
            setNewUserName(e.target.value)
          }
        />

      </div>

      <div className="form-group">

        <label>소속</label>

        <select
          value={newUserUnit}
          onChange={(e) =>
            setNewUserUnit(e.target.value)
          }
        >
          <option value="">
            선택
          </option>

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

      <div className="form-group">

        <label>기수</label>

        <input
          type="number"
          value={newUserClassNumber}
          onChange={(e) =>
            setNewUserClassNumber(e.target.value)
          }
        />

      </div>

      <div className="modal-actions">

        <button onClick={handleAddUser}>
          추가
        </button>

        <button
          onClick={() => {

            setIsAddUserOpen(false)

            resetAddUserForm()

          }}
        >
          닫기
        </button>

      </div>

    </div>

  </div>

)}

						{/*dispatch*/}
            <button onClick={() => setIsDispatchOpen(true)}>
							파견 사항 등록
						</button>

						{isDispatchOpen && (

							<div
								className="modal"
								onClick={() => setIsDispatchOpen(false)}
							>

								<div
									className="modal-content"
									onClick={(e) => e.stopPropagation()}
								>

									<h3>파견 사항 등록</h3>

									<div className="form-group">

										<label>이름</label>

										<input
											type="text"
											placeholder="이름 입력"
											value={dispatchName}
											onChange={(e) =>
												setDispatchName(e.target.value)
											}
										/>

									</div>

									<div className="form-group">

										<label>파견 사유</label>

										<input
											type="text"
											placeholder="파견 사유 입력"
											value={dispatchReason}
											onChange={(e) =>
												setDispatchReason(e.target.value)
											}
										/>

									</div>

									<div className="form-group">

										<label>파견 시작일</label>

										<input
											type="date"
											value={dispatchStartDate}
											onChange={(e) =>
												setDispatchStartDate(e.target.value)
											}
										/>

									</div>

									<div className="form-group">

										<label>파견 종료일</label>

										<input
											type="date"
											value={dispatchEndDate}
											onChange={(e) =>
												setDispatchEndDate(e.target.value)
											}
										/>

									</div>

									<div className="form-group">

										<label>메모</label>

										<textarea
											placeholder="추가 메모"
											value={dispatchMemo}
											onChange={(e) =>
												setDispatchMemo(e.target.value)
											}
										/>

									</div>

									<div className="modal-actions">

										<button onClick={handleDispatchSubmit}>
											저장
										</button>

										<button
											onClick={() => setIsDispatchOpen(false)}
										>
											닫기
										</button>

									</div>

								</div>

							</div>

						)}

          </div>

        </div>

        {/* 문서 출력 */}
        <div className="manage-card">

          <div className="manage-card-header">
            <h2>문서 출력</h2>
            <p>승인된 출타 기준 문서 생성</p>
          </div>

          <div className="manage-menu-list">

            <button onClick = {openCompanyRoster}>
              총원 명부 출력
            </button>

            <button onClick = {openOutingRoster}>
              외출 내역 출력
            </button>

            <button onClick = {openGuardRoom}>
              위병소 근무표 출력
            </button>

          </div>

        </div>

        {/* 출타 승인 */}
        <div className="manage-card full-width">

          <div className="manage-card-header">
            <h2>출타 관리</h2>
            <p>출타 내역 조회 및 승인/반려</p>
          </div>

          <div className="manage-menu-list">

            <button onClick = {openScheduleManage}>
              출타 조회 및 승인 페이지 이동
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}

export default CompanyManagePage;
