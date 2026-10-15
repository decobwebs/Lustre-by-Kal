import type { StaticImageData } from "next/image";

import airFryer from "@/assets/products/air-fryer.jpg";
import blender from "@/assets/products/blender.jpg";
import brandedMug from "@/assets/products/branded-mug.jpg";
import cap from "@/assets/products/cap.jpg";
import candleSet from "@/assets/products/candle-set-aroma-home.jpg";
import coffeeMaker from "@/assets/products/coffee-maker.jpg";
import deskCalendar from "@/assets/products/desk-calendar.jpg";
import diffuser from "@/assets/products/diffuser-nedens.jpg";
import garmentSteamer from "@/assets/products/garment-steamer.jpg";
import insulatedMugSet from "@/assets/products/insulated-mug-set.jpg";
import giftTag from "@/assets/products/gift-tag.jpg";
import hairClipper from "@/assets/products/hair-clipper.jpg";
import juice from "@/assets/products/juice-chamdor.jpg";
import kettle from "@/assets/products/kettle.jpg";
import notebookPenSet from "@/assets/products/notebook-pen-set.jpg";
import massageGun from "@/assets/products/massage-gun.jpg";
import portableBlender from "@/assets/products/portable-blender.jpg";
import smartTumblers from "@/assets/products/smart-tumblers.jpg";
import stanleyCup from "@/assets/products/stanley-cup.jpg";
import steamIron from "@/assets/products/steam-iron.jpg";
import teaAlokozay from "@/assets/products/tea-alokozay.jpg";
import towel from "@/assets/products/towel.jpg";
import teaBigelow from "@/assets/products/tea-bigelow.jpg";
import teaEminent from "@/assets/products/tea-eminent.jpg";
import flask from "@/assets/products/vacuum-flask-set.jpg";
import wine from "@/assets/products/wine-nederburg.jpg";

/* ------------------------------------------------------------------ */
/* Product photos                                                      */
/* ------------------------------------------------------------------ */

export type Photo = {
  src: StaticImageData;
  name: string;
  detail: string;
  alt: string;
  /** Hampers whose contents list includes this item. */
  in?: HamperSlug[];
};

export type HamperSlug = "radiant-lux" | "grace-lux" | "bloom-lux";
const ALL: HamperSlug[] = ["radiant-lux", "grace-lux", "bloom-lux"];

