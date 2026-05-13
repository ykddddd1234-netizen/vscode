import { useEffect, useState } from 'react';
import { getOutings } from '../api/outings';
import { createOuting } from '../api/outings';
import { updateOuting } from '../api/outings';
import { deleteOuting } from '../api/outings';
import { getOutingDetail } from '../api/outings';
import { updateOutingStatus } from '../api/outings';
import Calendar from '../components/Calendar';
import '../App.css';

function CalendarPage() {
  	const [events, setEvents] = useState([]);
  	const [isOpen, setIsOpen] = useState(false);
  	const [reason, setReason] = useState('');
 	const [transport, setTransport] = useState('');
  	const [notes, setNotes] = useState('');
  	const [selectedDate, setSelectedDate] = useState(null);
	const [contact1, setContact1] = useState('');
	const [contact2, setContact2] = useState('');
	const [lastOutingStart, setLastOutingStart] = useState('');
	const [lastOutingEnd, setLastOutingEnd] = useState('');
	const [schedule, setSchedule] = useState('');
	const [members, setMembers] = useState(['']);
	const [regular, setRegular] = useState('');
	const [reward, setReward] = useState('');
	const [compensation, setCompensation] = useState('');
	const [selectedOuting, setSelectedOuting] = useState(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const user = JSON.parse(localStorage.getItem('user'));

	const resetForm = () => { setReason(''); setTransport(''); setSchedule(''); setMembers(['']); setRegular(''); setReward(''); setCompensation('');
		setContact1(''); setContact2(''); setLastOutingStart(''); setLastOutingEnd(''); setNotes(''); };

  const options = ["개별-개별", "개별-카운티", "카운티-개별", "카운티-카운티"];
  const options2 = ["개별 복귀", "도파대 복귀"]
  const detail =
	`정기: ${regular} / 포상: ${reward} / 위로/보상: ${compensation}`

  const contact =
	`부 또는 모: ${contact1} / 본인: ${contact2}`
  const reasonColors = {
  휴가: '#4caf50',
  외출: '#2196f3',
  외진: '#ff9800',
  면회외박: '#f44336'
};


//Fetch
const fetchOutings = async () => {
  const token = localStorage.getItem('token');

  const res = await getOutings(token);

  const formatted = res.data.map(item => ({
	id: item.id,
    title: `${item.reason} - ${item.name}`,
    start: item.start_date,
    end: item.end_date,
    backgroundColor: reasonColors[item.reason],
	allDay: true,

	extendedProps: {
	status: item.status
	}
  }));

  setEvents(formatted);
};

//First Fetch
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('로그인 필요');
      return;
    }

    getOutings(token)
      .then(res => {
        const formatted = res.data.map(item => ({
					id: item.id,
          title: `${item.reason} - ${item.name}`,
          start: item.start_date,
          end: item.end_date,
		  backgroundColor: reasonColors[item.reason],
		  allDay: true,

		  extendedProps: {
		  status: item.status
		  }

        }));

        setEvents(formatted);
      })
      .catch(err => {
        console.error(err);
        alert('데이터 불러오기 실패');
      });
  }, []);


//Modal Open
 	const handleSelect = (info) => {
	setSelectedOuting(null);
	resetForm();
	setSelectedDate(info);
	setIsOpen(true);
};

//Check Schedule and Delete Schedule
  const handleEventClick = async (info) => {
	const token = localStorage.getItem('token');

	try {
		const res = await getOutingDetail(token, info.event.id);

		setSelectedOuting(res.data);
		setIsDetailOpen(true);

	} catch (err) {
		console.error(err);

		const message =
		err.response?.data?.error || '조회 실패';

		alert(message);
	}
	};

