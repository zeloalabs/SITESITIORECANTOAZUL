// Todas as consultas GROQ do site. As mesmas rodam contra o Sanity e, no fallback, contra a seed (groq-js).
const IMG = `{ "ref": asset._ref, alt, hotspot, "dims": asset->metadata.dimensions{ width, height } }`;

const STAY_CARD = `
  "slug": slug.current, name, tagline, capacityLabel,
  "cover": coverImage ${IMG},
  "first": gallery[0] ${IMG}
`;

export const SITE_QUERY = `{
  "settings": *[_type == "siteSettings"][0]{
    siteName, tagline, place, email, instagramUrl, address, mapsUrl, mapsEmbedUrl, galleryInitial,
    seoTitle, seoDescription, "seoImage": seoImage ${IMG}, beds24PropertyId, beds24Referer, bookingUrlOverride
  },
  "contacts": *[_type == "whatsappContact"] | order(order asc){
    key, label, message, "number": coalesce(number, numberFrom->number)
  },
  "groups": *[_type == "accommodationGroup"] | order(order asc){
    "id": slug.current, name, intro, showOnHome, "whatsappKey": whatsapp->key,
    "stays": *[_type == "accommodation" && references(^._id)] | order(order asc){ ${STAY_CARD} }
  }
}`;

export const ACCOMMODATION_QUERY = `*[_type == "accommodation" && slug.current == $slug][0]{
  ${STAY_CARD},
  detail, highlights, amenities, capacity, minAdults, maxAdults, maxChildren, maxGuests, guestHint,
  beds24RoomId, seoTitle, seoDescription,
  "groupId": group->slug.current, "groupName": group->name,
  "whatsappKey": coalesce(whatsappOverride->key, group->whatsapp->key),
  "gallery": gallery[]{ "ref": asset._ref, alt, hotspot, "dims": asset->metadata.dimensions{ width, height } },
  "extras": *[_type == "extra" && (references(^._id) || references(^.group._ref))] | order(order asc){
    "id": _id, name, description, "image": image ${IMG}
  }
}`;

export const ACCOMMODATION_SLUGS_QUERY = `*[_type == "accommodation" && defined(slug.current)].slug.current`;

const SECTIONS = `sections[]{
  _key, _type, title, lead, text, note, caption, linkLabel, linkHref, whatsappKey, whatsappLabel, onlyHome, body, eyebrow, showSearch, facts,
  "image": image ${IMG},
  "reviewId": review._ref,
  _type == "intro" => { "photos": photos[]{ "image": image ${IMG}, caption } },
  _type == "experienciasBloco" => { "photos": photos[] ${IMG} },
  _type == "blocosDestaque" => { "tiles": tiles[]{ _key, title, text, href, "image": image ${IMG} } }
}`;

export const PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, seoTitle, seoDescription, ${SECTIONS}
}`;

export const EXTRAS_QUERY = `*[_type == "extra"] | order(order asc){ "id": _id, name, description, "image": image ${IMG} }`;
export const EXPERIENCES_QUERY = `*[_type == "experience"] | order(order asc){ "id": _id, name, text, showOnHome, "image": image ${IMG} }`;
export const FAQS_QUERY = `*[_type == "faq"] | order(order asc){ "id": _id, question, answer }`;
export const POLICIES_QUERY = `*[_type == "policy"] | order(order asc){ "id": _id, "anchor": anchor.current, title, body }`;
export const REVIEWS_QUERY = `*[_type == "review" && approved == true] | order(featured desc){ "id": _id, quote, author, source, when, featured }`;
export const PAGE_SLUGS_QUERY = `*[_type == "page" && defined(slug.current)].slug.current`;
