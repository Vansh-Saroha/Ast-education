// Milestones and text come from the approved About copy and the verified dates. Nothing new is claimed here.
const MILESTONES = [
  {
    date: '2023-12-05',
    label: '5 December 2023',
    title: 'Business established',
    text: 'The business started as a micro enterprise based in Roorkee, Uttarakhand.',
  },
  {
    date: '2023-12-27',
    label: '27 December 2023',
    title: 'Registered on Udyam',
    text: 'The micro enterprise registration on Udyam is dated 27 December 2023.',
  },
];

export default function AboutHighlights() {
  return (
    <section className="wrap sec about-highlights" aria-labelledby="about-milestones-title">
      <h2 id="about-milestones-title">Milestones</h2>
      <ol className="clay-timeline">
        {MILESTONES.map((item, index) => (
          <li key={item.date}>
            <span className="clay-milestone-dot" aria-hidden="true">{index + 1}</span>
            <article className="clay-milestone">
              <time dateTime={item.date}>{item.label}</time>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          </li>
        ))}
      </ol>

      <div className="cols">
        <div className="card">
          <h3>Our approach</h3>
          <p>Our approach is to combine clear academic support, practical skill development and personal guidance so students can learn confidently and progress responsibly.</p>
        </div>
        <div className="card">
          <h3>Coaching and academic support</h3>
          <p>AST Education provides coaching and academic support. It does not award university degrees. Degrees are awarded by the universities that conduct the relevant programmes.</p>
        </div>
      </div>
    </section>
  );
}
