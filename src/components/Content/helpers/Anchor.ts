
export enum AnchorType {
  Div,
  Point,
  Text
}

type Anchor = {
  type: AnchorType.Text;
  range: string;
};

export default Anchor;
