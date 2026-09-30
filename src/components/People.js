import React from "react";
import {usePluginData} from "@docusaurus/useGlobalData";

const links = {
  linkedin: "LinkedIn",
  lattes: "Lattes",
  github: "GitHub",
  website: "Website",
  google_scholar: "Google Scholar",
  orcid: "ORCID",
};

const icons = {
  linkedin: <path fill="currentColor" fillRule="evenodd" d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM5 9v10h3V9Zm1.5-4.7a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM10 9v10h3v-5.3c0-1.4.5-2.2 1.7-2.2 1.1 0 1.3.9 1.3 2.2V19h3v-6c0-2.6-1.2-4.2-3.5-4.2-1.1 0-2 .5-2.6 1.4V9Z" />,
  lattes: <text x="2" y="18" fontSize="15" fontWeight="bold" fill="currentColor">CV</text>,
  github: <path fill="currentColor" d="M12 2a10 10 0 0 0-3.2 19.5v-2.2c-2.7.6-3.3-1.2-3.3-1.2-.4-1.1-1-1.4-1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.6 4.9.4.3.7.9.7 1.8v3.1A10 10 0 0 0 12 2Z" />,
  website: <g fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 6h14M5 18h14" /></g>,
  google_scholar: <g fill="currentColor"><path d="m1 9 11-7 11 7-11 7Z" /><path d="M6 14v5q6 5 12 0v-5l-6 4Z" /></g>,
  orcid: <path fill="currentColor" fillRule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM6.5 9v8H8V9Zm.75-3a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM10 7v10h4a5 5 0 0 0 0-10Zm1.5 1.5H14a3.5 3.5 0 0 1 0 7h-2.5Z" />,
};

export default function People() {
  const people = usePluginData("mobilab-people");
  const groups = [...new Set(people.map((person) => person.group))];

  return groups.map((group) => (
    <section className="people-group" key={group}>
      <h2>{group === "PHD" ? "PhD students" : group}</h2>
      <div className="people-grid">
        {people.filter((person) => person.group === group).map((person) => (
          <article className="person" key={person.name}>
            {person.image ? (
              <img className="person__portrait" src={person.image} alt={person.name} width="160" height="160" loading="lazy" />
            ) : (
              <div className="person__portrait person__initials" aria-hidden="true">
                {person.name.split(/\s+/).map((part) => part[0]).join("")}
              </div>
            )}
            <h3><a href={person.website || person.lattes || person.linkedin}>{person.name}</a></h3>
            <p>{person.role}</p>
            <ul className="person__links" aria-label={`Profiles for ${person.name}`}>
              {Object.entries(links).filter(([field]) => person[field]).map(([field, label]) => (
                <li key={field}>
                  <a href={person[field]} aria-label={`${person.name} on ${label}`} title={label}>
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">{icons[field]}</svg>
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  ));
}
