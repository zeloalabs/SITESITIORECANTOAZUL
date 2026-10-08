import { getCliClient } from "sanity/cli";

const client = getCliClient();

async function main() {
  console.log("Updating siteSettings...");
  await client
    .patch("siteSettings")
    .set({
      beds24PropertyId: 357738,
      beds24Referer: "site-v2",
    })
    .commit();

  const accommodations = [
    {
      _id: "accommodation-agata",
      _type: "accommodation",
      name: "Ágata",
      slug: { _type: "slug", current: "agata" },
      beds24RoomId: 737422,
      ocupacaoReferencia: 2,
    },
    {
      _id: "accommodation-mirante",
      _type: "accommodation",
      name: "Mirante",
      slug: { _type: "slug", current: "mirante" },
      beds24RoomId: 737427,
      ocupacaoReferencia: 2,
    },
    {
      _id: "accommodation-doce-recanto",
      _type: "accommodation",
      name: "Doce Recanto",
      slug: { _type: "slug", current: "doce-recanto" },
      beds24RoomId: 737430,
      ocupacaoReferencia: 2,
    },
    {
      _id: "accommodation-domo-estelar",
      _type: "accommodation",
      name: "Domo Estelar",
      slug: { _type: "slug", current: "domo-estelar" },
      beds24RoomId: 737429,
      ocupacaoReferencia: 2,
    },
    {
      _id: "accommodation-celeiro",
      _type: "accommodation",
      name: "Celeiro",
      slug: { _type: "slug", current: "celeiro" },
      beds24RoomId: 737433,
      ocupacaoReferencia: 11,
    },
    {
      _id: "accommodation-chale-para-grupos",
      _type: "accommodation",
      name: "Chalé para Grupos",
      slug: { _type: "slug", current: "chale-para-grupos" },
      beds24RoomId: 737435,
      ocupacaoReferencia: 6,
    },
  ];

  for (const acc of accommodations) {
    console.log(`Creating/updating ${acc.name} (${acc._id})...`);
    await client.createOrReplace(acc);
  }

  console.log("Done! Accommodations and siteSettings successfully updated in Sanity.");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
