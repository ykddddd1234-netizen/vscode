import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { getOutingRate } from '../api/outings';
import '../App.css';

function CalendarPage2() {

  const [events, setEvents] = useState([]);

  // 🔥 데이터 불러오기
  const fetchRates = async () => {

    const token = localStorage.getItem('token');

    try {
      const res = await getOutingRate(token);

      const formatted = res.data.map(item => ({
        title: `${item.unit} ${item.rate}%`,
        start: item.date,
        allDay: true,

        backgroundColor:
          Number(item.rate) >= 20
            ? 'red'
            : Number(item.rate) >= 15
            ? 'orange'
            : 'green'
      }));

      setEvents(formatted);

    } catch (err) {
      console.error(err);
      alert('출타율 조회 실패');
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

//Page Change
	const openAttendanceStatus = () => {
	window.location.href = "/calendar";
	};

	const openAttendanceRate = () => {
	window.location.href = "/calendar2";
	};

	const handleLogout = () => {
  localStorage.removeItem("token");
	localStorage.removeItem('user');
  window.location.href = "/";
  };

  // 🔥 화면
  return (
	<>
	<div className="landscape-only">

		<div className="calendar-page">

		{/* Header */}
		<div className="top-bar">

			<div>
			<h1>출타율 달력</h1>

			<p>
				출타율 및 일정 현황을 확인하세요.
			</p>
			</div>

			<div className="top-actions">

			<button onClick={openAttendanceStatus}>
				출타현황
			</button>

			<button onClick={openAttendanceRate}>
				출타율 현황
			</button>

			<button onClick={handleLogout}>
				로그아웃
			</button>

			</div>

		</div>

		{/* Calendar */}
		<div className="calendar-wrapper">

			<FullCalendar
			plugins={[dayGridPlugin]}
			initialView="dayGridMonth"
			events={events}
			dayMaxEvents={true}
			height="auto"
			/>

		</div>

		</div>

	</div>

	<div className="portrait-block">
		가로 화면으로 이용해주세요.
	</div>
	</>
  );
}

export default CalendarPage2;
