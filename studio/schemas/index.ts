import { accommodation } from "./accommodation";
import { accommodationGroup } from "./accommodationGroup";
import { experience } from "./experience";
import { extra } from "./extra";
import { faq } from "./faq";
import { page } from "./page";
import { policy } from "./policy";
import { review } from "./review";
import { siteSettings } from "./siteSettings";
import { whatsappContact } from "./whatsappContact";
import { sectionTypes } from "./sections";

export const schemaTypes = [siteSettings, whatsappContact, accommodationGroup, accommodation, extra, experience, faq, review, policy, page, ...sectionTypes];
