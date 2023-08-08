/**
 * Util for parsing database transformations.
 * 
 * The game.db of Conan Exiles contains raw FTransform coordinates that are used
 * by Unreal Engine 4 to place objects. This coordinates need to be parsed in
 * order to extract useful information from it. This is done by this utility.
 */

/**
 * FTransform representation.
 */
export interface IFTransform {
    rotation: IFQuad;
    translation: IFVector;
    scale: IFVector;
}

/**
 * FVector representation.
 */
export interface IFVector {
    x: number;
    y: number;
    z: number;
}

/**
 * FQuad representation.
 */
export interface IFQuad extends IFVector {
    w: number;
}

/**
 * Helper class to parse FTransform objects.
 */
export class TransformParser {
    /**
     * Parses the given object into a transformation.
     * 
     * This parses the transformation data as defined in the transform1 and
     * transform2 fields in the database.
     * 
     * @param data The data found on the database.
     * @returns The parsed java object structure.
     */
    public parse(data: Buffer): IFTransform {
        if (data.length != 40) throw new Error("Transformation has less than 40 bytes");
        return {
            rotation: {
                w: data.readFloatLE(0),
                x: data.readFloatLE(4),
                y: data.readFloatLE(8),
                z: data.readFloatLE(12)
            },
            translation: {
                x: data.readFloatLE(16),
                y: data.readFloatLE(20),
                z: data.readFloatLE(24)
            },
            scale: {
                x: data.readFloatLE(28),
                y: data.readFloatLE(32),
                z: data.readFloatLE(36)
            }
        }
    }
}

