import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

function Calendar({ events, onSelect, onEventClick, eventContent }) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={events}

			selectable={true}
      select={onSelect}

			eventClick={onEventClick}
			dayMaxEvents={2}

			eventContent={eventContent}

    />
  );
}

export default Calendar;
