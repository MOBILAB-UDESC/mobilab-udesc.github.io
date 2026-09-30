import React, {useState} from "react";

export function selectPublications(publications, type, year) {
  return publications
    .filter((publication) =>
      (!type || publication.type === type) &&
      (!year || String(publication.year) === year))
    .sort((a, b) => b.year - a.year);
}

export default function Publications({publications}) {
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const types = [...new Set(publications.map((publication) => publication.type))].sort();
  const years = [...new Set(publications.map((publication) => publication.year))].sort((a, b) => b - a);
  const visible = selectPublications(publications, type, year);

  return (
    <div className="publications">
      <div className="publications__filters">
        <label>
          Type
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">All types</option>
            {types.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>
          Year
          <select value={year} onChange={(event) => setYear(event.target.value)}>
            <option value="">All years</option>
            {years.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>
      <p className="academic-meta" role="status">
        {visible.length === 0 ? "No publications match these filters." : `${visible.length} of ${publications.length} publications`}
      </p>
      <ul className="publications__list">
        {visible.map((publication) => (
          <li key={publication.doi}>
            <p>
              [{publication.year}]{" "}
              <a href={`https://doi.org/${publication.doi}`}>{publication.title}</a>.{" "}
              <em>{publication.venue}</em>, {publication.reference}.
              <br />
              {publication.authors}.
            </p>
            <p className="academic-meta">{publication.note}</p>
            <div className="publications__links">
              <details className="publications__citation">
                <summary aria-label={`Cite ${publication.title}`}>Cite</summary>
                <pre><code>{publication.bibtex}</code></pre>
              </details>
              <a href={`https://doi.org/${publication.doi}`}>DOI</a>
              {publication.code && <a href={publication.code}>Code</a>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
