import { Link } from 'react-router-dom';

// Roles and responsibilities as described on the Leadership page. Names stay on that page, which loads the live profiles.
export default function HomeLeadershipPreview() {
  return (
    <section className="wrap sec leadership-preview" aria-labelledby="home-leadership-title">
      <h2 id="home-leadership-title">Our leadership</h2>
      <p className="lead">The people who guide AST Education&apos;s direction, academics and daily operations.</p>
      <div className="grid">
        <Link className="card" to="/leadership">
          <h3>Director &amp; Chairman</h3>
          <p>Provides institutional direction, supports strategic growth, strengthens educational partnerships, and oversees the long-term development of AST Education.</p>
        </Link>
        <Link className="card" to="/leadership">
          <h3>General Manager &amp; Teacher</h3>
          <p>Supports daily institutional operations, coordinates academic activities, assists staff and students, and helps maintain an organised and supportive learning environment.</p>
        </Link>
      </div>
      <div className="row">
        <Link className="btn btn-g" to="/leadership">Meet the leadership team</Link>
      </div>
    </section>
  );
}
