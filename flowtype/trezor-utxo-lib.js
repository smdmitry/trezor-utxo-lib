/* @flow */

import BigInteger from 'bigi';
import { Point, Curve } from 'ecurve';

declare module 'trezor-utxo-lib' {
    declare type Network = {
        messagePrefix: string,
        bip32: {
            public: number,
            private: number,
        },
        pubKeyHash: number,
        scriptHash: number,
        wif: number,
        dustThreshold: number,
        bech32: ?string,
        coin: string,
    }

    declare type Output = {
        script: Buffer,
        value: number,
    };

    declare type Input = {
        script: Buffer,
        hash: Buffer,
        index: number,
        sequence: number,
    };

    declare var address: {
        fromBase58Check(address: string): {hash: Buffer, version: number},
        fromBech32(address: string): {data: Buffer, version: number, prefix: string},
        fromOutputScript(script: Buffer, network?: Network): string,
        toBase58Check(hash: Buffer, version: number): string,
        toOutputScript(address: string, network?: Network): Buffer,
    };

    declare type Stack = Array<Buffer | number>;

    declare var script: {
        scriptHash: {
            input: {
                check: (script: Buffer, allowIncomplete: boolean) => boolean,
                decode: (script: Buffer) => {
                    redeemScriptStack: Stack,
                    redeemScript: Buffer,
                },
                encode: (redeemScriptSig: Buffer, redeemScript: Buffer) => Buffer,
            },
            output: {
                check: (script: Stack) => boolean,
                encode: (scriptHash: Buffer) => Buffer,
                decode: (script: Buffer) => Buffer,
            },
        },
        pubKeyHash: {
            input: {
                check: (script: Buffer, allowIncomplete: boolean) => boolean,
                decode: (script: Buffer) => {
                    signature: Buffer,
                    pubKey: Buffer,
                },
                encode: (signature: Buffer, pubKey: Buffer) => Buffer,
            },
            output: {
                check: (script: Stack) => boolean,
                encode: (pubKeyHash: Buffer) => Buffer,
                decode: (script: Buffer) => Buffer,
            },
        },
        witnessPubKeyHash: {
            input: {
                check: (script: Buffer) => boolean,
            },
            output: {
                check: (script: Stack) => boolean,
                encode: (pubkeyHash: Buffer) => Buffer,
                decode: (buffer: Buffer) => Buffer,
            },
        },
        witnessScriptHash: {
            input: {
                check: (script: Buffer, allowIncomplete: boolean) => boolean,
            },
            output: {
                check: (script: Stack) => boolean,
                encode: (scriptHash: Buffer) => Buffer,
                decode: (script: Buffer) => Buffer,
            },
        },
    };

    declare var crypto: {
        sha1(buffer: Buffer): Buffer,
        sha256(buffer: Buffer): Buffer,
        hash256(buffer: Buffer): Buffer,
        hash160(buffer: Buffer): Buffer,
        ripemd160(buffer: Buffer): Buffer,
    }

    declare type ECPairOptions = {
        compressed?: boolean,
        network?: Network,
    }

    declare class ECPair {
        d: ?BigInteger,
        Q: Point,
        compressed: boolean,
        network: Network,
        getNetwork(): Network,

        constructor(d: ?BigInteger, Q: ?Point, options: ECPairOptions): void,
        getAddress(): string,
        getPublicKeyBuffer(): Buffer,
        static fromPublicKeyBuffer(buffer: Buffer): ECPair,
        verify: (hash: Buffer, signature: ECSignature) => boolean,
        sign(hash: Buffer): Buffer,
        toWIF(): string,
        static fromWIF(string: string, network: Network): ECPair,
        static makeRandom(): ECPair,
    }

    declare class HDNode {
        depth: number,
        parentFingerprint: number,
        index: number,
        keyPair: ECPair,
        chainCode: Buffer,
        static fromBase58(
            str: string,
            networks: ?(Array<Network> | Network)
        ): HDNode,
        derive(index: number): HDNode,
        deriveHardened(index: number): HDNode,
        derivePath(path: string): HDNode,
        toBase58(): string,
        getAddress(): string,
        getFingerprint(): Buffer,
        getIdentifier(): Buffer,
        getNetwork(): Network,
        constructor(keyPair: ECPair, chainCode: Buffer): void,

        static fromBase58(base: string, network?: ?(Network | Array<Network>), skipValidation?: boolean): HDNode,
        static fromSeedHex(seed: string, network?: ?Network): HDNode,
        static fromSeedBuffer(seed: Buffer, network?: ?Network): HDNode,
        getPublicKeyBuffer(): Buffer,

