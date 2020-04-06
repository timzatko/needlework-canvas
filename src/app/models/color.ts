export class Color {
    constructor(public r: number, public g: number, public b: number, public a: number) {}

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}
