import { RopeItem, Unit } from "../types/types";

export function unitToMeters(value: number, unit: Unit): number {
  switch (unit) {
    case Unit.Feet:
      return value / 3.28084;
    case Unit.Metres:
      return value;
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
}


export function getRopeWeightInGrams(rope: RopeItem): number {
    if(!rope.Length) return 0;
    const lengthInMeters = unitToMeters(rope.Length, rope.Unit as Unit);

    return lengthInMeters * rope.WeightGrams!
}