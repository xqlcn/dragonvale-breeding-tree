import { elementFlagUrl } from "../../lib/assets";
import { FallbackImage } from "./FallbackImage";

export const ElementFlag = ({ element, className = "flag" }: { element: string; className?: string }) => (
  <FallbackImage className={className} src={elementFlagUrl(element)} alt={element} title={element} />
);