const photoData = {
  wine: { src: wine, name: "Red wine", detail: "Nederburg Cabernet Sauvignon", alt: "Bottle of Nederburg Classic Cabernet Sauvignon", in: ["radiant-lux", "bloom-lux"] },
  juice: { src: juice, name: "Sparkling grape juice", detail: "Chamdor, alcohol-free", alt: "Red and white Chamdor sparkling grape juice bottles", in: ALL },
  teaEminent: { src: teaEminent, name: "Assorted tea", detail: "Eminent Ceylon tea", alt: "Eminent assorted tea box with fruit flavours", in: ALL },
  teaAlokozay: { src: teaAlokozay, name: "Tea collection", detail: "Alokozay wooden tea box", alt: "Black wooden Alokozay tea box with coloured tea sachets", in: ALL },
  teaBigelow: { src: teaBigelow, name: "Tea variety pack", detail: "Bigelow, eight flavours", alt: "Bigelow variety pack of black, green and herbal tea", in: ALL },
  diffuser: { src: diffuser, name: "Reed diffuser", detail: "Nedens, vanilla", alt: "Nedens vanilla reed diffuser beside its box", in: ALL },
  candleSet: { src: candleSet, name: "Candle & diffuser set", detail: "Aroma Home", alt: "Aroma Home scented candle and reed diffuser in black glass", in: ["radiant-lux", "bloom-lux"] },
  massageGun: { src: massageGun, name: "Massage gun", detail: "With interchangeable heads", alt: "White massage gun with a set of attachment heads", in: ALL },
  flask: { src: flask, name: "Vacuum flask set", detail: "Flask with two cups", alt: "Pink vacuum flask with two matching cups in a gift box", in: ALL },
  steamIron: { src: steamIron, name: "Steam iron", detail: "Winning Star", alt: "White Winning Star steam iron on cream fabric", in: ["radiant-lux", "grace-lux"] },
  kettle: { src: kettle, name: "Electric kettle", detail: "Stainless steel", alt: "Stainless steel electric kettle", in: ["grace-lux", "bloom-lux"] },
  hairClipper: { src: hairClipper, name: "Hair clipper", detail: "Feiyba cordless", alt: "Black Feiyba hair clipper with guide combs and box", in: ["grace-lux"] },
  airFryer: { src: airFryer, name: "Air fryer", detail: "With stacking rack", alt: "Black air fryer with a stacking rack of fried chicken", in: ["radiant-lux"] },
  coffeeMaker: { src: coffeeMaker, name: "Coffee maker", detail: "HiBrew, six cups", alt: "Black HiBrew drip coffee maker with glass jug" },
  garmentSteamer: { src: garmentSteamer, name: "Garment steamer", detail: "Handheld", alt: "Black handheld garment steamer" },
  blender: { src: blender, name: "Blender", detail: "Countertop, glass jug", alt: "Black countertop blender with a glass jug" },
  portableBlender: { src: portableBlender, name: "Portable blender", detail: "Rechargeable", alt: "Pink rechargeable portable blender with fruit" },
  brandedMug: { src: brandedMug, name: "Branded mug", detail: "Lustre by Kal", alt: "White Lustre by Kal mug on a wooden table", in: ALL },
  stanleyCup: { src: stanleyCup, name: "Stanley cup", detail: "Insulated tumbler, Lustre by Kal", alt: "Tan insulated Lustre by Kal tumbler with handle", in: ALL },
  giftTag: { src: giftTag, name: "Gift card", detail: "Lustre by Kal, star-trimmed", alt: "Scalloped Lustre by Kal gift card with gold star trim", in: ["radiant-lux", "grace-lux"] },
  deskCalendar: { src: deskCalendar, name: "Desk calendar", detail: "2027, Lustre by Kal", alt: "Lustre by Kal 2027 desk calendar" },
  smartTumblers: { src: smartTumblers, name: "Smart tumblers", detail: "Digital temperature display, pair", alt: "Two Lustre by Kal tumblers with a digital temperature display" },
  cap: { src: cap, name: "Branded cap", detail: "Embroidered, Lustre by Kal", alt: "White cap embroidered with the Lustre by Kal logo" },
  notebookPenSet: { src: notebookPenSet, name: "Notebook & pen set", detail: "Lustre by Kal", alt: "Textured notebook and pen set branded Lustre by Kal" },
  towel: { src: towel, name: "Embroidered towel", detail: "Lustre by Kal", alt: "White towel embroidered with the Lustre by Kal logo" },
  // No Lustre by Kal branding visible on this one — it's a generic supplier photo, not a confirmed product. Confirm before relying on it.
  insulatedMugSet: { src: insulatedMugSet, name: "Insulated mug set", detail: "Set of 3", alt: "Set of three insulated mugs in blue, grey and red" },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photoData;
export const photos: Record<PhotoKey, Photo> = photoData;

/* ------------------------------------------------------------------ */
/* Hampers                                                             */
/* ------------------------------------------------------------------ */

export type ContentLine = { name: string; qty?: number };
export type ContentGroup = { title: string; lines: ContentLine[] };

export type Hamper = {
  kind: "hamper";
  ref: string;
  slug: HamperSlug;
  name: string;
  tier: string;
  price: number;
  audience: string;
  summary: string;
  groups: ContentGroup[];
  /** Photos of items in this hamper, strongest first. */
  photos: PhotoKey[];
  /** A photo of the packed hamper. Add one per hamper when Kal supplies it. */
  image?: StaticImageData;
};

export const hampers: Hamper[] = [
  {
    kind: "hamper",
    ref: "LBK-RL01",
    slug: "radiant-lux",
    name: "Radiant Lux",
    tier: "Premium",
    price: 360_000,
    audience: "Management staff, clients and partners",
    summary:
      "Our premium hamper, built around a full-size air fryer. Wine or sparkling juice, a massage gun, a duvet set and a pantry of treats, packed in a rattan gift box with ribbon.",
    groups: [
      { title: "Drinks", lines: [{ qty: 2, name: "Premium wine or sparkling juice" }] },
      {
        title: "Food",
        lines: [
          { qty: 2, name: "Imported chocolates and cookies" },
          { qty: 3, name: "Assorted tea bags" },
          { name: "Instant coffee" },
          { name: "Nutella" },
          { name: "Cake mix" },
          { name: "Basmati rice, 1 kg" },
          { name: "Cooking oil, 3 kg" },
        ],
      },
      {
        title: "Gadgets and home",
        lines: [
          { name: "Air fryer, with stacking rack" },
          { name: "Massage gun" },
          { name: "Stanley cup" },
          { name: "Power bank" },
          { name: "Vacuum flask" },
          { name: "Pressing iron" },
          { name: "Duvet set" },
        ],
      },
      { title: "Scent", lines: [{ qty: 2, name: "Scented candles or diffusers" }] },
      {
        title: "Finishing",
        lines: [{ name: "Branded mug" }, { name: "Custom greeting card" }, { name: "Rattan gift box and ribbon" }],
      },
    ],
    photos: ["wine", "airFryer", "massageGun", "candleSet", "teaAlokozay", "flask", "steamIron", "stanleyCup", "brandedMug", "giftTag"],
  },
  {
    kind: "hamper",
    ref: "LBK-GL01",
    slug: "grace-lux",
    name: "Grace Lux",
    tier: "Mid-tier",
    price: 260_000,
    audience: "General staff appreciation",
    summary:
      "Alcohol-free and generous. An electric kettle, a massage gun, a hair clipper, a body care set and everyday pantry favourites, finished with a personal thank-you card.",
    groups: [
      { title: "Drinks", lines: [{ qty: 2, name: "Non-alcoholic drink or sparkling juice" }] },
      {
        title: "Food",
        lines: [
          { name: "Imported chocolates and cookies" },
          { name: "Luxury assorted tea bags" },
          { name: "Instant coffee" },
          { name: "Nutella" },
          { name: "Oats" },
          { name: "Pasta" },
          { name: "Basmati rice, 1 kg" },
          { name: "Cooking oil, 3 kg" },
        ],
      },
      {
        title: "Gadgets and home",
        lines: [
          { name: "Massage gun" },
          { name: "Stanley cup" },
          { name: "Power bank" },
          { name: "Vacuum flask" },
          { name: "Pressing iron" },
          { name: "Electric kettle" },
          { name: "Hair clipper" },
        ],
      },
      { title: "Scent and care", lines: [{ name: "Diffuser" }, { name: "Body care or fragrance set" }] },
      {
        title: "Finishing",
        lines: [{ name: "Branded mug" }, { name: "Personalised thank-you card" }, { name: "Rattan gift box and ribbon wrap" }],
      },
    ],
    photos: ["juice", "kettle", "hairClipper", "diffuser", "teaEminent", "massageGun", "stanleyCup", "brandedMug", "giftTag"],
  },
  {
    kind: "hamper",
    ref: "LBK-BL01",
    slug: "bloom-lux",
    name: "Bloom Lux",
    tier: "Affordable",
    price: 160_000,
    audience: "Loyal customers, business partners and suppliers",
    summary:
      "A warm thank-you for the people you do business with. Wine or sparkling juice, an electric kettle, a humidifier, a scented candle set and sweet treats.",
    groups: [
      { title: "Drinks", lines: [{ name: "Premium wine or sparkling juice" }] },
      {
        title: "Food",
        lines: [
          { name: "Imported chocolates and cookies" },
          { name: "Premium snacks" },
          { name: "Assorted tea bags" },
          { name: "Instant coffee" },
          { name: "Nutella" },
          { name: "Cake mix" },
          { name: "Pasta" },
          { name: "Bottled peanuts" },
        ],
      },
      {
        title: "Gadgets and home",
        lines: [
          { name: "Massage gun" },
          { name: "Stanley cup" },
          { name: "Power bank" },
          { name: "Vacuum flask" },
          { name: "Electric kettle" },
          { name: "Humidifier" },
        ],
      },
      { title: "Scent", lines: [{ name: "Scented candles or diffuser set" }] },
      { title: "Finishing", lines: [{ name: "Branded mug" }] },
    ],
    photos: ["candleSet", "kettle", "teaBigelow", "juice", "flask", "massageGun", "stanleyCup", "brandedMug"],
  },
];

/* ------------------------------------------------------------------ */
/* Add-ons: appliances a company can add to any hamper                 */
/* ------------------------------------------------------------------ */

export type AddOn = {
  kind: "addon";
  ref: string;
  slug: string;
  name: string;
  detail: string;
  photo: PhotoKey;
  /** Leave undefined until Kal sets a price; the site then says "Price on request". */
  price?: number;
};

export const addOns: AddOn[] = [
  { kind: "addon", ref: "LBK-AD01", slug: "air-fryer", name: "Air fryer", detail: "With stacking rack", photo: "airFryer" },
  { kind: "addon", ref: "LBK-AD02", slug: "coffee-maker", name: "Coffee maker", detail: "HiBrew, six cups", photo: "coffeeMaker" },
  { kind: "addon", ref: "LBK-AD03", slug: "blender", name: "Blender", detail: "Countertop, glass jug", photo: "blender" },
  { kind: "addon", ref: "LBK-AD04", slug: "portable-blender", name: "Portable blender", detail: "Rechargeable", photo: "portableBlender" },
  { kind: "addon", ref: "LBK-AD05", slug: "garment-steamer", name: "Garment steamer", detail: "Handheld", photo: "garmentSteamer" },
  { kind: "addon", ref: "LBK-AD06", slug: "desk-calendar", name: "Desk calendar", detail: "2027, Lustre by Kal", photo: "deskCalendar" },
  { kind: "addon", ref: "LBK-AD07", slug: "smart-tumblers", name: "Smart tumblers", detail: "Digital temperature display, pair", photo: "smartTumblers" },
  { kind: "addon", ref: "LBK-AD08", slug: "cap", name: "Branded cap", detail: "Embroidered, Lustre by Kal", photo: "cap" },
  { kind: "addon", ref: "LBK-AD09", slug: "notebook-pen-set", name: "Notebook & pen set", detail: "Lustre by Kal", photo: "notebookPenSet" },
  { kind: "addon", ref: "LBK-AD10", slug: "towel", name: "Embroidered towel", detail: "Lustre by Kal", photo: "towel" },
  { kind: "addon", ref: "LBK-AD11", slug: "insulated-mug-set", name: "Insulated mug set", detail: "Set of 3", photo: "insulatedMugSet" },
];

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

export type CatalogueItem = Hamper | AddOn;

const byRef = new Map<string, CatalogueItem>([...hampers, ...addOns].map((item) => [item.ref, item]));

export const findItem = (ref: string) => byRef.get(ref);
export const findHamper = (slug: string) => hampers.find((h) => h.slug === slug);
export const lowestPrice = Math.min(...hampers.map((h) => h.price));

/**
 * Every photo we hold for a hamper: the chosen lead photos first, then the rest
 * of its contents. The cards rotate through this so a visitor sees all of them.
 */
export function hamperGallery(hamper: Hamper): PhotoKey[] {
  const rest = (Object.keys(photos) as PhotoKey[]).filter(
    (key) => photos[key].in?.includes(hamper.slug) && !hamper.photos.includes(key),
  );
  return [...hamper.photos, ...rest];
}

/** All product photos, for the scrolling strip on the home page. */
export const allProductPhotos = (Object.keys(photos) as PhotoKey[]).filter((key) => photos[key].in?.length);

/**
 * How grand a hamper should look, worked out from its price rather than set by
 * hand: the dearest hamper is "premium", the cheapest "entry". Add or reprice a
 * hamper and the cards re-rank themselves.
 */
export type HamperLevel = "premium" | "middle" | "entry";

export function hamperLevel(hamper: Hamper): HamperLevel {
  const ranked = [...hampers].sort((a, b) => b.price - a.price);
  const place = ranked.findIndex((h) => h.slug === hamper.slug);
  if (place === 0) return "premium";
  if (place === ranked.length - 1) return "entry";
  return "middle";
}
