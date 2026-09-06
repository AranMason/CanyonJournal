import { TFunction } from "i18next"
import { GearItem } from "../types/types"



export function getMakeAndModel(t: TFunction<"translation", undefined>, item: GearItem): string | null {


    if (item.Manufacturer && item.Model) {
        return t('translation:gear.makeAndModel', { make: item.Manufacturer, model: item.Model })
    }
    else if (item.Manufacturer) {
        return item.Manufacturer
    }
    else if (item.Model) {
        return item.Model
    }
    else {
        return null;
    }

}