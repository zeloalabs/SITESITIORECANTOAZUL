import type { FotoCheiaSection } from "@/lib/content/types";
import { Photo } from "@/components/site/fx";
import { photo } from "@/components/site/util";

export function FotoCheia({ section }: { section: FotoCheiaSection }) {
  return (
    <figure className="pd2-break">
      <Photo {...photo(section.image)} />
      {section.caption ? <figcaption>{section.caption}</figcaption> : null}
    </figure>
  );
}
