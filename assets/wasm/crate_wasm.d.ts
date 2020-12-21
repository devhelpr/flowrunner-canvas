/* tslint:disable */
export function init(): void;

export function greet(arg0: string): string;

export enum FlowTask {Nop,Assign,Matrix,SetVariable,GetVariable,GetParameter,Operation,OperationVariable,If,}
export enum FlowTaskCondition {Nop,Equals,LowerEquals,Lower,}
export enum FlowTaskMode {Nop,IntegerMode,FloatMode,StringMode,}
export enum Cell {Dead,Alive,}
export class Universe {
free(): void;

 tick(): void;

static  new(arg0: number, arg1: number, arg2: string): Universe;

 render(): string;

}
export class Flowrunner {
free(): void;

 convert(arg0: string): any;

 test(): void;

static  new(arg0: string, arg1: string): Flowrunner;

}
export class Flow {
free(): void;

}
export class Payload {
free(): void;

}
