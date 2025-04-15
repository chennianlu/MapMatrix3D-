import * as CORE_CONST from '../../src/constants'
import * as BusinessObjects from './object'

const CONST = {
    CLASS_ID: {
        Base: BusinessObjects.BaseObject.type,
        Geometry: BusinessObjects.Geometry.type,
        Widget: BusinessObjects.Widget.type,
        Cabinet: BusinessObjects.Cabinet.type,
        BatteryPack: BusinessObjects.BatteryPack.type,
        BatteryCluster: BusinessObjects.BatteryCluster.type,
        Building: BusinessObjects.BuildingObject.type,
        VisualObject: BusinessObjects.VisualObject.type
    }

}
export const EnerV3D_CONST = {
    ...BusinessObjects,
    ...CORE_CONST,
    ...CONST
}