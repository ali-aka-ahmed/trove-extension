interface IPoint {
  x: number;
  y: number;
}

export default class Point implements IPoint {
  public x: number;
  public y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public equals = (p: Point): boolean => {
    return this.x === p.x && this.y === p.y;
  }

  public getDistance = (p: Point): number => {
    const offset = this.getOffset(p);
    return Math.sqrt(offset.x * offset.x + offset.y * offset.y);
  }

  public getOffset = (p: Point) => {
    return new Point(this.x - p.x, this.y - p.y);
  }

  public toString = () => {
    return `Point (${this.x}, ${this.y})`;
  }

  public static fromEvent = (e: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent) => {
    const e1 = e as MouseEvent | React.MouseEvent;
    if (e1.clientX !== undefined) return new Point(e1.clientX, e1.clientY);
    const e2 = e as TouchEvent | React.TouchEvent;
    return new Point(e2.touches[0].clientX, e2.touches[0].clientY);
  }

  public static fromJSON = (p: IPoint): Point => {
    return new Point(p.x, p.y);
  }

  public static toJSON = (p: Point): IPoint => {
    return {x: p.x, y: p.y};
  }
}
