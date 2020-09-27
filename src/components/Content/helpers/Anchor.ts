import { IPoint } from "./Point";

export enum AnchorType {
  Div,
  Point,
  Text
}

type Anchor = {
  type: AnchorType.Point;
  location: IPoint;
  bounds: IPoint;
} | {
  type: AnchorType.Text;
  range: string;
};

export default Anchor;