//Submit (POST/ API)
  const handleSubmit = async () => {
	 // 휴가 입력 경고창
  if (reason === '휴가') {

    if (!transport) {
      alert('복귀 수단 입력하세요');
      return;
    }

    if (!detail) {
      alert('휴가 상세 내용 입력하세요');
      return;
    }

    if (!contact1 || !contact2) {
      alert('비상 연락망 입력하세요');
      return;
    }

    if (!lastOutingStart || !lastOutingEnd) {
      alert('최근 출타 기간 입력하세요');
      return;
    }

    if (lastOutingStart > lastOutingEnd) {
      alert('날짜 범위가 잘못됨');
      return;
    }
  }

  // 외출 입력 경고창
  if (reason === '외출' && !selectedOuting) {

    const hasEmptyMember = members.some(m => !m.trim());
	const start = selectedDate.startStr;
	const end = selectedDate.endStr;

	const startDate = new Date(start);
	const endDate = new Date(end);

	const diff =
		(endDate - startDate) / (1000 * 60 * 60 * 24);

	if (diff !== 1) {
		alert('외출은 하루만 등록 가능합니다');
		return;
	}

    if (hasEmptyMember) {
      alert('외출자 명단 입력하세요');
      return;
    }

    if (!transport) {
      alert('출발/복귀 수단 선택하세요');
      return;
    }

    if (!schedule) {
      alert('일정 입력하세요');
      return;
    }
  }

  const token = localStorage.getItem('token');

  if (!token) {
    alert('로그인이 필요합니다');
    return;
  }

	try {
	const start = selectedOuting

		? selectedOuting.outing.start_date

		: selectedDate.startStr;


	const end = selectedOuting

		? selectedOuting.outing.end_date

		: selectedDate.endStr;

	const outingData = {

		start_date: start,

		end_date: end,

		reason,

		members,

		transport,

		schedule,

		detail,

		contact,

		lastOutingStart,

		lastOutingEnd,

		notes
	}

	if (selectedOuting) {

		await updateOuting(

		token,

		selectedOuting.outing.id,

		outingData

		)

	} else {

		await createOuting(

		token,

		outingData

		)

	}

	setIsOpen(false);

	resetForm();

	fetchOutings();

	} catch (err) {

	console.error(err);

	console.log(err.response);

	const data = err.response?.data;

	if (data?.duplicated?.length > 0) {

		alert(
		`이미 외출 신청된 인원: ${data.duplicated.join(', ')}`
		);

	} else {

		alert(data?.error || '등록 실패');
	}

	}
}

//Add Members (외출)
  const handleMemberChange = (index, value) => {
  const updated = [...members];
  updated[index] = value;
  setMembers(updated);
  };

//Remove Members (외출)
  const handleRemove = (index) => {
  if (members.length === 1) return; // 🔥 최소 1명 유지

  const updated = members.filter((_, i) => i !== index);
  setMembers(updated);
  };

//Delete Schedule
  const handleDelete = async (id) => {
	if (!window.confirm('삭제하시겠습니까?')) return;

	const token = localStorage.getItem('token');

	await deleteOuting(token, id);

	setIsDetailOpen(false);
	fetchOutings();
	};

//Edit Schedule
	const handleEdit = () => {

	setIsDetailOpen(false)

	setIsOpen(true)

	// 공통
	setReason(
		selectedOuting.outing.reason
	)


	// ========================
	// 휴가
	// ========================

	if (
		selectedOuting.outing.reason
		=== '휴가'
	) {

		setTransport(
		selectedOuting.detail.transport || ''
		)

		// detail parsing
		const detail =
		selectedOuting.detail.detail || ''

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
			/위로\/보상:\s*(.*)$/
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

		// contact parsing
		const contact =
		selectedOuting.detail.contact || ''

		const parentMatch =
		contact.match(
			/부 또는 모:\s*(.*?)\s*\/ 본인:/
		)

		const selfMatch =
		contact.match(
			/본인:\s*(.*)$/
		)

		setContact1(
		parentMatch?.[1] || ''
		)

		setContact2(
		selfMatch?.[1] || ''
		)

		setLastOutingStart(

		selectedOuting.detail
			.last_outing_start

			?.split('T')[0]

			|| ''
		)

		setLastOutingEnd(

		selectedOuting.detail
			.last_outing_end

			?.split('T')[0]

			|| ''
		)
	}


	// ========================
	// 외출
	// ========================

	if (
		selectedOuting.outing.reason
		=== '외출'
	) {

		setTransport(
		selectedOuting.detail.transport || ''
		)

		setMembers(
		selectedOuting.detail.members || ['']
		)

		setSchedule(
		selectedOuting.detail.schedule || ''
		)
	}


	// ========================
	// 면회외박 / 외진
	// ========================

	if (

		selectedOuting.outing.reason
		=== '면회외박'

		||

		selectedOuting.outing.reason
		=== '외진'
	) {

		setNotes(
		selectedOuting.outing.notes || ''
		)
	}
	}

