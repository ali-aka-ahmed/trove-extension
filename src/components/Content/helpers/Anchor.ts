import { RangyRangeEx } from "@rangy/core";
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
  range: RangyRangeEx;
};

export default Anchor;
