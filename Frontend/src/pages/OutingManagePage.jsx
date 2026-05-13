import '../App.css';
import { useState, useEffect } from 'react';

import {

  getDispatchList,
  deleteDispatch,

  getPendingOutings,

  searchOutings,

  updateOutingStat,

  updateOuting,

  deleteOuting

} from '../api/outings';

function OutingManagePage() {

  // ========================
  // State
  // ========================

  const [dispatches, setDispatches] =
    useState([])

  const [pendingOutings, setPendingOutings] =
    useState([])

  const [searchName, setSearchName] =
    useState("")

  const [searchResults, setSearchResults] =
    useState([])

	const [selectedDispatch, setSelectedDispatch] =
  useState(null)

	const [selectedPendingOuting, setSelectedPendingOuting] =
		useState(null)

	const [selectedSearchOuting, setSelectedSearchOuting] =
		useState(null)

	const [isDispatchModalOpen, setIsDispatchModalOpen] =
		useState(false)

	const [isPendingModalOpen, setIsPendingModalOpen] =
		useState(false)

	const [isSearchModalOpen, setIsSearchModalOpen] =
		useState(false)

	// ========================
	// Edit
	// ========================

	const [editingOutingId, setEditingOutingId] =
	useState(null)


	// ========================
	// Modal
	// ========================

	const [isOpen, setIsOpen] =
	useState(false)


	// ========================
	// Common Form
	// ========================

	const [reason, setReason] =
	useState('')

	const [transport, setTransport] =
	useState('')

	const [notes, setNotes] =
	useState('')


	// ========================
	// Vacation Form
	// ========================

	const [regular, setRegular] =
	useState('')

	const [reward, setReward] =
	useState('')

	const [compensation, setCompensation] =
	useState('')

	const [contact1, setContact1] =
	useState('')

	const [contact2, setContact2] =
	useState('')

	const [lastOutingStart, setLastOutingStart] =
	useState('')

	const [lastOutingEnd, setLastOutingEnd] =
	useState('')


	// ========================
	// Outing Form
	// ========================

	const [members, setMembers] =
	useState([''])

	const [schedule, setSchedule] =
	useState('')

	// ========================
	// Reset Form
	// ========================

	const resetForm = () => {

	setReason('')

	setTransport('')

	setNotes('')

	setRegular('')

	setReward('')

	setCompensation('')

	setContact1('')

	setContact2('')

	setLastOutingStart('')

	setLastOutingEnd('')

	setMembers([''])

	setSchedule('')

	setEditingOutingId(null)
	}


	// ========================
	// Add Members
	// ========================

	const handleMemberChange =
	(index, value) => {

		const updated =
		[...members]

		updated[index] =
		value

		setMembers(updated)
	}


	// ========================
	// Remove Members
	// ========================

	const handleRemove =
	(index) => {

		if (members.length === 1)
		return

		const updated =
		members.filter(
			(_, i) => i !== index
		)

		setMembers(updated)
	}
  // ========================
  //Modal Functions
  // ========================

 const handleEdit =
  () => {

    const outing =
      selectedSearchOuting

    // 수정 대상 저장
    setEditingOutingId(
      outing.id
    )

    // 공통
    setReason(
      outing.reason
    )

    // ========================
    // 휴가
    // ========================

	if (outing.reason === '휴가') {

	setTransport(
		outing.leave_transport || ''
	)

	// ========================
	// detail parsing
	// ========================

	const detail =
		outing.detail || ''

	const regularMatch =
		detail.match(
		/정기:\s*(.*?)\s*\/ 포상:/
		)

	const rewardMatch =
		detail.match(
		/포상:\s*(.*?)\s*\/ 위로\/보상:/
		)

	const compensationMatch =
		detail.match(
		/위로\/보상:\s*(.*)/
		)

	setRegular(
		regularMatch?.[1] || ''
	)

	setReward(
		rewardMatch?.[1] || ''
	)

	setCompensation(
		compensationMatch?.[1] || ''
	)

	// ========================
	// contact parsing
	// ========================

	const contact =
		outing.contact || ''

	const parentMatch =
		contact.match(
		/부 또는 모:\s*(.*?)\s*\/ 본인:/
		)

	const selfMatch =
		contact.match(
		/본인:\s*(.*)/
		)

	setContact1(
		parentMatch?.[1] || ''
	)

	setContact2(
		selfMatch?.[1] || ''
	)

	// ========================
	// date
	// ========================

	setLastOutingStart(
		outing.last_outing_start_date || ''
	)

	setLastOutingEnd(
		outing.last_outing_end_date || ''
	)
	}

    // ========================
    // 외출
    // ========================

    if (outing.reason === '외출') {

      setTransport(
        outing.outing_transport || ''
      )

      setSchedule(
        outing.schedule || ''
      )

      setMembers(

        outing.members

          ? outing.members.split(',')

          : ['']
      )
    }

    // ========================
    // 외진 / 면회외박
    // ========================

    if (
      outing.reason === '외진'
      ||
      outing.reason === '면회외박'
    ) {

      setNotes(
        outing.notes || ''
      )
    }

    // 상세 모달 닫기
    setIsSearchModalOpen(false)

    // 수정 모달 열기
    setIsOpen(true)
 }

 const handleSubmit =
  async () => {

    // ========================
    // 휴가 검사
    // ========================

    if (reason === '휴가') {

      if (!transport) {

        alert('복귀 수단 입력하세요')

        return
      }

      if (
        !regular
        &&
        !reward
        &&
        !compensation
      ) {

        alert('휴가 내용을 입력하세요')

        return
      }

      if (!contact1 || !contact2) {

        alert('비상 연락망 입력하세요')

        return
      }

      if (
        !lastOutingStart
        ||
        !lastOutingEnd
      ) {

        alert('최근 출타 기간 입력하세요')

        return
      }

      if (
        lastOutingStart >
        lastOutingEnd
      ) {

        alert('날짜 범위가 잘못됨')

        return
      }
    }


    // ========================
    // 외출 검사
    // ========================

    if (reason === '외출') {

      const hasEmptyMember =
        members.some(
          m => !m.trim()
        )

      if (hasEmptyMember) {

        alert('외출자 명단 입력하세요')

        return
      }

      if (!transport) {

        alert('출발/복귀 수단 선택하세요')

        return
      }

      if (!schedule) {

        alert('일정 입력하세요')

        return
      }
    }


    // ========================
    // 면회외박 / 외진
    // ========================

    if (
      reason === '면회외박'
      ||
      reason === '외진'
    ) {

      if (!notes) {

        alert('보고 사항 입력하세요')

        return
      }
    }


    try {

      const token =
        localStorage.getItem('token')

      if (!token) {

        alert('로그인 필요')

        return
      }

      const detail =

        `정기: ${regular || ''}
         / 포상: ${reward || ''}
         / 위로/보상: ${compensation || ''}`

      const contact =

        `부 또는 모: ${contact1 || ''}
         / 본인: ${contact2 || ''}`

      const outingData = {

		start_date:
			selectedSearchOuting.start_date,

		end_date:
			selectedSearchOuting.end_date,

        reason,

        transport,

        detail,

        contact,

        schedule,

        notes,

        members,

        lastOutingStart,

        lastOutingEnd
      }

      await updateOuting(

        token,

        editingOutingId,

        outingData
      )

      alert('수정 완료')

      setIsOpen(false)

      resetForm()

      fetchPageData()

	  await handleSearch()

    } catch (err) {

		console.error(err)

		const data =
			err.response?.data

		if (
			data?.duplicated?.length > 0
		) {

			alert(

			`이미 외출 신청된 인원:
			${data.duplicated.join(', ')}`
			)

		} else {

			alert(
			data?.error || '수정 실패'
			)
		}
	}
 }

 const handleDelete =
  async (id) => {

    try {

      const token =
        localStorage.getItem('token')

      if (!token) {

        alert('로그인이 필요합니다')

        return
      }

      const confirmed =
        window.confirm(
          '정말 삭제하시겠습니까?'
        )

      if (!confirmed) return

      await deleteOuting(
        token,
        id
      )

      alert('삭제 완료')

      // 상세 모달 닫기
      setIsSearchModalOpen(false)

      // 수정 모달 닫기
      setIsOpen(false)

      // 선택 초기화
      setSelectedSearchOuting(null)

      // 수정 상태 초기화
      setEditingOutingId(null)

      // 폼 초기화
      resetForm()

      // 목록 새로고침
      fetchPageData()

    } catch (err) {

      console.error(err)

      alert('삭제 실패')
    }
 }


  // ========================
  // Fetch
  // ========================

  const fetchPageData =
    async () => {

      try {

        const token =
          localStorage.getItem("token")

        if (!token) return

        const dispatchData =
          await getDispatchList(token)

        const pendingData =
          await getPendingOutings(token)

        setDispatches(dispatchData)

        setPendingOutings(pendingData)

      } catch (err) {

        console.error(err)

        alert("조회 실패")
      }
    }

  useEffect(() => {

    fetchPageData()

  }, [])


  // ========================
  // Dispatch Delete
  // ========================

  const handleDeleteDispatch =
    async (id) => {

      try {

        const token =
          localStorage.getItem("token")

        await deleteDispatch(
          token,
          id
        )

      	setIsDispatchModalOpen(false)

      	setSelectedDispatch(null)

        fetchPageData()

      } catch (err) {

        console.error(err)

        alert("삭제 실패")
      }
    }


  // ========================
  // Search
  // ========================

  const handleSearch =
    async () => {

      try {

        const token =
          localStorage.getItem("token")

        const data =
          await searchOutings(
            token,
            searchName
          )

        setSearchResults(data)

      } catch (err) {

        console.error(err)

        alert("검색 실패")
      }
    }

	// ========================
  // Status Change
  // ========================
	const handleStatusChange =
		async (
			id,
			status
		) => {

			try {

				const token =
					localStorage.getItem("token")

				await updateOutingStat(

					token,

					id,

					status
				)

				setIsPendingModalOpen(false)

				setSelectedPendingOuting(null)

				fetchPageData()

			} catch (err) {

				console.error(err)

				alert("상태 변경 실패")
			}
		}

  // ========================
  // Page Change
  // ========================

  const openCompanyManagePage = () => {

    window.location.href =
      "/CompanyManagePage"
  }

  const handleLogout = () => {

    localStorage.removeItem("token")

    localStorage.removeItem("user")

    window.location.href = "/"
  }


  return (

    <div className="roster-page">

      {/* Header */}
      <div className="top-bar">

        <div>

          <h1>
            출타 조회 및 승인
          </h1>

          <p>
            파견 및 출타 현황을 관리하세요.
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


      {/* ========================
          Dispatch Section
      ======================== */}

      <div className="manage-section">

        <h2>
          파견 사항
        </h2>

        <table className="roster-table">

          <thead>

            <tr>

              <th>이름</th>

              <th>사유</th>

              <th>시작일</th>

              <th>종료일</th>

              <th>관리</th>

            </tr>

          </thead>

          <tbody>

            {dispatches.map((item) => (

              <tr
								key={item.id}

								onClick={() => {

									setSelectedDispatch(item)

									setIsDispatchModalOpen(true)
								}}
							>

                <td>{item.name}</td>

                <td>{item.reason}</td>

                <td>{item.start_date}</td>

                <td>{item.end_date}</td>

                <td>

                  <button
                    className="delete-btn"

                    onClick={() =>
                      handleDeleteDispatch(item.id)
                    }
                  >
                    삭제
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* ========================
          Pending Outings
      ======================== */}

      <div className="manage-section">

        <h2>
          승인 대기 출타
        </h2>

        <table className="roster-table">

          <thead>

            <tr>

              <th>이름</th>

              <th>출타 종류</th>

              <th>시작일</th>

              <th>종료일</th>

            </tr>

          </thead>

          <tbody>

            {pendingOutings.map((item) => (

              <tr
								key={item.id}

								onClick={() => {

									setSelectedPendingOuting(item)

									setIsPendingModalOpen(true)
								}}
							>

                <td>{item.name}</td>

                <td>{item.reason}</td>

                <td>{item.start_date}</td>

                <td>{item.end_date}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* ========================
          Search
      ======================== */}

      <div className="manage-section">

        <h2>
          출타 조회
        </h2>

        <div className="search-bar">

          <input
            type="text"

            placeholder="이름 입력"

            value={searchName}

            onChange={(e) =>
              setSearchName(
                e.target.value
              )
            }
          />

          <button
            onClick={handleSearch}
          >
            조회
          </button>

        </div>

        <table className="roster-table">

          <thead>

            <tr>

              <th>이름</th>

              <th>출타 종류</th>

              <th>시작일</th>

              <th>종료일</th>

              <th>상태</th>

            </tr>

          </thead>

          <tbody>

            {searchResults.map((item) => (

              <tr
								key={item.id}

								onClick={() => {

									setSelectedSearchOuting(item)

									setIsSearchModalOpen(true)
								}}
							>

                <td>{item.name}</td>

                <td>{item.reason}</td>

                <td>{item.start_date}</td>

                <td>{item.end_date}</td>

                <td>{item.status}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

			{/*DispatchModal*/}
			{isDispatchModalOpen && selectedDispatch && (

				<div
					className="modal"

					onClick={() =>
						setIsDispatchModalOpen(false)
					}
				>

					<div
						className="modal-content"

						onClick={(e) =>
							e.stopPropagation()
						}
					>

						<div className="detail-header">

							<div>

								<h2>
									파견 상세
								</h2>

								<p className="detail-subtitle">
									파견 정보를 확인하세요.
								</p>

							</div>

							<button
								className="close-btn"

								onClick={() =>
									setIsDispatchModalOpen(false)
								}
							>
								✕
							</button>

						</div>

						<div className="detail-grid">

							<div className="detail-item">

								<span>이름</span>

								<strong>
									{selectedDispatch.name}
								</strong>

							</div>

							<div className="detail-item">

								<span>사유</span>

								<strong>
									{selectedDispatch.reason}
								</strong>

							</div>

							<div className="detail-item">

								<span>시작일</span>

								<strong>
									{selectedDispatch.start_date}
								</strong>

							</div>

							<div className="detail-item">

								<span>종료일</span>

								<strong>
									{selectedDispatch.end_date}
								</strong>

							</div>

							<div className="detail-item">

								<span>추가 메모</span>

								<strong>
									{selectedDispatch.memo || '-'}
								</strong>

							</div>

						</div>

						<div className="modal-actions">

							<button
								className="delete-btn"

								onClick={() =>
									handleDeleteDispatch(
										selectedDispatch.id
									)
								}
							>
								삭제
							</button>

						</div>

					</div>

				</div>

			)}

			{/*PendingModal*/}
			{isPendingModalOpen && selectedPendingOuting && (

				<div
					className="modal"

					onClick={() =>
						setIsPendingModalOpen(false)
					}
				>

					<div
						className="modal-content"

						onClick={(e) =>
							e.stopPropagation()
						}
					>

						<div className="detail-header">

							<div>

								<h2>
									출타 상세
								</h2>

								<p className="detail-subtitle">
									승인 대기 출타입니다.
								</p>

							</div>

							<button
								className="close-btn"

								onClick={() =>
									setIsPendingModalOpen(false)
								}
							>
								✕
							</button>

						</div>

						<div className="detail-grid">

							<div className="detail-grid">

								{/* 공통 */}
								<div className="detail-item">

									<span>이름</span>

									<strong>
										{selectedPendingOuting.name}
									</strong>

								</div>

								<div className="detail-item">

									<span>출타 종류</span>

									<strong>
										{selectedPendingOuting.reason}
									</strong>

								</div>

								<div className="detail-item">

									<span>시작일</span>

									<strong>
										{selectedPendingOuting.start_date}
									</strong>

								</div>

								<div className="detail-item">

									<span>종료일</span>

									<strong>
										{selectedPendingOuting.end_date}
									</strong>

								</div>


								{/* ========================
										휴가
								======================== */}

								{selectedPendingOuting.reason === '휴가' && (

									<>

										<div className="detail-item">

											<span>복귀수단</span>

											<strong>
												{selectedPendingOuting.leave_transport}
											</strong>

										</div>

										<div className="detail-item">

											<span>내용</span>

											<strong>
												{selectedPendingOuting.detail}
											</strong>

										</div>

										<div className="detail-item">

											<span>비상 연락망</span>

											<strong>
												{selectedPendingOuting.contact}
											</strong>

										</div>

										<div className="detail-item">

											<span>최근 출타 시작일</span>

											<strong>
												{selectedPendingOuting.last_outing_start_date || '-'}
											</strong>

										</div>

										<div className="detail-item">

											<span>최근 출타 종료일</span>

											<strong>
												{selectedPendingOuting.last_outing_end_date || '-'}
											</strong>

										</div>

									</>

								)}


								{/* ========================
										외출
								======================== */}

								{selectedPendingOuting.reason === '외출' && (

									<>

										<div className="detail-item">

											<span>출발/복귀 수단</span>

											<strong>
												{selectedPendingOuting.outing_transport}
											</strong>

										</div>

										<div className="detail-item">

											<span>인원</span>

											<strong>
												{selectedPendingOuting.members}
											</strong>

										</div>

										<div className="detail-item">

											<span>일정</span>

											<strong>
												{selectedPendingOuting.schedule}
											</strong>

										</div>

									</>

								)}


								{/* ========================
										면회외박 / 외진
								======================== */}

								{(selectedPendingOuting.reason === '면회외박'
									||
									selectedPendingOuting.reason === '외진') && (

									<div className="detail-item">

										<span>보고 사항</span>

										<strong>
											{selectedPendingOuting.notes || '-'}
										</strong>

									</div>

								)}

							</div>

						</div>

						<div className="modal-actions">

							<button
								className="approve-btn"

								onClick={() =>
									handleStatusChange(
										selectedPendingOuting.id,
										'approved'
									)
								}
							>
								승인
							</button>

							<button
								className="reject-btn"

								onClick={() =>
									handleStatusChange(
										selectedPendingOuting.id,
										'rejected'
									)
								}
							>
								반려
							</button>

						</div>

					</div>

				</div>

			)}

			{/*SearchModal*/}
			{isSearchModalOpen && selectedSearchOuting && (

				<div
					className="modal"

					onClick={() =>
						setIsSearchModalOpen(false)
					}
				>

					<div
						className="modal-content"

						onClick={(e) =>
							e.stopPropagation()
						}
					>

						<div className="detail-header">

							<div>

								<h2>
									출타 상세
								</h2>

								<p className="detail-subtitle">
									출타 정보를 확인하세요.
								</p>

							</div>

							<button
								className="close-btn"

								onClick={() =>
									setIsSearchModalOpen(false)
								}
							>
								✕
							</button>

						</div>

						<div className="detail-grid">

							{/* 공통 */}
							<div className="detail-item">

								<span>이름</span>

								<strong>
									{selectedSearchOuting.name}
								</strong>

							</div>

							<div className="detail-item">

								<span>출타 종류</span>

								<strong>
									{selectedSearchOuting.reason}
								</strong>

							</div>

							<div className="detail-item">

								<span>시작일</span>

								<strong>
									{selectedSearchOuting.start_date}
								</strong>

							</div>

							<div className="detail-item">

								<span>종료일</span>

								<strong>
									{selectedSearchOuting.end_date}
								</strong>

							</div>

							<div className="detail-item">

								<span>상태</span>

								<strong>
									{selectedSearchOuting.status}
								</strong>

							</div>


							{/* ========================
									휴가
							======================== */}

							{selectedSearchOuting.reason === '휴가' && (

								<>

									<div className="detail-item">

										<span>복귀수단</span>

										<strong>
											{selectedSearchOuting.leave_transport}
										</strong>

									</div>

									<div className="detail-item">

										<span>내용</span>

										<strong>
											{selectedSearchOuting.detail}
										</strong>

									</div>

									<div className="detail-item">

										<span>비상 연락망</span>

										<strong>
											{selectedSearchOuting.contact}
										</strong>

									</div>

									<div className="detail-item">

										<span>최근 출타 시작일</span>

										<strong>
											{
												selectedSearchOuting
													.last_outing_start_date
											}
										</strong>

									</div>

									<div className="detail-item">

										<span>최근 출타 종료일</span>

										<strong>
											{
												selectedSearchOuting
													.last_outing_end_date
											}
										</strong>

									</div>

								</>

							)}


							{/* ========================
									외출
							======================== */}

							{selectedSearchOuting.reason === '외출' && (

								<>

									<div className="detail-item">

										<span>출발/복귀 수단</span>

										<strong>
											{selectedSearchOuting.outing_transport}
										</strong>

									</div>

									<div className="detail-item">

										<span>인원</span>

										<strong>
											{selectedSearchOuting.members || '-'}
										</strong>

									</div>

									<div className="detail-item">

										<span>일정</span>

										<strong>
											{selectedSearchOuting.schedule}
										</strong>

									</div>

								</>

							)}


							{/* ========================
									면회외박 / 외진
							======================== */}

							{(selectedSearchOuting.reason === '면회외박'
								||
								selectedSearchOuting.reason === '외진') && (

								<div className="detail-item">

									<span>보고 사항</span>

									<strong>
										{selectedSearchOuting.notes || '-'}
									</strong>

								</div>

							)}

						</div>

						<div className="modal-actions">

							<button
								className="edit-btn"

								onClick={() =>
									handleEdit(
										selectedSearchOuting.id
									)
								}
							>
								수정
							</button>

							<button
								className="delete-btn"

								onClick={() =>
									handleDelete(
										selectedSearchOuting.id
									)
								}
							>
								삭제
							</button>

						</div>

					</div>

				</div>

			)}

		{/* ========================
			Modal 1
		======================== */}

		{isOpen && (

		<div
			className="modal"

			onClick={() => {

			setIsOpen(false)

			resetForm()
			}}
		>

			<div
			className="modal-content"

			onClick={(e) =>
				e.stopPropagation()
			}
			>

			{/* Header */}
			<div className="detail-header">

				<div>

				<h2>
					출타 수정
				</h2>

				<p className="detail-subtitle">
					출타 정보를 입력하세요.
				</p>

				</div>

				<button
				className="close-btn"

				onClick={() => {

					setIsOpen(false)

					resetForm()
				}}
				>
				✕
				</button>

			</div>


			{/* ========================
				출타 종류
			======================== */}

			<div className="form-group">

				<label>
				출타 종류
				</label>

				<select

				value={reason}

				onChange={(e) =>
					setReason(e.target.value)
				}
				>

				<option value="">
					선택하세요
				</option>

				<option value="휴가">
					휴가
				</option>

				<option value="외출">
					외출
				</option>

				<option value="외진">
					외진
				</option>

				<option value="면회외박">
					면회외박
				</option>

				</select>

			</div>


			{/* ========================
				휴가
			======================== */}

			{reason === '휴가' && (

				<>

				<div className="transport-buttons">

				{[
					'개별 복귀',
					'도파대 복귀'
				].map((item) => (

					<button

					key={item}

					type="button"

					className={

						transport === item

						? 'transport-btn active'

						: 'transport-btn'
					}

					onClick={() =>
						setTransport(item)
					}
					>
					{item}
					</button>

				))}

				</div>

				<div className="form-group">

					<label>
					정기 휴가
					</label>

					<input

					value={regular}

					onChange={(e) =>
						setRegular(
						e.target.value
						)
					}
					/>

				</div>

				<div className="form-group">

					<label>
					포상 휴가
					</label>

					<input

					value={reward}

					onChange={(e) =>
						setReward(
						e.target.value
						)
					}
					/>

				</div>

				<div className="form-group">

					<label>
					위로/보상 휴가
					</label>

					<input

					value={compensation}

					onChange={(e) =>
						setCompensation(
						e.target.value
						)
					}
					/>

				</div>

				<div className="form-group">

					<label>
					연락처 (부 또는 모)
					</label>

					<input

					value={contact1}

					onChange={(e) =>
						setContact1(
						e.target.value
						)
					}
					/>

				</div>

				<div className="form-group">

					<label>
					연락처 (본인)
					</label>

					<input

					value={contact2}

					onChange={(e) =>
						setContact2(
						e.target.value
						)
					}
					/>

				</div>

				</>

			)}


			{/* ========================
				외출
			======================== */}

			{reason === '외출' && (

				<>

				<div className="form-group">

					<label>
					인원
					</label>

					{members.map((m, i) => (

					<div
						key={i}
						className="member-row"
					>

						<input

						value={m}

						onChange={(e) =>
							handleMemberChange(
							i,
							e.target.value
							)
						}
						/>

						<button

						type="button"

						onClick={() =>
							handleRemove(i)
						}
						>
						삭제
						</button>

					</div>

					))}

					<button

					type="button"

					className="add-member-btn"

					onClick={() =>
						setMembers([
						...members,
						''
						])
					}
					>
					+ 인원 추가
					</button>

				</div>

				<div className="form-group">

				<label>
					이동 수단
				</label>

				<div className="transport-buttons">

					{[
					'개별-개별',
					'개별-카운티',
					'카운티-개별',
					'카운티-카운티'
					].map((item) => (

					<button

						key={item}

						type="button"

						className={

						transport === item

							? 'transport-btn active'

							: 'transport-btn'
						}

						onClick={() =>
						setTransport(item)
						}
					>
						{item}
					</button>

					))}

				</div>

				</div>

				<div className="form-group">

					<label>
					일정
					</label>

					<textarea

					value={schedule}

					onChange={(e) =>
						setSchedule(
						e.target.value
						)
					}
					/>

				</div>

				</>

			)}


			{/* ========================
				외진 / 면회외박
			======================== */}

			{(reason === '외진'
				||
				reason === '면회외박') && (

				<div className="form-group">

				<label>
					보고 사항
				</label>

				<textarea

					value={notes}

					onChange={(e) =>
					setNotes(
						e.target.value
					)
					}
				/>

				</div>

			)}


			{/* ========================
				Button
			======================== */}

			<div className="modal-actions">

				<button

				className="secondary-btn"

				onClick={() => {

					setIsOpen(false)

					resetForm()
				}}
				>
				닫기
				</button>

				<button
				className="approve-btn"

				onClick={handleSubmit}
				>
				 수정 완료
				</button>

			</div>

			</div>

		</div>

		)}

    </div>
  )
}

export default OutingManagePage
