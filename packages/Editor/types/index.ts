
enum Editor_Commands {
    setPosition = 1,
    setRotation,
    setScale,
    setSize,
    setColor,
    setOpacity
}

type Func = (...args: any[]) => any
interface AABB {
    width: number,
    height: number,
    depth: number,
    center: Array<number>
}
type GeometryType = 'plane' | 'box' | 'sphere' | 'cylinder' | 'cone' | 'annulus' | 'circularRing' | 'icosahedron';
