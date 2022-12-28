export interface Brand {
    readonly id: string
    readonly cost?: Cost
    readonly pricing?: Pricing
    readonly licenses?: readonly License[]
}
export interface Cost {
    readonly remain_points?: number
    readonly total_points?: number
    readonly cost_per_day?: number
    readonly create_at?: Date
    readonly last_debit_time?: Date
    readonly next_debit_time?: Date
}
export interface Pricing {
    readonly id: string
    readonly mode?:
    | 'builder'
    | 'manager'
    | string
    readonly charge?: {
        readonly nonadvdev?: number
        readonly advdev?: number
    }
}
export interface License {
    readonly sn: string
}
export interface Device {
    readonly did: string
    readonly manufacturer?:
    | 'advantech'
    | 'unknown'
    | string
}