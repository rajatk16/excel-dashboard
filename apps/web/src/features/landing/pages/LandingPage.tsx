import { Link } from "react-router-dom";

import { ROUTE_PATHS } from "@/app/router/routePaths";
import { usePageTitle } from "@/lib/utils/pageTitle"

const FEATURES = [
  {
    title: 'Import spreadsheets',
    description: 'Upload Excel and CSV files and prepare structured datasets.',
    label: '01'
  },
  {
    title: 'Explore and visualize',
    description: 'Build analytical queries and turn your data into meaningful charts.',
    label: '02'
  },
  {
    title: 'Build dashboards',
    description: 'Compose interacive dashboards and share insights with your team.',
    label: '03'
  }
]

export const Component = () => {
  usePageTitle();

  return (
    <>
      <section className="hero container">
        <p className="eyebrow">
          Speadsheet analytics
        </p>

        <h1>Turn spreadsheets into meaningful dashboards</h1>
        <p className="hero-description">
          Upload, explore, visualize, and share your data
          in one collaborative workspace.
        </p>
        <div className="button-group hero-actions">
          <Link
            to={ROUTE_PATHS.REGISTER}
            className="button button-primary"
          >
            Get started
          </Link>

          <Link
            to={ROUTE_PATHS.APP}
            className="button button-secondary"
          >
            Explore app
          </Link>
        </div>
      </section>

      <section
        className="features-section container"
        aria-labelledby="features-heading"
      >
        <div className="section-heading">
          <p className="eyebrow">How it works</p>

          <h2 id="features-heading">
            From spreadsheets to insights
          </h2>
        </div>

        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="feature-card"
            >
              <span
                className="feature-number"
                aria-hidden="true"
              >
                {feature.label}
              </span>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