        sign(): ECSignature,
        verify(hash: Buffer, signature: ECSignature): Buffer,
        neutered(): HDNode,
        isNeutered(): boolean,
        constructor(keyPair: ECPair, chainCode: Buffer): void,
        static HIGHEST_BIT: number,
    }

    declare class Transaction {
        version: number,
        locktime: number,
        timestamp?: number,
        ins: Array<Input>,
        outs: Array<Output>,
        versionGroupId: string,
        expiry: number,
        dashType: number,
        dashPayload: number,
        invalidTransaction: boolean,

        constructor(network?: ?Network): void,
        static fromHex(hex: string, network: ?Network): Transaction,
        static fromBuffer(buffer: Buffer, network: ?Network, __noStrict?: boolean): Transaction,
        toHex(): string,
        addInput(hash: Buffer, index: number, sequence?: ?number, scriptSig?: Buffer): void,
        addOutput(scriptPubKey: Buffer, value: number): void,
        getHash(): Buffer,
        toBuffer(): Buffer,
        toHex(): string,
        getId(): string,

        static isCoinbaseHash(buffer: Buffer): boolean,
        isCoinbase(): boolean,
        byteLength(): number,

        joinsplitByteLength(): number,
        joinsplits: Array<any>,

        clone(): Transaction,
        hashForSignature(inIndex: number, prevOutScript: Buffer, hashType: number): Buffer,
        setInputScript(index: number, scriptSig: Buffer): void,
        getExtraData(): ?Buffer,
        isDashSpecialTransaction(): boolean,
        isZcashTransaction(): boolean,
    }

    declare class TransactionBuilder {
        network: Network,
        inputs: Array<Input>,
        tx: Transaction,

        setLockTime(locktime: number): void,
        setVersion(version: number): void,
        addInput(txhash: string | Transaction | Buffer, vout: number, sequence?: number, prevOutScript?: Buffer): void,
        addOutput(scriptPubKey: string | Buffer, value: number): void,
        build(): Transaction,
        buildIncomplete(): Transaction,
        sign(index: number, keyPair: ECPair, redeemScript: Buffer, hashType: number): void,

        static fromTransaction(transaction: Transaction, network: ?Network): TransactionBuilder,

    }

    declare var networks: {[key: string]: Network}
    declare var opcodes: {[key: string]: number}

    declare class ECSignature {
        r: BigInteger,
        s: BigInteger,
        constructor(r: BigInteger, s: BigInteger): void,

        static parseCompact(buffer: Buffer): {
            compressed: boolean,
            i: number,
            signature: Buffer,
        },

        static fromDER(buffer: Buffer): ECSignature,
        static parseScriptSignature(buffer: Buffer): {
            signature: ECSignature,
            hashType: number,
        },

        toCompact(i: number, compressed: boolean): Buffer,
        toDER(): Buffer,
        toScriptSignature(hashType: number): Buffer,
    }

    declare class Block {
        version: number,
        prevHash: Buffer,
        merkleRoot: Buffer,
        timestamp: number,
        bits: number,
        nonce: number,

        getHash(): Buffer,
        getId(): string,
        getUTCDate(): Date,
        toBuffer(headersOnly?: boolean): Buffer,
        toHex(headersOnly?: boolean): string,
        calculateTarget(bits: number): Buffer,
        checkProofOfWork(): boolean,

        static fromBuffer(buffer: Buffer): Block,
        static fromHex(hex: string): Block,
    }

    declare var bufferutils: {
        equal(a: Buffer, b: Buffer): boolean,
        pushDataSize(i: number): number,
        readPushDataInt(buffer: Buffer, offset: number): {
            opcode: number,
            number: number,
            size: number,
        },
        readUInt64LE(buffer: Buffer, offset: number): number,
        readVarInt(buffer: Buffer, offset: number): {
            number: number,
            size: number,
        },
        varIntBuffer(i: number): Buffer,
        varIntSize(i: number): number,
        writePushDataInt(buffer: Buffer, number: number, offset: number): number,
        writeUInt64LE(buffer: Buffer, value: number, offset: number): void,
        writeVarInt(buffer: Buffer, number: number, offset: number): number,
    }

    declare var message: {
        magicHash(message: Buffer | string, network: Network): Buffer,
        sign(pair: ECPair, message: Buffer | string, network: Network): Buffer,
        verify(address: string, signature: Buffer, message: Buffer | string, network: Network): boolean,
    }
}
