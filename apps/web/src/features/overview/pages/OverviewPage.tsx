import { usePageTitle } from '@/lib/utils/pageTitle';

const CAPABILITIES = [
  {
    title: 'Datasets',
    description:
      'Import and manage spreadsheet-backed datasets.',
  },
  {
    title: 'Queries',
    description:
      'Explore your data using a visual query builder.',
  },
  {
    title: 'Visualizations',
    description:
      'Create charts and meaningful data representations.',
  },
  {
    title: 'Dashboards',
    description:
      'Build and publish interactive analytics dashboards.',
  },
];

export const Component = () => {
  usePageTitle('Overview');

  return (
    <div className="overview-page">
      <header className="page-heading">
        <p className="eyebrow">
          Application foundation
        </p>

        <h1>Overview</h1>

        <p className="muted-text">
          Welcome to Excel Dashboard.
        </p>
      </header>

      <section className="notice">
        <h2>Development preview</h2>

        <p>
          The application shell is ready.
          Authentication, workspaces, spreadsheet imports,
          and analytics will be introduced in subsequent
          implementation phases.
        </p>
      </section>

      <section
        className="overview-section"
        aria-labelledby="capabilities-heading"
      >
        <h2 id="capabilities-heading">
          Platform capabilities
        </h2>

        <div className="capability-grid">
          {CAPABILITIES.map((capability) => (
            <article
              key={capability.title}
              className="capability-card"
            >
              <span className="status-label">
                Planned
              </span>

              <h3>{capability.title}</h3>

              <p>{capability.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
