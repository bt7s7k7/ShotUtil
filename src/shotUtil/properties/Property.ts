import { AbstractConstructor, Constructor } from "../../comTypes/types"

type _GetValue<T> = T extends AbstractConstructor<Property<infer U, any>> ? U : never
type _GetOwner<T> = T extends AbstractConstructor<Property<any, infer U>> ? U : never

export abstract class Property<TValue, TOwner> {
    public abstract get value(): TValue
    public abstract set value(value: TValue)

    constructor(
        public readonly owner: TOwner,
    ) { }

    protected static _getSymbol() {
        return Symbol.for("shot-util.property." + this.name)
    }

    public static add<TCtor extends AbstractConstructor, TValue = _GetValue<TCtor>, TOwner = _GetOwner<TCtor>>(this: TCtor, owner: TOwner, value: TValue) {
        (owner as any)[(this as any as typeof Property)._getSymbol()] = new (this as unknown as Constructor<InstanceType<TCtor>>)(owner)
        return value
    }

    public static has<TCtor extends AbstractConstructor, TOwner = _GetOwner<TCtor>>(this: TCtor, owner: TOwner) {
        return (this as any as typeof Property)._getSymbol() in (owner as object)
    }

    public static get<TCtor extends AbstractConstructor, TOwner = _GetOwner<TCtor>>(this: TCtor, owner: TOwner) {
        return (owner as any)[(this as any as typeof Property)._getSymbol()] as InstanceType<TCtor>
    }
}
