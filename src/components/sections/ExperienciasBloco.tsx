import { getExperiences } from "@/lib/content/data";
import type { Experience, ExperienciasBlocoSection } from "@/lib/content/types";
import { Photo } from "@/components/site/fx";
import { photo } from "@/components/site/util";
import { placeholderImg } from "@/lib/images";

export const pickExperiences = (all: Experience[], onlyHome: boolean) => (onlyHome ? all.filter((e) => e.showOnHome) : all);

export async function ExperienciasBloco({ section }: { section: ExperienciasBlocoSection }) {
  const list = pickExperiences(await getExperiences(), section.onlyHome);
  const photos = section.photos.length ? section.photos : [1, 2, 3].map((n) => placeholderImg(`Experiências — foto ${n}`, { width: 1200, height: 1500 }));
  const id = `exp-${section._key}`;
  return (
    <div className="pd2-light">
      <section className="pd2-exp" aria-labelledby={id}>
        <div className="pd2-exp-text">
          <h2 id={id}>{section.title}</h2>
          {section.lead ? <p className="lead">{section.lead}</p> : null}
          <ul>
            {list.map((e) => (
              <li key={e.id}><b>{e.name}</b><span>{e.text}</span></li>
            ))}
          </ul>
          {section.linkHref && section.linkLabel ? <a className="pd2-link more" href={section.linkHref}>{section.linkLabel}</a> : null}
        </div>
        <div className="pd2-exp-col">
          {photos.slice(0, 3).map((p, i) => (
            <Photo key={i} className={["a", "b", "c"][i]} {...photo(p)} sizes="(min-width: 900px) 30vw, 90vw" />
          ))}
        </div>
      </section>
    </div>
  );
}
