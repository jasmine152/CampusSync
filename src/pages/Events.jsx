function Events() {

  const events = [
    {
      title: "Mid-Semester Examination",
      date: "25 August 2026",
      text: "The university has released the examination schedule."
    },
    {
      title: "Annual Tech Fest",
      date: "30 August 2026",
      text: "Registration for the annual technical festival is now open."
    },
    {
      title: "Hackathon 2026",
      date: "5 September 2026",
      text: "Students can register their teams for the upcoming hackathon."
    }
  ];

  return (
    <div className="page-container">

      <div className="page-header">

        <h1>Events & Announcements</h1>

        <p>
          Stay updated with important university news.
        </p>

      </div>


      <div className="events-list">

        {events.map((event, index) => (

          <div
            className="event-card"
            key={index}
          >

            <div className="event-icon">
              📢
            </div>

            <div>

              <span className="event-date">
                {event.date}
              </span>

              <h2>
                {event.title}
              </h2>

              <p>
                {event.text}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Events;