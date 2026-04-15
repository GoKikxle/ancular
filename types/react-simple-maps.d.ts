declare module "react-simple-maps" {
  import type { CSSProperties, ReactNode, Ref } from "react";

  export type GeographyStyle = {
    default?: CSSProperties;
    hover?: CSSProperties;
    pressed?: CSSProperties;
  };

  export type GeographyProps = {
    geography: { rsmKey: string; svgPath: string };
    style?: GeographyStyle;
    className?: string;
  };

  export const Geography: React.ForwardRefExoticComponent<
    GeographyProps & React.RefAttributes<SVGPathElement>
  >;

  export type GeographiesRenderArgs = {
    geographies: Array<{ rsmKey: string; svgPath: string }>;
  };

  export type GeographiesProps = {
    geography: unknown;
    children: (args: GeographiesRenderArgs) => ReactNode;
  };

  export const Geographies: React.FC<GeographiesProps>;

  export type MarkerProps = {
    coordinates: [number, number];
    children?: ReactNode;
    className?: string;
  };

  export const Marker: React.ForwardRefExoticComponent<
    MarkerProps & React.RefAttributes<SVGGElement>
  >;

  export type ComposableMapProps = {
    width?: number;
    height?: number;
    projection?: string;
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
    };
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
  };

  export const ComposableMap: React.ForwardRefExoticComponent<
    ComposableMapProps & React.RefAttributes<SVGSVGElement>
  >;
}
