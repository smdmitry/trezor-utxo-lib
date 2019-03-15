/* @flow */

import BigInteger from 'bigi';

declare class $npm$ecurve$Curve {
    p: BigInteger;
    a: BigInteger;
    b: BigInteger;
    G: $npm$ecurve$Point;
    n: BigInteger;
    h: BigInteger;

    constructor(
        p: BigInteger,
        a: BigInteger,
        b: BigInteger,
        Gx: BigInteger,
        Gy: BigInteger,
        n: BigInteger,
        h: BigInteger
    ): void;

    infinity: $npm$ecurve$Point;
    isInfinity(point: $npm$ecurve$Point): boolean;
    validate(a: $npm$ecurve$Point): boolean;
    isOnCurve(a: $npm$ecurve$Point): boolean;
    pointFromX(odd: boolean, x: $npm$ecurve$Point): $npm$ecurve$Point;
}

declare class $npm$ecurve$Point {
    constructor(
        curve: $npm$ecurve$Curve,
        x: BigInteger,
        y: BigInteger,
        z: BigInteger
    ): void;

    x: BigInteger;
    y: BigInteger;
    z: BigInteger;
  
    zInv: BigInteger;
    affineX: BigInteger;
    affineY: BigInteger;

    static fromAffine(
        curve: $npm$ecurve$Curve,
        x: BigInteger,
        y: BigInteger
    ): $npm$ecurve$Point;
    equals(other: $npm$ecurve$Point): boolean;
    negate(): $npm$ecurve$Point;
    add(other: $npm$ecurve$Point): $npm$ecurve$Point;
    twice(): $npm$ecurve$Point;
    multiply(k: BigInteger): $npm$ecurve$Point;
    multiplyTwo(
        j: BigInteger,
        x: $npm$ecurve$Point,
        k: BigInteger
    ): $npm$ecurve$Point;

    static decodeFrom(
        curve: $npm$ecurve$Curve,
        buffer: Buffer
    ): $npm$ecurve$Point;
    getEncoded(compressed: boolean): Buffer;

    toString(): string;
}
  
declare module 'ecurve' {
    declare var Point: typeof $npm$ecurve$Point;
    declare var Curve: typeof $npm$ecurve$Curve;
    declare function getCurveByName(name: string): ?Curve;
}