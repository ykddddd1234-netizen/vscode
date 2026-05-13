import '../App.css'
import { useState, useEffect } from 'react'
import {

  getGuardRoom,
  addGuardHoliday,
  deleteGuardHoliday,
  generateGuardSchedule,
	saveGuardOrders

} from '../api/outings'

import {

  DndContext,
  closestCenter

} from '@dnd-kit/core'


import {

  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable

} from '@dnd-kit/sortable'


import {

  CSS

} from '@dnd-kit/utilities'

function SortableRow({

  user

}) {

  const {

    attributes,
    listeners,
    setNodeRef,
    transform,
    transition

  } = useSortable({

    id: user.user_id
  })


  const style = {

    transform:
      CSS.Transform.toString(
        transform
      ),

    transition
  }


  return (

    <tr

      ref={setNodeRef}

      style={style}

      {...attributes}

      {...listeners}
    >

      <td>
        {user.order_no}
      </td>

      <td>
        {user.name}
      </td>

      <td>
        {user.class_number}기
      </td>

    </tr>
  )
}

function GuardRoomPage() {

  // ========================
  // Generate Form
  // ========================

  const [startDate, setStartDate] =
    useState('')

  const [selectedSenior, setSelectedSenior] =
    useState('')

  const [selectedJunior, setSelectedJunior] =
    useState('')


  // ========================
  // Data
  // ========================

  const [guardSchedules, setGuardSchedules] =
    useState([])

  const [seniorGuards, setSeniorGuards] =
    useState([])

  const [juniorGuards, setJuniorGuards] =
    useState([])

  const [patients, setPatients] =
    useState([])

  const [holidays, setHolidays] =
    useState([])

  const [holidayDate, setHolidayDate] =
    useState('')

  const [holidayReason, setHolidayReason] =
    useState('')


  // ========================
  // Fetch
  // ========================

	const fetchGuardRoomData =
		async () => {

			try {

				const token =
					localStorage.getItem('token')

				if (!token) return

				const data =
					await getGuardRoom(token)

				setSeniorGuards(
					data.seniorGuards
				)

				setJuniorGuards(
					data.juniorGuards
				)

				setPatients(
					data.patients
				)

				setHolidays(
					data.holidays
				)

				setGuardSchedules(
					data.guardSchedules
				)

			} catch (err) {

				console.error(err)

				alert(
					'위병소 데이터 조회 실패'
				)
			}
	}


  useEffect(() => {

    fetchGuardRoomData()

  }, [])


  // ========================
  // Holiday
  // ========================

	const handleAddHoliday =
		async () => {

			try {

				const token =
					localStorage.getItem('token')

				if (!token) return


				if (!holidayDate) {

					alert(
						'휴무일 선택하세요'
					)

					return
				}


				if (!holidayReason) {

					alert(
						'휴무 사유 입력하세요'
					)

					return
				}


				await addGuardHoliday(

					token,

					{

						holiday_date:
							holidayDate,

						reason:
							holidayReason
					}
				)


				setHolidayDate('')

				setHolidayReason('')


				fetchGuardRoomData()

			} catch (err) {

				console.error(err)

				alert(
					'휴무일 추가 실패'
				)
			}
	}


	const handleDeleteHoliday =
		async (id) => {

			try {

				const token =
					localStorage.getItem('token')

				if (!token) return


				await deleteGuardHoliday(

					token,
					id
				)


				fetchGuardRoomData()

			} catch (err) {

				console.error(err)

				alert(
					'휴무일 삭제 실패'
				)
			}
	}


  // ========================
  // Generate Schedule
  // ========================

	const handleGenerateSchedule =
		async () => {

			try {

				const token =
					localStorage.getItem('token')

				if (!token) return


				if (!startDate) {

					alert(
						'시작일 선택하세요'
					)

					return
				}


				if (!selectedSenior) {

					alert(
						'선임 근무자 선택하세요'
					)

					return
				}


				if (!selectedJunior) {

					alert(
						'후임 근무자 선택하세요'
					)

					return
				}


				await generateGuardSchedule(

					token,

					{

						startDate,

						seniorUserId:
							selectedSenior,

						juniorUserId:
							selectedJunior
					}
				)


				alert(
					'근무표 생성 완료'
				)


				fetchGuardRoomData()

			} catch (err) {

				console.error(err)

				alert(
					'근무표 생성 실패'
				)
			}
	}


  // ========================
  // Page Change
  // ========================

  const openCompanyManagePage = () => {

    window.location.href = '/CompanyManagePage'
  }

  const handleLogout = () => {

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    window.location.href = '/'
  }

	//Drag
	const handleSeniorDragEnd =
		(event) => {

			const {

				active,
				over

			} = event


			if (

				!over ||
				active.id === over.id

			) {

				return
			}


			const oldIndex =
				seniorGuards.findIndex(

					user =>
						user.user_id
						=== active.id
				)


			const newIndex =
				seniorGuards.findIndex(

					user =>
						user.user_id
						=== over.id
				)


			const updated =
				arrayMove(

					seniorGuards,

					oldIndex,
					newIndex
				)


			// order_no 재정렬
			const reordered =
				updated.map(

					(user, index) => ({

						...user,

						order_no:
							index + 1
					})
				)


			setSeniorGuards(
				reordered
			)
	}

	const handleJuniorDragEnd =
  (event) => {

    const {

      active,
      over

    } = event


    if (

      !over ||
      active.id === over.id

    ) {

      return
    }


    const oldIndex =
      juniorGuards.findIndex(

        user =>
          user.user_id
          === active.id
      )


    const newIndex =
      juniorGuards.findIndex(

        user =>
          user.user_id
          === over.id
      )


    const updated =
      arrayMove(

        juniorGuards,

        oldIndex,
        newIndex
      )


    const reordered =
      updated.map(

        (user, index) => ({

          ...user,

          order_no:
            index + 1
        })
      )


    setJuniorGuards(
      reordered
    )
	}

	//Save Order
	const handleSaveGuardOrders =
		async () => {

			try {

				const token =
					localStorage.getItem('token')

				if (!token) return


				await saveGuardOrders(

					token,

					seniorGuards,
					juniorGuards
				)


				alert(
					'근무 순번 저장 완료'
				)


				fetchGuardRoomData()

			} catch (err) {

				console.error(err)

				alert(
					'근무 순번 저장 실패'
				)
			}
	}


  return (

    <div className="roster-page">

      {/* Header */}
      <div className="top-bar">

        <div>

          <h1>위병소 근무 관리</h1>

          <p>
            위병소 근무표 및 근무 순번을 관리하세요.
          </p>

        </div>

        <div className="top-actions">

          <button onClick={openCompanyManagePage}>
            처음으로
          </button>

          <button onClick={handleLogout}>
            로그아웃
          </button>

        </div>

      </div>


      {/* ========================
          Generate Section
      ======================== */}

      <div className="guard-section">

        <div className="section-header">

          <h2>근무표 생성</h2>

          <p>
            기준 근무자를 설정해 2주 근무표를 생성하세요.
          </p>

        </div>


        <div className="guard-generate-grid">

          <div className="form-group">

            <label>
              시작일
            </label>

            <input
              type="date"

              value={startDate}

              onChange={(e) =>
                setStartDate(e.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              선임 시작 근무자
            </label>

            <select

              value={selectedSenior}

              onChange={(e) =>
                setSelectedSenior(e.target.value)
              }
            >

              <option value="">
                선택하세요
              </option>

              {seniorGuards.map((user) => (

                <option
                  key={user.user_id}
                  value={user.user_id}
                >
                  {user.name}
                </option>

              ))}

            </select>

          </div>


          <div className="form-group">

            <label>
              후임 시작 근무자
            </label>

            <select

              value={selectedJunior}

              onChange={(e) =>
                setSelectedJunior(e.target.value)
              }
            >

              <option value="">
                선택하세요
              </option>

              {juniorGuards.map((user) => (

                <option
                  key={user.user_id}
                  value={user.user_id}
                >
                  {user.name}
                </option>

              ))}

            </select>

          </div>

        </div>


        <button
          className="generate-btn"

          onClick={handleGenerateSchedule}
        >
          2주 근무표 생성
        </button>

      </div>


      {/* ========================
          Guard Schedule
      ======================== */}

      <div className="guard-section">

        <div className="section-header">

          <h2>위병소 근무표</h2>

          <p>
            생성된 위병소 근무표입니다.
          </p>

        </div>


        <div className="roster-table-wrapper">

          <table className="roster-table">

            <thead>

              <tr>

                <th>날짜</th>

                <th>선임 근무자</th>

                <th>후임 근무자</th>

              </tr>

            </thead>


            <tbody>

              {guardSchedules.map((schedule) => (

                <tr key={schedule.id}>

									<td>
										{schedule.duty_date}
									</td>

                  <td>
                    {schedule.senior_name}
                  </td>

                  <td>
                    {schedule.junior_name}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* ========================
          Senior Guards
      ======================== */}

      <div className="guard-section">

        <div className="section-header">

          <h2>선임 근무 순번표</h2>

        </div>


        <div className="roster-table-wrapper">

          <table className="roster-table">

            <thead>

              <tr>

                <th>순번</th>

                <th>이름</th>

                <th>기수</th>

              </tr>

            </thead>


							<DndContext

								collisionDetection={
									closestCenter
								}

								onDragEnd={
									handleSeniorDragEnd
								}
							>

								<SortableContext

									items={

										seniorGuards.map(

											user =>
												user.user_id
										)
									}

									strategy={
										verticalListSortingStrategy
									}
								>

									<tbody>

										{seniorGuards.map((user) => (

											<SortableRow

												key={user.user_id}

												user={user}
											/>
										))}

									</tbody>

								</SortableContext>

							</DndContext>

          </table>

        </div>

      </div>


      {/* ========================
          Junior Guards
      ======================== */}

      <div className="guard-section">

        <div className="section-header">

          <h2>후임 근무 순번표</h2>

        </div>


        <div className="roster-table-wrapper">

          <table className="roster-table">

            <thead>

              <tr>

                <th>순번</th>

                <th>이름</th>

                <th>기수</th>

              </tr>

            </thead>


							<DndContext

								collisionDetection={
									closestCenter
								}

								onDragEnd={
									handleJuniorDragEnd
								}
							>

								<SortableContext

									items={

										juniorGuards.map(

											user =>
												user.user_id
										)
									}

									strategy={
										verticalListSortingStrategy
									}
								>

									<tbody>

										{juniorGuards.map((user) => (

											<SortableRow

												key={user.user_id}

												user={user}
											/>
										))}

									</tbody>

								</SortableContext>

							</DndContext>

          </table>

        </div>

      </div>

			{/*save button*/}
			<div className="guard-save-section">

        <button

          className="generate-btn"

          onClick={
            handleSaveGuardOrders
          }
        >

          근무 순번 저장

        </button>

      </div>


      {/* ========================
          Patient Status
      ======================== */}

      <div className="guard-section">

        <div className="section-header">

          <h2>현재 환자 현황</h2>

          <p>
            환자는 자동으로 위병소 근무에서 제외됩니다.
          </p>

        </div>


        <div className="roster-table-wrapper">

          <table className="roster-table">

            <thead>

              <tr>

                <th>이름</th>

                <th>소속</th>

                <th>사유</th>

              </tr>

            </thead>


            <tbody>

              {patients.map((user) => (

                <tr key={user.id}>

                  <td>
                    {user.name}
                  </td>

                  <td>
                    {user.unit}
                  </td>

                  <td>
                    {user.patient_reason}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* ========================
          Holidays
      ======================== */}

      <div className="guard-section">

        <div className="section-header">

          <h2>휴무일 관리</h2>

          <p>
            위병소 근무 제외 날짜를 관리하세요.
          </p>

        </div>


        <div className="guard-generate-grid">

          <div className="form-group">

            <label>
              휴무일
            </label>

            <input
              type="date"

              value={holidayDate}

              onChange={(e) =>
                setHolidayDate(e.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              휴무 사유
            </label>

            <input
              type="text"

              placeholder="예: 대대 전투휴무"

              value={holidayReason}

              onChange={(e) =>
                setHolidayReason(e.target.value)
              }
            />

          </div>

        </div>


        <button
          className="generate-btn"

          onClick={handleAddHoliday}
        >
          휴무일 추가
        </button>


        <div className="roster-table-wrapper">

          <table className="roster-table">

            <thead>

              <tr>

                <th>날짜</th>

                <th>사유</th>

                <th>관리</th>

              </tr>

            </thead>


            <tbody>

              {holidays.map((holiday) => (

                <tr key={holiday.id}>

                  <td>
                    {holiday.holiday_date}
                  </td>

                  <td>
                    {holiday.reason}
                  </td>

                  <td>

                    <button
                      className="delete-btn"

                      onClick={() =>
                        handleDeleteHoliday(
                          holiday.id
                        )
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

      </div>

    </div>
  )
}

export default GuardRoomPage
