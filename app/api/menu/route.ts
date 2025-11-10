import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const restaurantFile = path.join(process.cwd(), "data", "menuBase.json");
const pricesFile = path.join(process.cwd(), "data", "menuPrices.json");
const barFile = path.join(process.cwd(), "data", "barMenu.json");

function readJson(file: string) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export async function GET() {
  const restaurant = readJson(restaurantFile);
  const prices = readJson(pricesFile);
  const bar = readJson(barFile);

  // Make sure we always return full structured data
  const restaurantMenu = (restaurant.Restaurant || []).map((item: any) => ({
    ...item,
    price: prices?.Restaurant?.[item.id] || 0,
  }));

  const loungeMenu = (restaurant.Restaurant || []).map((item: any) => ({
    ...item,
    price: prices?.Lounge?.[item.id] || 0,
  }));

  const barMenu = (bar.Bar || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    restaurant: item.restaurant,
    lounge: item.lounge,
    type: item.type || "Alcoholic", // fallback to Alcoholic if missing
  }));

  return NextResponse.json({
    menus: {
      Restaurant: restaurantMenu,
      Lounge: loungeMenu,
      Bar: barMenu,
    },
  });
}