//Page Change
	const openAttendanceStatus = () => {
	window.location.href = "/calendar";
	};

	const openAttendanceRate = () => {
	window.location.href = "/calendar2";
	};

	const openCompanyManagePage = () => {
	window.location.href = "/CompanyManagePage";
	};

	const handleLogout = () => {
	localStorage.removeItem("token");
	localStorage.removeItem('user');
	window.location.href = "/";
	};

//Status Change
const handleStatusChange = async (status) => {
const token = localStorage.getItem('token');

  try {

    await updateOutingStatus(
      selectedOuting.outing.id,
      status,
	  token
    );

    alert(
      status === 'approved'
        ? '승인 완료'
        : '반려 완료'
    );

    fetchOutings();
    setIsDetailOpen(false);

  } catch (err) {
    console.error(err);
    alert('상태 변경 실패');
  }
};

  return (
  <>
  <div className="landscape-only">

    <div className="calendar-page">

		{/* Header */}
		<div className="top-bar">

			<div>
			<h1>출타 관리 시스템</h1>
			<p>팀 일정 및 출타 현황을 관리하세요.</p>
			</div>

			<div className="top-actions">
			<button onClick={openAttendanceStatus}>
			출타 현황
			</button>

			<button onClick={openAttendanceRate}>
			출타율 현황
			</button>

			{user?.role === 'admin' && (
			<>
				<button onClick={openCompanyManagePage}>
				중대 관리창
				</button>

			</>
			)}

			<button onClick={handleLogout}>
			로그아웃
			</button>

			</div>

		</div>

		{/* Calendar Card */}
		<div className="calendar-wrapper">
			<Calendar
			events={events}
			onSelect={handleSelect}
			onEventClick={handleEventClick}
			dayMaxEvents={true}
			moreLinkClick="popover"
			height="auto"

			eventContent={(arg) => {

				const status =
				arg.event._def.extendedProps.status

				return (
				<div className="event-card">

					<span className="event-title">
					{arg.event.title}
					</span>

					<span
					className={`status-badge ${status}`}
					>
					{
						status === 'approved'
						? '승인'
						: status === 'rejected'
						? '반려'
						: '대기'
					}
					</span>

				</div>
				);
			}}

			/>
		</div>

	</div>

  </div>

    <div className="portrait-block">
      가로 화면으로 이용해주세요.
    </div>

    {/* Modal 1 */}
	{isOpen && (
	<div
		className="modal"
		onClick={() => {
		setIsOpen(false);
		resetForm();
		}}
	>
		<div
		className="modal-content"
		onClick={(e) => e.stopPropagation()}
		>

		{/* Header */}
		<div className="detail-header">

			<div>
			<h2>출타 입력</h2>

			<p className="detail-subtitle">
				출타 정보를 입력하세요.
			</p>
			</div>

			<button
			className="close-btn"
			onClick={() => {
				setIsOpen(false);
				resetForm();
			}}
			>
			✕
			</button>

		</div>

		{/* 출타 종류 */}
		<div className="form-group">

			<label>출타 종류</label>

			<select
			value={reason}
			onChange={(e) => setReason(e.target.value)}
			>
			<option value="">선택하세요</option>
			<option value="휴가">휴가</option>
			<option value="외출">외출</option>
			<option value="외진">외진</option>
			<option value="면회외박">면회외박</option>
			</select>

		</div>

		{/* 휴가 */}
		{reason === '휴가' && (
			<>

			<div className="section-title">
				휴가 정보
			</div>

			{/* 이동 수단 */}
			<div className="form-group">

				<label>이동 수단</label>

				<div className="transport-group">

				{options2.map(opt => (

					<button
					key={opt}
					type="button"
					onClick={() => setTransport(opt)}

					className={
						transport === opt
						? 'transport-btn active'
						: 'transport-btn'
					}
					>
					{opt}
					</button>

				))}

				</div>

			</div>

			{/* 정기 휴가 */}
			<div className="form-group">

				<label>정기 휴가</label>

				<input
				placeholder="예) 정기 휴가 8일"
				value={regular}
				onChange={(e) =>
					setRegular(e.target.value)
				}
				/>

			</div>

			{/* 포상 휴가 */}
			<div className="form-group">

				<label>포상 휴가</label>

				<input
				placeholder="예) 5월 상점 포상 1일"
				value={reward}
				onChange={(e) =>
					setReward(e.target.value)
				}
				/>

			</div>

			{/* 위로/보상 휴가 */}
			<div className="form-group">

				<label>위로/보상 휴가</label>

				<input
				placeholder="예) 입도 위로 휴가 1일"
				value={compensation}
				onChange={(e) =>
					setCompensation(e.target.value)
				}
				/>

			</div>

			{/* 연락처 */}
			<div className="form-group">

				<label>연락처 (부 또는 모)</label>

				<input
				placeholder="전화번호 입력"
				value={contact1}
				onChange={(e) =>
					setContact1(e.target.value)
				}
				/>

			</div>

			<div className="form-group">

				<label>연락처 (본인)</label>

				<input
				placeholder="전화번호 입력"
				value={contact2}
				onChange={(e) =>
					setContact2(e.target.value)
				}
				/>

			</div>

			{/* 날짜 */}
			<div className="form-group">

				<label>최근 출타 시작일</label>

				<input
				type="date"
				value={lastOutingStart}
				onChange={(e) =>
					setLastOutingStart(e.target.value)
				}
				/>

			</div>

			<div className="form-group">

				<label>최근 출타 종료일</label>

				<input
				type="date"
				value={lastOutingEnd}
				onChange={(e) =>
					setLastOutingEnd(e.target.value)
				}
				/>

			</div>

			</>
		)}

		{/* 외출 */}
		{reason === '외출' && (
			<>

			<div className="section-title">
				외출 정보
			</div>

			{/* 인원 */}
			<div className="form-group">

				<label>대표자 및 동반 인원</label>

				{members.map((m, i) => (

				<div
					key={i}
					className="member-row"
				>

					<input
					placeholder={`인원 ${i + 1} (상병 홍길동)`}
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
					className="remove-btn"
					onClick={() => handleRemove(i)}
					>
					삭제
					</button>

				</div>

				))}

				<button
				type="button"
				className="add-member-btn"
				onClick={() =>
					setMembers([...members, ''])
				}
				>
				+ 인원 추가
				</button>

			</div>

			{/* 이동 수단 */}
			<div className="form-group">

				<label>이동 수단</label>

				<div className="transport-group">

				{options.map(opt => (

					<button
					key={opt}
					type="button"
					onClick={() => setTransport(opt)}

					className={
						transport === opt
						? 'transport-btn active'
						: 'transport-btn'
					}
					>
					{opt}
					</button>

				))}

				</div>

			</div>

			{/* 일정 */}
			<div className="form-group">

				<label>일정</label>

				<textarea
				placeholder="예) 16:00 ~ 18:00 연봉회관 "
				value={schedule}
				onChange={(e) =>
					setSchedule(e.target.value)
				}
				/>

			</div>

			</>
		)}

		{/* 외진 / 면회외박 */}
		{(reason === '외진' ||
			reason === '면회외박') && (
			<>

			<div className="section-title">
				보고 사항
			</div>

			<div className="form-group">

				<textarea
				placeholder="외진 사유 또는 추가로 보고할 사항를 입력하세요."
				value={notes}
				onChange={(e) =>
					setNotes(e.target.value)
				}
				/>

			</div>

			</>
		)}

		{/* 버튼 */}
		<div className="modal-actions">

			<button
			className="secondary-btn"
			onClick={() => {
				setIsOpen(false);
				resetForm();
			}}
			>
			닫기
			</button>

			<button
			className="approve-btn"
			onClick={handleSubmit}
			>
			저장
			</button>

		</div>

		</div>
	</div>
	)}

	{/* Modal 2 */}
	{isDetailOpen && selectedOuting && (

	<div
		className="modal"
		onClick={() => setIsDetailOpen(false)}
	>

		<div
		className="modal-content"
		onClick={(e) => e.stopPropagation()}
		>

		{/* Header */}
		<div className="detail-header">

			<div>
			<h2>출타 상세</h2>

			<p className="detail-subtitle">
				출타 정보를 확인하세요.
			</p>
			</div>

			<button
			className="close-btn"
			onClick={() => setIsDetailOpen(false)}
			>
			✕
			</button>

		</div>

		{/* Detail Card */}
		<div className="detail-grid">

			<div className="detail-item">
			<span>사유</span>

			<strong>
				{selectedOuting.outing.reason}
			</strong>
			</div>

			{/* 휴가 */}
			{selectedOuting.outing.reason === '휴가' && (
			<>
				<div className="detail-item">
				<span>복귀수단</span>

				<strong>
					{selectedOuting.detail.transport}
				</strong>
				</div>

				<div className="detail-item">
				<span>내용</span>

				<strong>
					{selectedOuting.detail.detail}
				</strong>
				</div>

				<div className="detail-item">
				<span>비상 연락망</span>

				<strong>
					{selectedOuting.detail.contact}
				</strong>
				</div>

				<div className="detail-item">
				<span>최근 출타 시작일</span>

				<strong>
					{selectedOuting.detail.last_outing_start?.split('T')[0]}
				</strong>
				</div>

				<div className="detail-item">
				<span>최근 출타 종료일</span>

				<strong>
					{selectedOuting.detail.last_outing_end?.split('T')[0]}
				</strong>
				</div>
			</>
			)}

			{/* 외출 */}
			{selectedOuting.outing.reason === '외출' && (
			<>
				<div className="detail-item">
				<span>출발/복귀 수단</span>

				<strong>
					{selectedOuting.detail.transport}
				</strong>
				</div>

				<div className="detail-item">
				<span>인원</span>

				<strong>
					{selectedOuting.detail.members.join(', ')}
				</strong>
				</div>

				<div className="detail-item">
				<span>일정</span>

				<strong>
					{selectedOuting.detail.schedule}
				</strong>
				</div>
			</>
			)}

			{/*면회외박 or 외진*/}
			{(selectedOuting.outing.reason === '면회외박' || selectedOuting.outing.reason === '외진') && (
			<>
				<div className="detail-item">
				<span>보고 사항</span>

				<strong>
					{selectedOuting.outing.notes}
				</strong>
				</div>

			</>
			)}

		</div>

		{/* Action Buttons */}
		<div className="modal-actions">

			<button
			className="edit-btn"
			onClick={handleEdit}
			>
			수정
			</button>

			<button
			className="delete-btn"
			onClick={() =>
				handleDelete(selectedOuting.outing.id)
			}
			>
			삭제
			</button>

			{user?.role === 'admin' && (
			<>
				<button
				className="approve-btn"
				onClick={() =>
					handleStatusChange('approved')
				}
				>
				승인
				</button>

				<button
				className="reject-btn"
				onClick={() =>
					handleStatusChange('rejected')
				}
				>
				반려
				</button>
			</>
			)}

		</div>

		</div>

	</div>
	)}

  </>
);
}

export default CalendarPage;
