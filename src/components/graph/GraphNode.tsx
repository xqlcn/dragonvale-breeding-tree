import { memo, useState, type MouseEvent } from "react";
import { CURRENCY_ICON_URL } from "../../config";
import { DRAGONS } from "../../data/dragons";
import { dragonSpriteUrl, EGG_PLACEHOLDER_URL, elementFlagUrl, rarityFrameClass } from "../../lib/assets";
import { formatAmount } from "../../lib/format";
import { labelOf, parseIngredient } from "../../lib/ingredients";
import { NODE_HEIGHT, NODE_WIDTH } from "./layout";

interface Props {
  name: string;
  x: number;
  y: number;
  owned: boolean;
  /** On the active list (accent border). */
  target: boolean;
  /** Can be bred right now (every parent obtained): shows a READY tag. */
  ready: boolean;
  /** Extra classes from the current focus highlight (" dim", " sel", " down"). */
  highlight: string;
  onSelect: (name: string, e: MouseEvent) => void;
  onToggleOwned: (name: string, e: MouseEvent) => void;
}

const TEXT_X = 84;
const FLAG_STEP = 20;

/** One dragon box in the breeding graph. Details live in the side panel, so the box stays minimal. */
export const GraphNode = memo(function GraphNode({ name, x, y, owned, target, ready, highlight, onSelect, onToggleOwned }: Props) {
  const d = DRAGONS[name] ?? {};
  const [spriteFailed, setSpriteFailed] = useState(false);
  const kind = target ? "target" : d.price ? "market" : "nomarket";
  const frame = rarityFrameClass(name);
  const extra = (d.recipe ?? []).map(parseIngredient).filter((i) => i.kind === "element" || i.kind === "epic");

  return (
    <g
      className={`gnode ${kind}${owned ? " owned" : ""}${ready ? " ready" : ""}${highlight}`}
      transform={`translate(${x},${y})`}
      data-n={name}
      onClick={(e) => onSelect(name, e)}
    >
      <title>{labelOf(name)}</title>
      <rect className="box" width={NODE_WIDTH} height={NODE_HEIGHT} rx={14} />
      <rect className={`rframe ${frame}`} x={10} y={10} width={62} height={62} rx={12} />
      <image
        href={spriteFailed ? EGG_PLACEHOLDER_URL : dragonSpriteUrl(name)}
        x={13} y={13} width={56} height={56}
        preserveAspectRatio="xMidYMid meet"
        onError={() => setSpriteFailed(true)}
      />
      {ready && (
        <g className="rtag">
          <title>Ready to breed: every parent obtained</title>
          <rect x={14} y={64} width={54} height={16} rx={8} />
          <text x={41} y={75.5} textAnchor="middle">READY</text>
        </g>
      )}
      <text className="nm" x={TEXT_X} y={30}>{labelOf(name)}</text>
      {d.price ? (
        <>
          <image href={CURRENCY_ICON_URL} x={TEXT_X} y={38} width={12} height={14} />
          <text className="pr" x={TEXT_X + 16} y={50}>{formatAmount(d.price)}</text>
        </>
      ) : (
        <text className="pr none" x={TEXT_X} y={50}>Not sold</text>
      )}
      {extra.length > 0 ? (
        extra.map((ing, i) => (
          <image key={i} href={elementFlagUrl(ing.element)} x={TEXT_X + i * FLAG_STEP} y={57} width={16} height={16}>
            <title>{ing.kind === "epic" ? `any ${ing.element} epic` : `any ${ing.element} dragon`}</title>
          </image>
        ))
      ) : d.evolvesFrom ? (
        <text className="fl" x={TEXT_X} y={70}>evolution</text>
      ) : null}
      <g className="gown" role="button" aria-pressed={owned} onClick={(e) => onToggleOwned(name, e)}>
        <title>{owned ? `${labelOf(name)} is obtained` : `Mark ${labelOf(name)} as obtained`}</title>
        <circle cx={NODE_WIDTH - 18} cy={18} r={9} />
        <path d={`M${NODE_WIDTH - 22.5},18.2 l3,3 l6,-6.4`} />
      </g>
    </g>
  );
});
