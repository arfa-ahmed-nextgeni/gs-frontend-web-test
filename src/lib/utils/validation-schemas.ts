import dayjs from "dayjs";
import * as z from "zod";

import { StoreCode } from "@/lib/constants/i18n";
import { REGEX } from "@/lib/constants/regex";
import { isValidPhoneNumber } from "@/lib/utils/country";

export const booleanSchema = z.coerce.boolean() as z.ZodBoolean;

export const personNameSchema = z
  .string()
  .trim()
  .min(1, "requiredField")
  .regex(REGEX.NO_SPECIAL_CHARS, { message: "specialCharsNotAllowed" })
  .max(50, "maxFiftyCharsAllowed");

export const mustBeTrueSchema = z.coerce
  .boolean()
  .refine((val) => val === true, {
    message: "requiredField",
  });

export const mandatoryNameSchema = z
  .string()
  .trim()
  .min(1, "requiredField")
  .regex(REGEX.NO_SPECIAL_CHARS, {
    message: "specialCharsNotAllowed",
  })
  .max(50, "maxFiftyCharsAllowed");

export const madatoryEmailSchema = z
  .string()
  .trim()
  .min(1, "requiredField")
  .email("invalidEmail");

export const mandatoryDateOfBirthSchema = z
  .string()
  .min(1, "requiredField")
  .refine((date) => dayjs(date).isValid(), "invalidDate")
  .refine(
    (date) =>
      dayjs(date).isBefore(dayjs()) || dayjs(date).isSame(dayjs(), "day"),
    "notFutureDate"
  );

export const mandatoryStringSchema = z.string().trim().min(1, "requiredField");

export const optionalStringSchema = z.string();

export const numberSchema = z.number();

export const optionalEmailSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      // Allow empty string
      if (val === "") return true;
      // Validate email format if not empty
      return z.string().email().safeParse(val).success;
    },
    {
      message: "invalidEmail",
    }
  );

export const postalCodeSchema = z
  .string()
  .min(1, "requiredField")
  .regex(REGEX.POSTAL_CODE, "invalidPostalCode")
  .trim();

export const selectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const phoneNumberOptionalSchema = z
  .object({
    countryCode: z.string(),
    number: z.string(),
  })
  .optional();

export const phoneNumberSchema = (storeCode: StoreCode) =>
  z
    .object({
      countryCode: z.string().refine((data) => {
        const cleanCountryCode = data.replace(/^\+/, "");
        if (cleanCountryCode.length === 0 || !/^\d+$/.test(cleanCountryCode)) {
          return false;
        }
        return true;
      }, "requiredField"),
      number: z.string().min(1, "requiredField"),
    })
    .superRefine((data, ctx) => {
      const cleanCountryCode = data.countryCode.replace(/^\+/, "");

      if (
        data.number &&
        data.number.trim().length > 0 &&
        cleanCountryCode.length > 0
      ) {
        try {
          const cleanNumber = data.number.replace(/\s+/g, "");
          if (!isValidPhoneNumber(cleanNumber, data.countryCode, storeCode)) {
            ctx.addIssue({
              code: "custom",
              message: "invalidPhoneNumber",
              path: ["number"],
            });
          }
        } catch (error) {
          console.error(error);
          ctx.addIssue({
            code: "custom",
            message: "invalidPhoneNumber",
            path: ["number"],
          });
        }
      }
    });

const BLOCKED_CITIES = [
  "Greenland",
  "Faroe Islands",
  "French Guiana",
  "La Réunion",
  "Sint Maarten",
  "Sint Eustatitius",
  "Aruba",
  "Bonaire",
  "Curacao",
  "Jan Mayen",
  "Svalbard",
  "Madeira Island",
  "Azores Island",
  "Ceuta",
  "Melilla",
  "Canary Islands",
  "Isle of Gotland",
  "Isle of Man",
  "Guernsey",
  "Jersey",
  "Anguilla",
  "Bermuda",
  "Cayman Islands",
  "Falkland Islands",
  "Gibraltar",
  "Montserrat",
  "Turks and Caicos Islands",
  "Saint Helena",
  "Virgin Islands",
  "Velika Gorica",
  "Karlovac",
  "Sisak",
  "Šibenik",
  "Dubrovnik",
  "Bjelovar",
  "Kaštela",
  "Samobor",
  "Vinkovci",
  "Koprivnica",
  "Vukovar",
  "Đakovo",
  "Čakovec",
  "Požega",
  "Zaprešić",
  "Sinj",
  "Petrinja",
  "Solin",
  "Kutina",
  "Virovitica",
  "Križevci",
  "Sveta Nedelja",
  "Dugo Selo",
  "Metković",
  "Poreč",
  "Našice",
  "Sveti Ivan Zelina",
  "Jastrebarsko",
  "Knin",
  "Omiš",
  "Vrbovec",
  "Ivanić-Grad",
  "Rovinj",
  "Nova Gradiška",
  "Makarska",
  "Ogulin",
  "Ivanec",
  "Slatina",
  "Umag",
  "Novska",
  "Trogir",
  "Novi Marof",
  "Gospić",
  "Krapina",
  "Županja",
  "Opatija",
  "Labin",
  "Daruvar",
  "Valpovo",
  "Pleternica",
  "Crikvenica",
  "Duga Resa",
  "Benkovac",
  "Imotski",
  "Belišće",
  "Kastav",
  "Garešnica",
  "Ploče",
  "Beli Manastir",
  "Otočac",
  "Donji Miholjac",
  "Trilj",
  "Glina",
  "Zabok",
  "Vodice",
  "Pazin",
  "Pakrac",
  "Ludbreg",
  "Đurđevac",
  "Lepoglava",
  "Bakar",
  "Čazma",
  "Mali Lošinj",
  "Rab",
  "Ozalj",
  "Prelog",
  "Drniš",
  "Senj",
  "Ilok",
  "Pregrada",
  "Vrgorac",
  "Grubišno Polje",
  "Varaždinske Toplice",
  "Otok",
  "Mursko Središće",
  "Krk",
  "Lipik",
  "Kutjevo",
  "Vodnjan",
  "Oroslavje",
  "Buzet",
  "Zlatar",
  "Delnice",
  "Donja Stubica",
  "Korčula",
  "Biograd na Moru",
  "Orahovica",
  "Novi Vinodolski",
  "Buje",
  "Slunj",
  "Vrbovsko",
  "Kraljevica",
  "Obrovac",
  "Novigrad",
  "Hvar",
  "Supetar",
  "Pag",
  "Čabar",
  "Skradin",
  "Novalja",
  "Opuzen",
  "Klanjec",
  "Cres",
  "Hrvatska Kostajnica",
  "Nin",
  "Stari Grad",
  "Vrlika",
  "Vis",
  "Komiža",
] as const;

// Normalize for case-insensitive + accent-insensitive matching
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();

const blockedSet = new Set(BLOCKED_CITIES.map(normalize));

export const mandatoryCitySchema = z
  .string()
  .trim()
  .min(1, "requiredField")
  .refine((city) => !blockedSet.has(normalize(city)), {
    message: "invalidCity",
  });
