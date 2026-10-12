import { memo, useState, type MouseEvent } from "react";
import { CANDY_ICON_URL } from "../../config";
import { DRAGONS } from "../../data/dragons";
import { dragonSpriteUrl, EGG_PLACEHOLDER_URL, elementFlagUrl } from "../../lib/assets";
import { isTarget } from "../../lib/breeding";
import { formatCandy } from "../../lib/format";
import { howToObtainText, labelOf, parseIngredient } from "../../lib/ingredients";
import { NODE_HEIGHT, NODE_WIDTH } from "./layout";

interface Props {
  name: string;
  x: number;
  y: number;
  owned: boolean;
  /** Extra classes from the current focus highlight (" dim", " sel", " down"). */
  highlight: string;
  onSelect: (name: string, e: MouseEvent) => void;
  onToggleOwned: (name: string, e: MouseEvent) => void;
}

const FLAG_X = 84;
const FLAG_STEP = 22;

function tooltip(name: string): string {
  const d = DRAGONS[name] ?? {};
  const how = howToObtainText(name);
  return labelOf(name) + (how ? " = " + how : "") + (d.evolveRequirement ? " (needs " + d.evolveRequirement + ")" : "") + (d.note ? "\n" + d.note : "");
}

/** One dragon box in the breeding graph. */
export const GraphNode = memo(function GraphNode({ name, x, y, owned, highlight, onSelect, onToggleOwned }: Props) {
  const d = DRAGONS[name] ?? {};
  const [spriteFailed, setSpriteFailed] = useState(false);
  const kind = isTarget(name) ? "target" : d.price ? "market" : "nomarket";
  const nameFlags = (d.breedAtNight ? "🌙" : "") + (d.riftOnly ? "🌀" : "");
  const extraRequirements = (d.recipe ?? []).map(parseIngredient).filter((i) => i.kind !== "dragon");

  return (
    <g
      className={`gnode ${kind}${owned ? " owned" : ""}${highlight}`}
      transform={`translate(${x},${y})`}
      data-n={name}
      onClick={(e) => onSelect(name, e)}
    >
      <title>{tooltip(name)}</title>
      <rect className="box" width={NODE_WIDTH} height={NODE_HEIGHT} rx={10} />
      <image
        href={spriteFailed ? EGG_PLACEHOLDER_URL : dragonSpriteUrl(name)}
        x={6} y={9} width={60} height={60}
        preserveAspectRatio="xMidYMid meet"
        onError={() => setSpriteFailed(true)}
      />
      <text x={72} y={24}>{labelOf(name) + (nameFlags ? " " + nameFlags : "")}</text>
      {d.price ? (
        <>
          <image href={CANDY_ICON_URL} x={72} y={32} width={13} height={15} />
          <text className="pr" x={89} y={45}>{formatCandy(d.price)}</text>
        </>
      ) : (
        <text className="pr" x={72} y={45}>not in market</text>
      )}
      {extraRequirements.length > 0 ? (
        <>
          <text className="fl" x={72} y={69}>+</text>
          {extraRequirements.map((ing, i) =>
            ing.kind === "special" ? (
              <text key={i} className="fl" x={FLAG_X + i * FLAG_STEP} y={69}>any {ing.elementCount} elements 🌈</text>
            ) : ing.kind === "element" || ing.kind === "epic" ? (
              <image key={i} href={elementFlagUrl(ing.element)} x={FLAG_X + i * FLAG_STEP} y={56} width={18} height={18}>
                <title>{`any ${ing.element} dragon`}</title>
              </image>
            ) : null,
          )}
        </>
      ) : d.evolvesFrom ? (
        <text className="fl" x={72} y={69}>✨ evolution</text>
      ) : null}
      <g className="gown" aria-pressed={owned} onClick={(e) => onToggleOwned(name, e)}>
        <title>{`Mark ${labelOf(name)} as obtained`}</title>
        <circle cx={NODE_WIDTH - 16} cy={16} r={10} />
        <text x={NODE_WIDTH - 16} y={20.5} textAnchor="middle">✓</text>
      </g>
    </g>
  );
});
